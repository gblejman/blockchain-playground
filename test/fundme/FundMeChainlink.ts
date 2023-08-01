import { ethers, network } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { expect } from 'chai';
import { isDevelopmentChain, networkConfig, mocks } from '../../helper-hardhat-config';
import { abi } from '../../artifacts/@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol/AggregatorV3Interface.json';

const MIN_USD = 10;

describe('FundMeChainlink', () => {
  async function deploy() {
    const minUsd = MIN_USD;

    let priceFeed: string;

    // Deploy Mocks in local networks
    if (isDevelopmentChain(network.name)) {
      const { decimals, initialAnswer } = mocks.priceFeed;
      const priceFeedMock = await ethers.deployContract('MockV3Aggregator', [decimals, initialAnswer]);
      await priceFeedMock.waitForDeployment();
      priceFeed = await priceFeedMock.getAddress();
    } else {
      priceFeed = networkConfig[network.config.chainId!].ethUsdPriceFeed;
    }

    console.log('priceFeed:', priceFeed);
    const Contract = await ethers.getContractFactory('FundMeChainlink');
    const contract = await Contract.deploy(minUsd, priceFeed);
    await contract.waitForDeployment();
    console.log('Contract address', await contract.getAddress());

    const [owner, addr1] = await ethers.getSigners();

    // Call price from either mock or actual oracle

    // Fails: when using contract name as there's the mock one v0.6 and prod v0.8, use abi
    // const priceFeedContract = await ethers.getContractAt('AggregatorV3Interface', priceFeed);
    // Please replace AggregatorV3Interface for one of these options wherever you are trying to read its artifact:
    // @chainlink/contracts/src/v0.6/interfaces/AggregatorV3Interface.sol:AggregatorV3Interface
    // @chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol:AggregatorV3Interface

    const priceFeedContract = await ethers.getContractAt(abi, priceFeed);
    const [, priceEthUsd] = await priceFeedContract.latestRoundData();

    const minWei = ((minUsd * 1e18) / (Number(priceEthUsd) / 1e8)).toFixed();

    return { contract, minUsd, minWei, minContrib: Number(minWei), priceFeed, owner, addr1 };
  }

  describe('Deployment', () => {
    it('Should set the minimal usd value', async () => {
      const { contract, minUsd } = await loadFixture(deploy);

      expect(await contract.minUsd()).to.equal(minUsd);
    });

    it('Should set the correct priceFeed', async () => {
      const { contract, priceFeed } = await loadFixture(deploy);

      expect(await contract.priceFeed()).to.equal(priceFeed);
    });

    it('Should set the correct owner', async () => {
      const { contract, owner } = await loadFixture(deploy);

      expect(await contract.owner()).to.equal(owner.address);
    });
  });

  describe('Funding', () => {
    it('Should revert if funding below minUsd', async () => {
      const { contract, minContrib } = await loadFixture(deploy);

      await expect(contract.fund({ value: minContrib - 1 })).to.revertedWith(`Must be >= minUsd`);
    });

    it('Should allow funding above or equal minUsd', async () => {
      const { contract, minContrib, owner, addr1 } = await loadFixture(deploy);

      const provider = ethers.provider;

      // contract balance
      expect(await provider.getBalance(contract.getAddress())).to.equal(0);
      // funder balance
      expect(await contract.balanceOf(owner.address)).to.equal(0);
      expect(await contract.connect(addr1).balanceOf(addr1.address)).to.equal(0);

      await contract.fund({ value: minContrib });
      await contract.connect(addr1).fund({ value: minContrib });

      // contract balance
      expect(await provider.getBalance(contract.getAddress())).to.equal(minContrib * 2);
      // funder balance
      expect(await contract.balanceOf(owner.address)).to.equal(minContrib);
      expect(await contract.connect(addr1).balanceOf(addr1.address)).to.equal(minContrib);
    });

    it('Should emit Fund event', async () => {
      const { contract, minContrib } = await loadFixture(deploy);

      await expect(contract.fund({ value: minContrib }))
        .to.emit(contract, 'Fund')
        .withArgs(minContrib);
    });
  });

  describe('Withdraw', () => {
    it('Should revert if not owner', async () => {
      const { contract, addr1 } = await loadFixture(deploy);

      await expect(contract.connect(addr1).withdraw()).to.revertedWithCustomError(contract, 'NotOwner');
    });

    it('Should allow owner to withdraw balance - changeEtherBalance helper', async () => {
      const { contract, minContrib, owner } = await loadFixture(deploy);

      const provider = ethers.provider;

      // contract balance
      expect(await provider.getBalance(contract.getAddress())).to.equal(0);
      // funder balance
      expect(await contract.balanceOf(owner.address)).to.equal(0);

      await expect(contract.fund({ value: minContrib })).to.changeEtherBalances(
        [owner, contract],
        [-minContrib, minContrib]
      );

      await expect(contract.withdraw()).to.changeEtherBalances([owner, contract], [minContrib, -minContrib]);

      // contract balance
      expect(await provider.getBalance(contract.getAddress())).to.equal(0);
      // funder balance
      expect(await contract.balanceOf(owner.address)).to.equal(0);
    });
  });

  describe('Receive', () => {
    it('Should fund when just sending ether and empty data', async () => {
      const { contract, minContrib, addr1 } = await loadFixture(deploy);

      expect(await contract.balanceOf(addr1.address)).to.equal(0);

      await addr1.sendTransaction({
        to: contract.getAddress(),
        value: minContrib,
        // note no (call) data, no function call, just value ether transfer, triggers receive
      });

      expect(await contract.balanceOf(addr1.address)).to.equal(minContrib);
    });
  });

  describe('Fallback', () => {
    it('Should fund when just sending ether and non empty data', async () => {
      const { contract, minContrib, addr1 } = await loadFixture(deploy);

      expect(await contract.balanceOf(addr1.address)).to.equal(0);

      await addr1.sendTransaction({
        to: contract.getAddress(),
        value: minContrib,
        // note (call) data but inexistent function call, triggers fallback
        data: '0x00',
      });

      expect(await contract.balanceOf(addr1.address)).to.equal(minContrib);
    });
  });
});
