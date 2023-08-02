import { expect } from 'chai';
import { ethers, deployments, getNamedAccounts } from 'hardhat';
import { ERC20 } from '../../../typechain-types';
import { Deployment } from 'hardhat-deploy/types';

/**
 * Test with hardhat-deploy instead of manually deploying. See: https://youtu.be/gyMwXuJrbJQ?t=40376
 * Not sure I like it:
 * Having to call a "global" deployment fixture which has it's own deployer account and contructor args.
 * Everything seems to have implicit knowledge assumed from the fixture. How to test deploying with incorrect constructor args?
 */
describe('ERC20', () => {
  let contract: ERC20;

  beforeEach(async () => {
    const { deployer } = await getNamedAccounts();
    // if harhat-deploy-ethers was installed, could call ethers.getContract('ERC20) and get the most recent deployment
    // const deployment = await deployments.get('ERC20'); // latest deployment
    const { ERC20: deployment } = await deployments.fixture('ERC20'); // runs deploy for tag
    contract = await ethers.getContractAt('ERC20', deployment.address);
  });

  describe('constructor', () => {
    it('sets the correct name and symbol', async () => {
      expect(await contract.name()).to.equal('TestToken');
      expect(await contract.symbol()).to.equal('TTK');
    });
  });
});
