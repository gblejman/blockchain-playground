// Requiring ethers directly intead of hardhat just for learning purposes - injected ethers by hardhat plugin has same api
const ethers = require('ethers');

/**
 * Manual sample of connecting to hardhat network and deploying a contract
 */
const main = async () => {
  console.log('Run npx hardhat node to start the hardhat network...');

  const accountKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // hardhat account[0]
  const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545/'); // printed when running `npx hardhat node`
  const wallet = new ethers.Wallet(accountKey, provider);
  const { abi, bytecode } = require('../../artifacts/contracts/b-simple-storage/SimpleStorage.sol/SimpleStorage.json'); // compiled artifact after `npx hardhat compile`
  const contractFactory = new ethers.ContractFactory(abi, bytecode, wallet);
  const contract = await contractFactory.deploy(1);
  await contract.waitForDeployment();

  console.log('Deployed contract:', contract);
  console.log('Deployment tx:', contract.deploymentTransaction());
  console.log('Contract address:', contract.target);
};

main()
  .then(() => process.exit(0))
  .catch(e => console.log(e));
