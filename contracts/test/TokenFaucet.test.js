const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("TokenFaucet", function () {
  let token;
  let faucet;
  let owner;
  let addr1;
  let addr2;

  const FAUCET_AMOUNT = ethers.parseEther("10");
  const COOLDOWN_TIME = 24 * 60 * 60; // 24 hours
  const MAX_CLAIM_AMOUNT = ethers.parseEther("100");

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const YourToken = await ethers.getContractFactory("YourToken");
    token = await YourToken.deploy(owner.address);
    await token.waitForDeployment();

    const TokenFaucet = await ethers.getContractFactory("TokenFaucet");
    faucet = await TokenFaucet.deploy(await token.getAddress());
    await faucet.waitForDeployment();

    await token.setMinter(await faucet.getAddress());
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await faucet.admin()).to.equal(owner.address);
    });

    it("Should set the token address", async function () {
      expect(await faucet.token()).to.equal(await token.getAddress());
    });
  });

  describe("Faucet functionality", function () {
    it("Should allow a user to claim tokens", async function () {
      await faucet.connect(addr1).requestTokens();
      expect(await token.balanceOf(addr1.address)).to.equal(FAUCET_AMOUNT);
    });

    it("Should emit TokensClaimed event", async function () {
      const tx = await faucet.connect(addr1).requestTokens();
      const timestamp = (await ethers.provider.getBlock(tx.blockNumber)).timestamp;
      await expect(tx)
        .to.emit(faucet, "TokensClaimed")
        .withArgs(addr1.address, FAUCET_AMOUNT, timestamp);
    });

    it("Should revert if user claims during cooldown", async function () {
      await faucet.connect(addr1).requestTokens();
      await expect(faucet.connect(addr1).requestTokens()).to.be.revertedWith(
        "Cooldown period not elapsed"
      );
    });

    it("Should allow user to claim after cooldown", async function () {
      await faucet.connect(addr1).requestTokens();
      await time.increase(COOLDOWN_TIME + 1);
      await faucet.connect(addr1).requestTokens();
      expect(await token.balanceOf(addr1.address)).to.equal(FAUCET_AMOUNT * 2n);
    });

    it("Should revert if lifetime limit reached", async function () {
      // Claim 10 times (10 * 10 = 100)
      for (let i = 0; i < 10; i++) {
        await faucet.connect(addr1).requestTokens();
        await time.increase(COOLDOWN_TIME + 1);
      }
      expect(await token.balanceOf(addr1.address)).to.equal(MAX_CLAIM_AMOUNT);
      
      await expect(faucet.connect(addr1).requestTokens()).to.be.revertedWith(
        "Lifetime claim limit reached"
      );
    });

    it("Should revert if faucet is paused", async function () {
      await faucet.setPaused(true);
      await expect(faucet.connect(addr1).requestTokens()).to.be.revertedWith(
        "Faucet is paused"
      );
    });

    it("Should only allow admin to pause", async function () {
      await expect(faucet.connect(addr1).setPaused(true)).to.be.revertedWith(
        "Only admin can call this function"
      );
    });
  });

  describe("View functions", function () {
    it("canClaim should return correct status", async function () {
      expect(await faucet.canClaim(addr1.address)).to.equal(true);
      await faucet.connect(addr1).requestTokens();
      expect(await faucet.canClaim(addr1.address)).to.equal(false);
      await time.increase(COOLDOWN_TIME + 1);
      expect(await faucet.canClaim(addr1.address)).to.equal(true);
    });

    it("remainingAllowance should return correct value", async function () {
      expect(await faucet.remainingAllowance(addr1.address)).to.equal(MAX_CLAIM_AMOUNT);
      await faucet.connect(addr1).requestTokens();
      expect(await faucet.remainingAllowance(addr1.address)).to.equal(MAX_CLAIM_AMOUNT - FAUCET_AMOUNT);
    });
  });
});
