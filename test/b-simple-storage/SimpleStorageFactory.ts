import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { expect } from 'chai';

const INITIAL_VALUE = 0;

describe('SimpleStorageFactory', () => {
  const deploy = async () => {
    const initialValue = INITIAL_VALUE;

    const Contract = await ethers.getContractFactory('SimpleStorageFactory');
    const contract = await Contract.deploy();
    console.log('contract address', await contract.getAddress());

    const [owner, addr1] = await ethers.getSigners();

    return { contract, initialValue, owner, addr1 };
  };

  describe('Interaction', () => {
    it('Should set the initial value', async () => {
      const { contract, initialValue } = await loadFixture(deploy);

      await contract.create(initialValue);
      expect(await contract.get()).to.equal(initialValue);
    });

    it('Should set the value', async () => {
      const { contract, initialValue } = await loadFixture(deploy);
      await contract.create(initialValue);

      expect(await contract.get()).to.equal(initialValue);
      const value = initialValue + 1;
      await contract.set(value);
      expect(await contract.get()).to.equal(value);
    });

    it('Should revert when contract does not exist', async () => {
      const { contract, initialValue, addr1 } = await loadFixture(deploy);
      await contract.create(initialValue); // default owner

      await expect(contract.connect(addr1).get()).to.be.revertedWith('Contract does not exist');
    });
  });
});
