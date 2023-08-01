// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/**
 * Custom error
 */
error NotOwner();

/**
 * @title FundMeChainlink
 * @dev Fund a project with minUsd in terms of wei. Only owner can widthdraw
 */
contract FundMeChainlink {
    // chainlink proxy aggregator for ETH/USD @ Sepolia testnet
    AggregatorV3Interface public priceFeed;

    /**
     * Contract owner/deployer
     */
    address public immutable owner;

    /**
     * Minimal contribution
     */
    uint256 public immutable minUsd;

    /**
     * Mapping of funders to amounts
     */
    mapping(address => uint256) fundings;

    /**
     * List of funders - used to reset fundings mapping as no way to reset mappings (wtf)
     */
    address[] funders;

    event Fund(uint256 amount);

    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert NotOwner();
        }
        _;
    }

    constructor(uint256 _minUsd, address _priceFeed) {
        console.log("FundMe minUsd %s, priceFeed %s, owner %s", _minUsd, _priceFeed, msg.sender);
        owner = msg.sender;
        minUsd = _minUsd;
        priceFeed = AggregatorV3Interface(_priceFeed);
    }

    function fund() public payable {
        // Match up everything to use the minimal decimal denominator: wei 18 decimals
        uint256 amountWei = msg.value; // wei, 18 decimals
        uint256 priceEthUsd = uint256(getLatestData() /* 8 decimals */ * 1e10); // 8 + 10 = 18 decimals
        // uint256 priceWei = (amountWei / 1e18) * uint256(priceEthUsd * 1e10) // Same as below, but recommended to always multiply before divide
        uint256 priceWei = (amountWei * priceEthUsd) / 1e18; // Recommended way
        require(priceWei >= minUsd * 1e18, "Must be >= minUsd");
        fundings[msg.sender] += msg.value;
        funders.push(msg.sender);
        emit Fund(msg.value);
    }

    // see https://docs.chain.link/data-feeds/using-data-feeds
    function getLatestData() public view returns (int) {
        // prettier-ignore
        (
            /* uint80 roundID */,
            int answer,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = priceFeed.latestRoundData();

        return answer; // eth/usd is 8 decimals (could call .decimals)
    }

    function withdraw() public onlyOwner {
        // reset fundings
        for (uint256 i = 0; i < funders.length; i++) {
            fundings[funders[i]] = 0;
        }

        // reset funders
        funders = new address[](0);

        // send funds - see https://solidity-by-example.org/sending-ether/

        /**
         * option 1:
         * payable(owner).transfer(address(this).balance); -> no longer recommended, 2300 gas limit, throws error
         */
        /**
         * option 2:
         * bool sent = payable(owner).send(address(this).balance); // -> no longer recommended, 2300 gas, returns bool
         * require(sent, 'Failed to send withdrawal balance');
         */
        (bool sent /*bytes memory data*/, ) = payable(owner).call{value: address(this).balance}("");
        require(sent, "Failed to send withdrawal balance");
    }

    function balanceOf(address _funder) public view returns (uint256 amount) {
        return fundings[_funder];
    }

    // Function to receive Ether. msg.data must be empty
    receive() external payable {
        console.log("receive triggered");
        fund();
    }

    // Fallback function is called when msg.data is not empty
    fallback() external payable {
        console.log("fallback triggered");
        fund();
    }
}
