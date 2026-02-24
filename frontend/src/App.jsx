import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { getProvider, getTokenContract, getFaucetContract } from './utils/contracts';
import { setupEvalInterface } from './utils/eval';
import './App.css';

function App() {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState('0');
  const [canClaim, setCanClaim] = useState(false);
  const [remainingAllowance, setRemainingAllowance] = useState('0');
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [networkOk, setNetworkOk] = useState(true);
  const [currentNetwork, setCurrentNetwork] = useState('');

  const updateData = useCallback(async (addr) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const token = getTokenContract(provider);
      const faucet = getFaucetContract(provider);

      const [bal, claimable, allowance, lastClaim] = await Promise.all([
        token.balanceOf(addr),
        faucet.canClaim(addr),
        faucet.remainingAllowance(addr),
        faucet.lastClaimAt(addr)
      ]);

      setBalance(ethers.formatEther(bal));
      setCanClaim(claimable);
      setRemainingAllowance(ethers.formatEther(allowance));

      const lastClaimTime = Number(lastClaim);
      if (lastClaimTime > 0) {
        const nextClaimTime = lastClaimTime + 24 * 60 * 60;
        const now = Math.floor(Date.now() / 1000);
        setCooldown(Math.max(0, nextClaimTime - now));
      } else {
        setCooldown(0);
      }
    } catch (err) {
      console.error("Failed to update data:", err);
      setError(`Blockchain Error: ${err.message.substring(0, 60)}... Check if you are on Sepolia network.`);
    }
  }, []);

  useEffect(() => {
    setupEvalInterface();
    if (window.ethereum) {
      const checkNetwork = async () => {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const network = await provider.getNetwork();
          const chainId = network.chainId.toString();
          setCurrentNetwork(network.name === 'unknown' ? `Chain ID: ${chainId}` : network.name);
          setNetworkOk(chainId === '11155111');
        } catch (err) {
          console.error("Network check failed:", err);
        }
      };

      // Check immediately and then every 2 seconds
      checkNetwork();
      const interval = setInterval(checkNetwork, 2000);

      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          updateData(accounts[0]);
        } else {
          setAccount(null);
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      const handleChainChanged = () => window.location.reload();
      window.ethereum.on('chainChanged', handleChainChanged);

      let token, faucet, filterTransfer, filterClaim;

      if (account) {
        // Listen for blockchain events
        const provider = new ethers.BrowserProvider(window.ethereum);
        token = getTokenContract(provider);
        faucet = getFaucetContract(provider);

        filterTransfer = token.filters.Transfer(null, account);
        filterClaim = faucet.filters.TokensClaimed(account);

        token.on(filterTransfer, () => updateData(account));
        faucet.on(filterClaim, () => updateData(account));
      }

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        if (token && filterTransfer) token.removeAllListeners(filterTransfer);
        if (faucet && filterClaim) faucet.removeAllListeners(filterClaim);
        clearInterval(interval);
      };
    }
  }, [account, updateData]);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError("Please install MetaMask!");
      return;
    }
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
      await updateData(accounts[0]);
      setError('');
    } catch (err) {
      setError("Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestTokens = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const faucet = getFaucetContract(signer);

      const tx = await faucet.requestTokens();
      setSuccess(`Transaction submitted: ${tx.hash.substring(0, 10)}...`);
      await tx.wait();
      setSuccess("Tokens successfully claimed!");
      await updateData(account);
    } catch (err) {
      console.error(err);
      if (err.reason) {
        setError(err.reason);
      } else if (err.message.includes("user rejected")) {
        setError("Transaction rejected by user");
      } else {
        setError("Transaction failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const switchNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // 11155111 in hex
      });
    } catch (err) {
      if (err.code === 4902) {
        // Network not added to MetaMask
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0xaa36a7',
            chainName: 'Sepolia Test Network',
            nativeCurrency: { name: 'Sepolia ETH', symbol: 'SEP', decimals: 18 },
            rpcUrls: ['https://ethereum-sepolia-rpc.publicnode.com'],
            blockExplorerUrls: ['https://sepolia.etherscan.io']
          }]
        });
      }
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  return (
    <div className="container">
      <div className="glass-card">
        <header>
          <h1>Token Faucet</h1>
          <div className="status-badges">
            <div className="status-badge">
              <span className={`indicator ${account ? 'connected' : 'disconnected'}`}></span>
              {account ? 'Connected' : 'Disconnected'}
            </div>
            {!networkOk && (
              <div className="status-badge error clickable" onClick={switchNetwork} title="Click to switch to Sepolia">
                <span className="indicator disconnected"></span>
                Wrong Network: {currentNetwork} (Click to Switch)
              </div>
            )}
            {networkOk && (
              <div className="status-badge success">
                <span className="indicator connected"></span>
                Sepolia
              </div>
            )}
            {(!import.meta.env.VITE_TOKEN_ADDRESS || import.meta.env.VITE_TOKEN_ADDRESS.includes('0x000')) && (
               <div className="status-badge error">
                 <span className="indicator disconnected"></span>
                 Config Error
               </div>
            )}
          </div>
        </header>

        {account ? (
          <div className="dashboard">
            <div className="info-grid">
              <div className="info-item">
                <label>Wallet Address</label>
                <div className="value address">{account.substring(0, 6)}...{account.substring(38)}</div>
              </div>
              <div className="info-item">
                <label>Token Balance</label>
                <div className="value">{balance} JAN</div>
              </div>
              <div className="info-item">
                <label>Lifetime Allowance</label>
                <div className="value">{remainingAllowance} JAN</div>
              </div>
              <div className="info-item">
                <label>Cooldown</label>
                <div className="value">{cooldown > 0 ? formatTime(cooldown) : 'Ready'}</div>
              </div>
            </div>

            <button 
              className={`primary-btn ${(!canClaim || loading) ? 'disabled' : ''}`}
              onClick={handleRequestTokens}
              disabled={!canClaim || loading}
            >
              {loading ? <span className="loader"></span> : 'Request 10 JAN Tokens'}
            </button>

            {error && <div className="error-msg">{error}</div>}
            {success && <div className="success-msg">{success}</div>}
          </div>
        ) : (
          <div className="connect-prompt">
            <p>Connect your wallet to start claiming JAN tokens from the faucet.</p>
            <button 
              className="primary-btn" 
              onClick={connectWallet}
              disabled={loading}
            >
              {loading ? <span className="loader"></span> : 'Connect Wallet'}
            </button>
            {error && <div className="error-msg">{error}</div>}
          </div>
        )}
        
        <footer>
          <p>Each address can claim 10 tokens every 24 hours. Max lifetime limit is 100 tokens.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
