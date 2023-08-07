import { ethers } from 'hardhat';

const USDT_CONTRACT_ADDR = '0xdAC17F958D2ee523a2206206994597C13D831ec7';

const main = async () => {
  const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_MAINNET_RPC_URL);

  const [network, blockNumber] = await Promise.all([provider.getNetwork(), provider.getBlockNumber()]);
  console.log('Using network', await provider.getNetwork());
  console.log('Connection:', { network, blockNumber });

  const signature = 'Transfer(address,address,uint256)';
  const signatureHash = ethers.id(signature); // get keccak256 hash as hex string

  // if we didn't know the contract the event originates from it would

  // Get last 2 transfers emited by this contract
  const logs = await provider.getLogs({
    address: USDT_CONTRACT_ADDR,
    topics: [signatureHash],
    fromBlock: blockNumber - 1,
    toBlock: blockNumber, // defaults to latest
  });

  console.log('*** Raw');
  console.log(logs[0]);

  // parse logs using it's abi
  const abi = [
    {
      inputs: [
        { indexed: true, name: 'from', type: 'address' },
        { indexed: true, name: 'to', type: 'address' },
        { indexed: false, name: 'amount', type: 'uint256' },
      ],
      name: 'Transfer',
      type: 'event',
    },
  ];

  const intrfc = new ethers.Interface(abi);

  console.log('*** Parsed');
  console.log(logs.map(l => intrfc.parseLog(l)));
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
