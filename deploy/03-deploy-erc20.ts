import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { VERIFICATION_BLOCK_CONFIRMATIONS, isDevelopmentChain } from '../helper-hardhat-config';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, log } = deployments;

  const { deployer } = await getNamedAccounts();

  const name = 'TestToken';
  const symbol = 'TTK';

  const isDev = isDevelopmentChain(hre.network.name);

  await deploy('ERC20', {
    from: deployer,
    args: [name, symbol],
    log: true,
    waitConfirmations: isDev ? 1 : VERIFICATION_BLOCK_CONFIRMATIONS,
  });

  log('Finished.');
};

export default func;

func.tags = ['ERC20', 'all'];
