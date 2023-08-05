import { expect } from 'chai';
import { ethers, network, deployments, getNamedAccounts } from 'hardhat';
import { ERC20 } from '../../../typechain-types';
import { isDevelopmentChain } from '../../../helper-hardhat-config';

/**
 * Staging Testing: intended for test networks - sepolia etc
 * - Does not deploy contracts, assumes it was already deployed to a test network
 * - Skips the test altogether if specifying a dev network
 * - loadFixture
 */

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

// Only run in test networks, not dev
isDevelopmentChain(network.name)
  ? describe.skip
  : describe('ERC20 Staging Tests', () => {
      // Called per each test manually, in unit tests this is called before each test resetting the evm
      // How to "reset" a test network to a previous known state for independant tests? Via Forking?
      // Would need to clear balances and allowances before each
      async function setup() {
        // if harhat-deploy-ethers was installed, could call ethers.getContract('ERC20) and get the most recent deployment
        // const deployment = await deployments.get('ERC20'); // latest deployment
        const deployment = await deployments.get('ERC20');
        // get latest deployment to the test network
        const contract = await ethers.getContractAt('ERC20', deployment.address);

        // helper: connect named accounts to contract. Instead of contract.connect(user1).transfer() do user1.ERC20.transfer()
        // similar to https://github.com/wighawag/tutorial-hardhat-deploy/blob/main/test/utils/index.ts
        const accounts: Accounts = {};
        for (const [name, address] of Object.entries(await getNamedAccounts())) {
          accounts[name] = { address, ERC20: contract.connect(await ethers.getSigner(address)) };
        }

        return { contract, deployer: accounts.deployer, user1: accounts.user1, user2: accounts.user2, token: TOKEN };
      }

      describe('transfer', () => {
        it('transfers amount to account', async () => {
          const { contract, deployer, user1, token } = await setup(); // previously loadFixture(setup) which works on local networks 'cause it resets the evm

          const value = BigInt(1);
          expect(await contract.balanceOf(deployer.address)).to.equal(token.totalSupply);
          expect(await contract.balanceOf(user1.address)).to.equal(0);
          await deployer.ERC20.transfer(user1.address, value);
          expect(await contract.balanceOf(deployer.address)).to.equal(token.totalSupply - value);
          expect(await contract.balanceOf(user1.address)).to.equal(value);
        });
      });
    });
