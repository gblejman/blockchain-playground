import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";

const MIN_CONTRIB = 1;

describe("FundMe", () => {
  const deploy = async () => {
    const minContrib = MIN_CONTRIB;

    const Contract = await ethers.getContractFactory("FundMe");
    const contract = await Contract.deploy(minContrib);

    return { contract, minContrib };
  };

  describe("Deployment", () => {
    it("Should set the minimal contribution value", async () => {
      const { contract, minContrib } = await loadFixture(deploy);

      expect(await contract.minContrib()).to.equal(minContrib);
    });
  });

  describe("Funding", () => {
    it("Should revert if funding below min contrib", async () => {
      const { contract, minContrib } = await loadFixture(deploy);

      await expect(contract.fund({ value: minContrib - 1 })).to.revertedWith(
        `Must be >= min contrib`
      );
    });

    it("Should allow funding above or equal min contrib", async () => {
      const { contract, minContrib } = await loadFixture(deploy);

      // TODO: better validation with balances
      await expect(contract.fund({ value: minContrib })).not.to.be.reverted;
    });
  });
});
