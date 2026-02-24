const hre = require("hardhat");

async function main() {
  console.log("Deploying contracts...");

  // We need to deploy the Faucet first to get its address if Token requires it in constructor
  // Or deploy Token first and then update its minter.
  
  // Strategy: Deploy Token with a dummy address first, then deploy Faucet, then update Token's minter.
  // Actually, Token constructor takes faucet address.
  
  // We can use a pattern where we predict address or just deploy them with null/dummy and update.
  // Best: Deploy YourToken, then TokenFaucet, then call token.setMinter(faucet.address).
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy Token
  const YourToken = await hre.ethers.getContractFactory("YourToken");
  // Pass deployer as temporary faucet address
  const token = await YourToken.deploy(deployer.address);
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("Token deployed to:", tokenAddress);

  // Deploy Faucet
  const TokenFaucet = await hre.ethers.getContractFactory("TokenFaucet");
  const faucet = await TokenFaucet.deploy(tokenAddress);
  await faucet.waitForDeployment();
  const faucetAddress = await faucet.getAddress();
  console.log("Faucet deployed to:", faucetAddress);

  // Update Token's minter to Faucet
  console.log("Setting minter to faucet...");
  const tx = await token.setMinter(faucetAddress);
  await tx.wait();
  console.log("Minter updated.");

  console.log("Deployment complete.");
  console.log("------------------");
  console.log("Token Address:", tokenAddress);
  console.log("Faucet Address:", faucetAddress);
  console.log("------------------");

  // Verify contracts if on Sepolia
  if (hre.network.name === "sepolia") {
    console.log("Verifying contracts on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: tokenAddress,
        constructorArguments: [deployer.address],
      });
      await hre.run("verify:verify", {
        address: faucetAddress,
        constructorArguments: [tokenAddress],
      });
    } catch (e) {
      console.error("Verification failed:", e);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
