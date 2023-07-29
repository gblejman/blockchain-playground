// Requiring ethers directly intead of hardhat just for learning purposes - injected ethers by hardhat plugin has same api
import 'dotenv/config';
import { ethers } from 'ethers';
import { SimpleStorage } from '../../typechain-types';

/**
 * Manual sample of connecting to hardhat network and deploying a contract
 */
const main = async () => {
  console.log('Run npx hardhat node to start the hardhat network...');

  const accountKey = process.env.PRIVATE_KEY || ''; // hardhat account[0]
  const provider = new ethers.JsonRpcProvider(process.env.LOCALHOST_RPC_URL); // printed when running `npx hardhat node`
  const wallet = new ethers.Wallet(accountKey, provider);
  const { abi, bytecode } = require('../../artifacts/contracts/b-simple-storage/SimpleStorage.sol/SimpleStorage.json'); // compiled artifact after `npx hardhat compile`
  const contractFactory = new ethers.ContractFactory(abi, bytecode, wallet);
  const contract = await contractFactory.deploy(1);
  await contract.waitForDeployment();

  console.log('Deployed contract:', contract);
  console.log('Deployment tx:', contract.deploymentTransaction());
  console.log('Contract address:', contract.target);

  // TODO: How to better type contract?
  console.log('Contract value:', await (contract as SimpleStorage).get());
  await (contract as SimpleStorage).set(5);
  console.log('Contract value:', await (contract as SimpleStorage).get());
};

main()
  .then(() => process.exit(0))
  .catch(e => console.log(e));
