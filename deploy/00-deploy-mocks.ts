import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { isDevelopmentChain, mocks } from '../helper-hardhat-config';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, log } = deployments;

  const { deployer } = await getNamedAccounts();

  if (isDevelopmentChain(hre.network.name)) {
    await deploy('MockV3Aggregator', {
      from: deployer,
      args: [mocks.priceFeed.decimals, mocks.priceFeed.initialAnswer],
      log: true,
    });
  }

  log('Finished.');
};

export default func;

func.tags = ['MockV3Aggregator', 'all', 'mocks'];
