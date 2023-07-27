import { ethers, network } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";

const MIN_CONTRIB = 1;

describe("FundMe", () => {
  const deploy = async () => {
    const minContrib = MIN_CONTRIB;

    const Contract = await ethers.getContractFactory("FundMe");
    const contract = await Contract.deploy(minContrib);

    const [owner, addr1] = await ethers.getSigners();

    return { contract, minContrib, owner, addr1 };
  };

  describe("Deployment", () => {
    it("Should set the minimal contribution value", async () => {
      const { contract, minContrib } = await loadFixture(deploy);

      expect(await contract.minContrib()).to.equal(minContrib);
    });

    it("Should set the correct owner", async () => {
      const { contract, owner } = await loadFixture(deploy);

      expect(await contract.owner()).to.equal(owner.address);
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
      const { contract, minContrib, owner, addr1 } = await loadFixture(deploy);

      const provider = ethers.provider;

      // contract balance
      expect(await provider.getBalance(contract.getAddress())).to.equal(0);
      // funder balance
      expect(await contract.balanceOf(owner.address)).to.equal(0);
      expect(await contract.connect(addr1).balanceOf(addr1.address)).to.equal(
        0
      );

      await contract.fund({ value: minContrib });
      await contract.connect(addr1).fund({ value: minContrib });

      // contract balance
      expect(await provider.getBalance(contract.getAddress())).to.equal(
        minContrib * 2
      );
      // funder balance
      expect(await contract.balanceOf(owner.address)).to.equal(minContrib);
      expect(await contract.connect(addr1).balanceOf(addr1.address)).to.equal(
        minContrib
      );
    });

    it("Should emit Fund event", async () => {
      const { contract, minContrib } = await loadFixture(deploy);

      await expect(contract.fund({ value: minContrib }))
        .to.emit(contract, "Fund")
        .withArgs(minContrib);
    });
  });

  describe("Withdraw", () => {
    it("Should revert if not owner", async () => {
      const { contract, addr1 } = await loadFixture(deploy);

      await expect(
        contract.connect(addr1).withdraw()
      ).to.revertedWithCustomError(contract, "NotOwner");
    });

    it("Should allow owner to withdraw balance - changeEtherBalance helper", async () => {
      const { contract, minContrib, owner } = await loadFixture(deploy);

      const provider = ethers.provider;

      // contract balance
      expect(await provider.getBalance(contract.getAddress())).to.equal(0);
      // funder balance
      expect(await contract.balanceOf(owner.address)).to.equal(0);

      await expect(contract.fund({ value: minContrib })).to.changeEtherBalances(
        [owner, contract],
        [-minContrib, minContrib]
      );

      await expect(contract.withdraw()).to.changeEtherBalances(
        [owner, contract],
        [minContrib, -minContrib]
      );

      // contract balance
      expect(await provider.getBalance(contract.getAddress())).to.equal(0);
      // funder balance
      expect(await contract.balanceOf(owner.address)).to.equal(0);
    });
  });
});
