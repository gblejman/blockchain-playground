import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { expect } from 'chai';

const INITIAL_VALUE = 0;

describe('SimpleStorage', () => {
  const deploy = async () => {
    const initialValue = INITIAL_VALUE;

    const Contract = await ethers.getContractFactory('SimpleStorage');
    const contract = await Contract.deploy(INITIAL_VALUE);

    return { contract, initialValue };
  };

  describe('Deployment', () => {
    it('Should set the initial value', async () => {
      const { contract, initialValue } = await loadFixture(deploy);

      expect(await contract.get()).to.equal(initialValue);
    });
  });

  describe('Interaction', () => {
    it('Should set the value', async () => {
      const { contract, initialValue } = await loadFixture(deploy);

      expect(await contract.get()).to.equal(initialValue);
      const value = initialValue + 1;
      await contract.set(value);
      expect(await contract.get()).to.equal(value);
    });
  });
});
