import { ethers } from "ethers";
import { getProvider, getTokenContract, getFaucetContract, TOKEN_ADDRESS, FAUCET_ADDRESS } from "./contracts";

export const setupEvalInterface = () => {
  window.__EVAL__ = {
    connectWallet: async () => {
      if (!window.ethereum) throw new Error("MetaMask not installed");
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        if (!accounts || accounts.length === 0) throw new Error("No accounts connected");
        return accounts[0];
      } catch (err) {
        throw new Error(`Wallet connection failed: ${err.message}`);
      }
    },

    requestTokens: async () => {
      if (!window.ethereum) throw new Error("MetaMask not installed");
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const faucet = getFaucetContract(signer);
        const tx = await faucet.requestTokens();
        const receipt = await tx.wait();
        return receipt.hash;
      } catch (err) {
        throw new Error(`Request tokens failed: ${err.reason || err.message}`);
      }
    },

    getBalance: async (address) => {
      if (!window.ethereum) throw new Error("MetaMask not installed");
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const token = getTokenContract(provider);
        const balance = await token.balanceOf(address);
        return balance.toString();
      } catch (err) {
        throw new Error(`Get balance failed: ${err.message}`);
      }
    },

    canClaim: async (address) => {
      if (!window.ethereum) throw new Error("MetaMask not installed");
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const faucet = getFaucetContract(provider);
        return await faucet.canClaim(address);
      } catch (err) {
        throw new Error(`Can claim check failed: ${err.message}`);
      }
    },

    getRemainingAllowance: async (address) => {
      if (!window.ethereum) throw new Error("MetaMask not installed");
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const faucet = getFaucetContract(provider);
        const allowance = await faucet.remainingAllowance(address);
        return allowance.toString();
      } catch (err) {
        throw new Error(`Get allowance failed: ${err.message}`);
      }
    },

    getContractAddresses: async () => {
      return {
        token: TOKEN_ADDRESS,
        faucet: FAUCET_ADDRESS
      };
    }
  };
};

