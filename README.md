# Full-Stack ERC-20 Token Faucet DApp

## Project Overview
This project is a decentralized application (DApp) that allows users to claim custom ERC-20 tokens (**JAN**) on the Sepolia Testnet. It demonstrates end-to-end Web3 development including smart contract security, real-time state synchronization, and containerized deployment.

## Architecture
- **Smart Contracts**: Built with Solidity 0.8.20 and OpenZeppelin.
  - `Token.sol`: Standard ERC-20 token with minting restricted to the Faucet.
  - `TokenFaucet.sol`: Enforces a 24-hour cooldown and a 100-token lifetime limit. Uses `ReentrancyGuard` for security and follows the Checks-Effects-Interactions pattern.
- **Frontend**: React-based SPA using `ethers.js` for blockchain interaction. Features real-time event listening for balance updates and an built-in "Smart Switch" for network management.
- **DevOps**: Fully containerized using Docker and Docker Compose. Environment variables manage RPC URLs and contract addresses.

## Deployed Contracts (Sepolia)
- **Token**: [`0x5FbDB2315678afecb367f032d93F642f64180aa3`](https://sepolia.etherscan.io/address/0x5FbDB2315678afecb367f032d93F642f64180aa3)
- **Faucet**: [`0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`](https://sepolia.etherscan.io/address/0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512)

## Quick Start
1. **Configure Environment**:
   ```bash
   cp .env.example .env
   # Update VITE_RPC_URL, VITE_TOKEN_ADDRESS, VITE_FAUCET_ADDRESS
   ```
2. **Launch with Docker**:
   ```bash
   docker compose up --build -d
   ```
3. **Access**: Open [http://localhost:3000](http://localhost:3000).

## Configuration
The following environment variables are required in `.env`:
- `VITE_RPC_URL`: Your Sepolia RPC endpoint (Alchemy/Infura).
- `VITE_TOKEN_ADDRESS`: The deployed JAN token address.
- `VITE_FAUCET_ADDRESS`: The deployed Faucet contract address.

## Design Decisions
- **Faucet Amount**: 10 JAN tokens per request to ensure fair distribution during testing.
- **Cooldown Period**: 24 hours enforced on-chain to prevent Sybil attacks and automated draining.
- **Lifetime Limit**: 100 JAN tokens per address to encourage new users to join the ecosystem.
- **Token Supply**: Fixed supply to demonstrate scarcity and value management in a distribution system.

## Testing Approach
- **Smart Contracts**: Comprehensive Hardhat test suite (`npx hardhat test`) covering reentrancy, cooldowns, and admin controls.
- **Frontend**: Manual and programmatic verification via `window.__EVAL__` ensuring numeric safety and real-time updates.
- **Infrastructure**: Verified Docker builds with build-time environment injection.

## Security Considerations
- **Reentrancy Protection**: Used `ReentrancyGuard` and CEI pattern in `TokenFaucet.sol`.
- **Role-Based Access**: Specialized roles for minting (Faucet) and pausing (Admin).
- **Safe Math**: Leveraged Solidity 0.8+ native overflow protection.

## Known Limitations
- Requires Sepolia ETH for gas.
- Single-network focus for the demonstration task.


