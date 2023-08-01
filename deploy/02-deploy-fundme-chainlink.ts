import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { VERIFICATION_BLOCK_CONFIRMATIONS, isDevelopmentChain, networkConfig } from '../helper-hardhat-config';
import { verify } from '../utils/verify';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, log } = deployments;

  const { deployer } = await getNamedAccounts();

  const minUsd = 10;
  let priceFeed: string;

  const isDev = isDevelopmentChain(hre.network.name);

  if (isDev) {
    const priceFeedMock = await deployments.get('MockV3Aggregator');
    priceFeed = priceFeedMock.address;
  } else {
    priceFeed = networkConfig[hre.network.config.chainId!].ethUsdPriceFeed!;
  }

  await deploy('FundMeChainlink', {
    from: deployer,
    args: [minUsd, priceFeed],
    log: true,
    waitConfirmations: isDev ? 1 : VERIFICATION_BLOCK_CONFIRMATIONS,
  });

  if (!isDev && process.env.ETHERSCAN_API_KEY) {
    const address = (await deployments.get('FundMeChainlink')).address;
    const args = [minUsd, priceFeed];
    await verify(hre, address, args);
  }

  log('Finished.');
};

export default func;

func.tags = ['FundMeChainlink', 'all'];
func.dependencies = ['mocks'];
