type NetworkConfigItem = {
  name: string;
  ethUsdPriceFeed?: string;
};

type NetworkConfigMap = {
  [chainId: string]: NetworkConfigItem;
};

export const networkConfig: NetworkConfigMap = {
  default: {
    name: 'hardhat',
  },
  31337: {
    name: 'localhost',
  },
  1: {
    name: 'mainnet',
  },
  11155111: {
    name: 'sepolia',
    // https://docs.chain.link/data-feeds/price-feeds/addresses#Sepolia%20Testnet
    ethUsdPriceFeed: '0x694AA1769357215DE4FAC081bf1f309aDC325306',
  },
};

export const developmentChains: string[] = ['hardhat', 'localhost'];
export const isDevelopmentChain = (name: string) => {
  return developmentChains.includes(name);
};

export const mocks = {
  priceFeed: {
    decimals: 8,
    initialAnswer: 3000 * 1e8,
  },
};
