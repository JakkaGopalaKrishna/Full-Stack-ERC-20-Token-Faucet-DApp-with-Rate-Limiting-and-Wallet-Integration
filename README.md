# Full-Stack ERC-20 Token Faucet DApp

## Project Overview
This project is a decentralized application (DApp) that allows users to claim custom ERC-20 tokens (**JAN**) on the Sepolia Testnet. It demonstrates end-to-end Web3 development including smart contract security, real-time state synchronization, and containerized deployment.

## Architecture
- **Smart Contracts**: Built with Solidity 0.8.20 and OpenZeppelin.
  - `Token.sol`: Standard ERC-20 token with minting restricted to the Faucet.
  - `TokenFaucet.sol`: Enforces a 24-hour cooldown and a 100-token lifetime limit. Uses `ReentrancyGuard` for security and follows the Checks-Effects-Interactions pattern.
- **Frontend**: React-based SPA using `ethers.js` for blockchain interaction. Features real-time event listening for balance updates and an built-in "Smart Switch" for network management.
- **DevOps**: Fully containerized using Docker and Docker Compose. Environment variables manage RPC URLs and contract addresses.

## Visual Artifacts (Screenshots)

### 1. Wallet Connection & Gas Funding
Verified wallet connection and initial Sepolia ETH funding for gas fees.
![Wallet Connection](screenshots/metamusk%20account%20sepolia%20creditted.png)

### 2. Transaction Request
MetaMask interaction when requesting tokens from the local frontend service.
![Transaction Request](screenshots/transcation%20request%20from%20localhost.png)

### 3. Faucet Processing (Queue)
Real-world verification of the claim request being handled via the Sepolia infrastructure.
![Processing Queue](screenshots/claiming%20in%20queue%20sepolia.png)

### 4. Claim Confirmation
Successful confirmation of the token distribution on the Sepolia network.
![Claim Confirmed](screenshots/sepolia%20claiming%20done%20.png)

### 5. Final Token Balance
Final verification showing 10 JAN tokens successfully credited to the user's balance.
![Final Balance](screenshots/tracation%20completed%2010.png)

## Deployed Contracts (Sepolia)
- **Token**: [`0xd2732154880d82E3dbEFb726E70da5b9f59b4789`](https://sepolia.etherscan.io/address/0xd2732154880d82E3dbEFb726E70da5b9f59b4789)
- **Faucet**: [`0x2981bde59DF3781eAB459001DeEAA21D64f8d673`](https://sepolia.etherscan.io/address/0x2981bde59DF3781eAB459001DeEAA21D64f8d673)

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


