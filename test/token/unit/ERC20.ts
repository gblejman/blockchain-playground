import { expect } from 'chai';
import { ethers, deployments, getNamedAccounts } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { BaseContract, Contract } from 'ethers';
import { ERC20 } from '../../../typechain-types';

const TOKEN = {
  name: 'TestToken',
  symbol: 'TTK',
  decimals: 18,
  // totalSupply: BigInt(1000000 * 1e18), //  999999999999999983222784n Precision Loss!!
  totalSupply: ethers.parseUnits('1000000', 18), // 1000000000000000000000000n
};

type Accounts = {
  [name: string]: { address: string; ERC20: ERC20 };
};

/**
 * Test with hardhat-deploy instead of manually deploying. See: https://youtu.be/gyMwXuJrbJQ?t=40376
 * Not sure I like it:
 * Having to call a "global" deployment fixture which has it's own deployer account and contructor args.
 * Everything seems to have implicit knowledge assumed from the fixture. How to test deploying with incorrect constructor args?
 */
describe('ERC20', () => {
  async function setup() {
    // if harhat-deploy-ethers was installed, could call ethers.getContract('ERC20) and get the most recent deployment
    // const deployment = await deployments.get('ERC20'); // latest deployment
    const { ERC20: deployment } = await deployments.fixture('ERC20'); // runs deploy for tag, returns {[contractName: T]: Deployment}
    const contract = await ethers.getContractAt('ERC20', deployment.address);

    // helper: connect named accounts to contract. Instead of contract.connect(user1).transfer() do user1.ERC20.transfer()
    // similar to https://github.com/wighawag/tutorial-hardhat-deploy/blob/main/test/utils/index.ts
    const accounts: Accounts = {};
    for (const [name, address] of Object.entries(await getNamedAccounts())) {
      accounts[name] = { address, ERC20: contract.connect(await ethers.getSigner(address)) };
    }

    return { contract, deployer: accounts.deployer, user1: accounts.user1, user2: accounts.user2, token: TOKEN };
  }

  describe('Deployment', () => {
    it('sets the correct name and symbol', async () => {
      const { contract, token } = await loadFixture(setup);

      expect(await contract.name()).to.equal(token.name);
      expect(await contract.symbol()).to.equal(token.symbol);
    });

    it('sets the contract deployer as owner', async () => {
      const { contract, deployer } = await loadFixture(setup);
      expect(await contract.owner()).to.equal(deployer.address);
    });

    it('assigns the total supply to the owner', async () => {
      const { contract, deployer } = await loadFixture(setup);

      const balance = BigInt(await contract.balanceOf(deployer.address));
      const totalSupply = BigInt(await contract.totalSupply());
      expect(balance).to.equal(totalSupply);
    });

    it('emits Transfer event on assigning the total supply to the owner', async () => {
      // How to test deployment events??
    });
  });

  describe('decimals', () => {
    it('gets the decimals', async () => {
      const { contract, token } = await loadFixture(setup);

      const decimals = await contract.decimals();
      expect(decimals).to.equal(token.decimals);
    });
  });

  describe('totalSupply', () => {
    it('gets the total supply', async () => {
      const { contract, token } = await loadFixture(setup);

      expect(await contract.totalSupply()).to.equal(token.totalSupply);
    });
  });

  describe('balanceOf', () => {
    it('gets the balance of an account', async () => {
      const { contract, deployer, user1, token } = await loadFixture(setup);

      expect(await contract.balanceOf(deployer.address)).to.equal(token.totalSupply);
      expect(await contract.balanceOf(user1.address)).to.equal(0);
    });
  });

  describe('transfer', () => {
    it('fails if not account owner', async () => {
      const { contract, deployer, user1 } = await loadFixture(setup);

      // await expect(user1.ERC20.transfer(user1))
    });

    it('fails if account balance < amount to transfer', async () => {
      const { contract, deployer, user1 } = await loadFixture(setup);

      const value = 1;
      expect(await contract.balanceOf(user1.address)).to.equal(0);
      await expect(user1.ERC20.transfer(deployer.address, value)).to.be.revertedWith('Insufficient Balance');
    });

    it('transfers amount to account', async () => {
      const { contract, deployer, user1, token } = await loadFixture(setup);

      const value = BigInt(1);
      expect(await contract.balanceOf(deployer.address)).to.equal(token.totalSupply);
      expect(await contract.balanceOf(user1.address)).to.equal(0);
      await deployer.ERC20.transfer(user1.address, value);
      expect(await contract.balanceOf(deployer.address)).to.equal(token.totalSupply - value);
      expect(await contract.balanceOf(user1.address)).to.equal(value);
    });

    it('emits Transfer event upon transfer success for positive amount', async () => {
      const { contract, deployer, user1 } = await loadFixture(setup);

      const value = BigInt(1);
      await expect(deployer.ERC20.transfer(user1.address, value))
        .to.emit(contract, 'Transfer')
        .withArgs(deployer.address, user1.address, value);
    });

    it('emits Transfer event upon transfer success for zero amount', async () => {
      const { contract, deployer, user1 } = await loadFixture(setup);

      const value = BigInt(0);
      await expect(deployer.ERC20.transfer(user1.address, value))
        .to.emit(contract, 'Transfer')
        .withArgs(deployer.address, user1.address, value);
    });
  });

  describe('allowance', () => {
    it('gets the amount a spender is allowed to withdraw from an account', async () => {
      const { contract, deployer, user1 } = await loadFixture(setup);

      expect(await contract.allowance(user1.address, deployer.address)).to.equal(0);
    });
  });

  describe('approve', () => {
    it('gets the amount a spender is allowed to withdraw from an account', async () => {
      const { contract, deployer, user1 } = await loadFixture(setup);

      const value = BigInt(1);
      expect(await contract.allowance(user1.address, deployer.address)).to.equal(0);
      await expect(user1.ERC20.approve(deployer.address, value))
        .to.emit(contract, 'Approval')
        .withArgs(user1.address, deployer.address, value);
      expect(await contract.allowance(user1.address, deployer.address)).to.equal(value);
    });
  });

  describe('transferFrom', () => {
    it('fails if account owner has not authorized transfers on his behalf', async () => {
      const { deployer, user1, user2 } = await loadFixture(setup);

      const value = BigInt(1);
      await expect(deployer.ERC20.transferFrom(user1.address, user2.address, value)).to.be.revertedWith(
        'Insufficient Allowance'
      );
    });

    it('fails if account owner has not authorized transfers above amount to transfer', async () => {
      const { deployer, user1, user2 } = await loadFixture(setup);

      const value = BigInt(1);
      await user1.ERC20.approve(deployer.address, value);
      await expect(deployer.ERC20.transferFrom(user1.address, user2.address, value + BigInt(1))).to.be.revertedWith(
        'Insufficient Allowance'
      );
    });

    it('fails if account owner has authorized transfers on his behalf but not enough balance', async () => {
      const { deployer, user1, user2 } = await loadFixture(setup);

      const value = BigInt(1);
      await user1.ERC20.approve(deployer.address, value);
      await expect(deployer.ERC20.transferFrom(user1.address, user2.address, value)).to.be.revertedWith(
        'Insufficient Balance'
      );
    });

    it('allows spender to transfer amount', async () => {
      const { contract, deployer, user1, user2 } = await loadFixture(setup);

      const value = BigInt(1);
      expect(await contract.balanceOf(user1.address)).to.equal(0);
      expect(await contract.balanceOf(user2.address)).to.equal(0);
      expect(await contract.allowance(user1.address, deployer.address)).to.equal(0);

      await deployer.ERC20.transfer(user1.address, value);
      expect(await contract.balanceOf(user1.address)).to.equal(value);

      await user1.ERC20.approve(deployer.address, value);
      expect(await contract.allowance(user1.address, deployer.address)).to.equal(value);

      await deployer.ERC20.transferFrom(user1.address, user2.address, value);
      expect(await contract.balanceOf(user1.address)).to.equal(0);
      expect(await contract.balanceOf(user2.address)).to.equal(1);
      expect(await contract.allowance(user1.address, deployer.address)).to.equal(0);
    });
  });
});
