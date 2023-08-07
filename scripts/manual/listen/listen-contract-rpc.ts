import { ethers } from 'hardhat';
import abi from './usdt-abi.json';

const USDT_CONTRACT_ADDR = '0xdAC17F958D2ee523a2206206994597C13D831ec7';

const main = async () => {
  const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_MAINNET_RPC_URL);

  const [network, blockNumber] = await Promise.all([provider.getNetwork(), provider.getBlockNumber()]);
  console.log('Using network', await provider.getNetwork());
  console.log('Connection:', { network, blockNumber });

  provider.on('block', (blockNumber, event) => {
    console.log('provider Block', { blockNumber, event });
  });

  const contract = new ethers.Contract(USDT_CONTRACT_ADDR, abi, provider);

  const [name, decimals, balance, ethBalance] = await Promise.all([
    contract.name(),
    contract.decimals(),
    contract.balanceOf(USDT_CONTRACT_ADDR),
    provider.getBalance(USDT_CONTRACT_ADDR),
  ]);

  console.log('contract info', {
    name,
    decimals,
    balance,
    balanceFormatted: ethers.formatUnits(balance, decimals),
    ethBalance,
  });

  // provider.on({ topics: [ethers.id('Transfer(address,address,uint256)')] }, (from, to, amount, event) => {
  //   console.log('provider Transfer', { from, to, amount: ethers.formatUnits(amount, decimals) });
  //   console.log('provider Transfer event', event);
  // });

  // should be the same as above
  contract.on('Transfer', (from, to, amount, event) => {
    console.log('contract Transfer', { from, to, amount: ethers.formatUnits(amount, decimals) });
    console.log('contract event', event);
  });
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
