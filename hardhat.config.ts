import 'dotenv/config';
import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import './tasks';

// TODO: move this to a config file/service
const ETHEREUM_SEPOLIA_RPC_URL = process.env.ETHEREUM_SEPOLIA_RPC_URL || '';
const ETHEREUM_SEPOLIA_PRIVATE_KEY = process.env.ETHEREUM_SEPOLIA_PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || '';

const config: HardhatUserConfig = {
  solidity: '0.8.18',
  defaultNetwork: 'hardhat',
  // check https://chainlist.org/ for a list
  networks: {
    hardhat: {
      chainId: 31337,
    },
    sepolia: {
      url: ETHEREUM_SEPOLIA_RPC_URL,
      accounts: ETHEREUM_SEPOLIA_PRIVATE_KEY ? [ETHEREUM_SEPOLIA_PRIVATE_KEY] : [],
      chainId: 11155111,
    },
  },
  // hardhat verify --network <NETWORK> <CONTRACT_ADDRESS> <CONSTRUCTOR_PARAMETERS>
  etherscan: {
    apiKey: {
      // npx hardhat verify --list-networks
      mainnet: ETHERSCAN_API_KEY,
      sepolia: ETHERSCAN_API_KEY,
    },
  },
};

export default config;
