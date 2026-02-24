import { ethers } from "ethers";

const TOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

const FAUCET_ABI = [
  "function requestTokens() external",
  "function canClaim(address user) public view returns (bool)",
  "function remainingAllowance(address user) public view returns (uint256)",
  "function lastClaimAt(address) public view returns (uint256)",
  "function totalClaimed(address) public view returns (uint256)",
  "function isPaused() public view returns (bool)",
  "event TokensClaimed(address indexed user, uint256 amount, uint256 timestamp)"
];

const TOKEN_ADDRESS = import.meta.env.VITE_TOKEN_ADDRESS;
const FAUCET_ADDRESS = import.meta.env.VITE_FAUCET_ADDRESS;

export const getProvider = () => {
  if (window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  return null;
};

export const getTokenContract = (signerOrProvider) => {
  if (!TOKEN_ADDRESS || TOKEN_ADDRESS === '0x0000000000000000000000000000000000000000') {
    throw new Error("Token address not configured");
  }
  return new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signerOrProvider);
};

export const getFaucetContract = (signerOrProvider) => {
  if (!FAUCET_ADDRESS || FAUCET_ADDRESS === '0x0000000000000000000000000000000000000000') {
    throw new Error("Faucet address not configured");
  }
  return new ethers.Contract(FAUCET_ADDRESS, FAUCET_ABI, signerOrProvider);
};

export { TOKEN_ADDRESS, FAUCET_ADDRESS };
