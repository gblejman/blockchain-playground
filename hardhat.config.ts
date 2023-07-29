import 'dotenv/config';
import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';

const config: HardhatUserConfig = {
  solidity: '0.8.18',
  networks: {
    sepolia: {
      url: process.env.ETHEREUM_SEPOLIA_RPC_URL || '',
      accounts:
        process.env.ETHEREUM_SEPOLIA_PRIVATE_KEY !== undefined ? [process.env.ETHEREUM_SEPOLIA_PRIVATE_KEY] : [],
      chainId: 11155111,
    },
  },
  // hardhat verify --network <NETWORK> <CONTRACT_ADDRESS> <CONSTRUCTOR_PARAMETERS>
  etherscan: {
    apiKey: {
      // npx hardhat verify --list-networks
      sepolia: process.env.ETHERSCAN_API_KEY || '',
      mainnet: process.env.ETHERSCAN_API_KEY || '',
    },
  },
};

export default config;
