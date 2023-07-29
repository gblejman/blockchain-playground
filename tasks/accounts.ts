import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment, TaskArguments } from 'hardhat/types';

task('accounts', 'Prints the list of accounts').setAction(
  async (taskArgs: TaskArguments, hre: HardhatRuntimeEnvironment): Promise<void> => {
    const accounts = await hre.ethers.getSigners();

    for (const account of accounts) {
      console.log(account.address);
    }
  }
);
