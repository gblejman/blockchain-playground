import 'dotenv/config';
import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import 'hardhat-deploy';
import './tasks';

// TODO: move this to a config file/service and better parsing to types
const ETHEREUM_SEPOLIA_RPC_URL = process.env.ETHEREUM_SEPOLIA_RPC_URL || '';
const ETHEREUM_SEPOLIA_PRIVATE_KEY = process.env.ETHEREUM_SEPOLIA_PRIVATE_KEY; // deployer
const ETHEREUM_SEPOLIA_PRIVATE_KEY_USER1 = process.env.ETHEREUM_SEPOLIA_PRIVATE_KEY_USER1; // user1
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || '';
const REPORT_GAS = process.env.REPORT_GAS !== undefined;
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || '';

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  // check https://chainlist.org/ for a list
  networks: {
    // default in-memory - aka --network hardhat
    hardhat: {
      chainId: 31337,
    },
    // local node @http://127.0.0.1:8545/ - run `npx hardhat node` and use --network localhost
    localhost: {
      chainId: 31337,
    },
    sepolia: {
      url: ETHEREUM_SEPOLIA_RPC_URL,
      accounts: ETHEREUM_SEPOLIA_PRIVATE_KEY ? [ETHEREUM_SEPOLIA_PRIVATE_KEY, ETHEREUM_SEPOLIA_PRIVATE_KEY_USER1] : [],
      chainId: 11155111,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    user1: {
      default: 1,
    },
    user2: {
      default: 2,
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
  gasReporter: {
    enabled: REPORT_GAS,
    currency: 'USD',
    outputFile: 'gas-report.txt',
    noColors: true,
    coinmarketcap: COINMARKETCAP_API_KEY,
  },
  solidity: {
    compilers: [
      {
        version: '0.8.18',
      },
      {
        // Used for "@chainlink/contracts/src/v0.6/tests/MockV3Aggregator.sol";
        version: '0.6.6',
      },
    ],
  },
};

export default config;
