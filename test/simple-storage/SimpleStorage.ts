import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";

const INITIAL_VALUE = 0;

describe("SimpleStorage", () => {
  const deploy = async () => {
    const Contract = await ethers.getContractFactory("SimpleStorage");
    const contract = await Contract.deploy(INITIAL_VALUE);

    return { contract };
  };

  describe("Deployment", () => {
    it("Should set the initial value", async () => {
      const { contract } = await loadFixture(deploy);

      expect(await contract.get()).to.equal(INITIAL_VALUE);
    });
  });

  describe("Interaction", () => {
    it("Should set the value", async () => {
      const { contract } = await loadFixture(deploy);

      const value = INITIAL_VALUE + 1;
      await contract.set(value);
      expect(await contract.get()).to.equal(value);
    });
  });
});
