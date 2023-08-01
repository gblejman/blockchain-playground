import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { isDevelopmentChain, networkConfig } from '../helper-hardhat-config';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, log } = deployments;

  const { deployer } = await getNamedAccounts();

  const minUsd = 10;
  let priceFeed: string;

  if (isDevelopmentChain(hre.network.name)) {
    const priceFeedMock = await deployments.get('MockV3Aggregator');
    priceFeed = priceFeedMock.address;
  } else {
    priceFeed = networkConfig[hre.network.config.chainId!].ethUsdPriceFeed!;
  }

  await deploy('FundMeChainlink', {
    contract: 'FundMeChainlink',
    from: deployer,
    args: [minUsd, priceFeed],
    log: true,
  });

  log('Finished.');
};

export default func;

func.tags = ['FundMeChainlink', 'all'];
func.dependencies = ['mocks'];
