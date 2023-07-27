// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/**
 * @title FundMe
 * @dev Fund a project. Only owner can widthdraw
 */
contract FundMeChainlink {
    // chainlink proxy aggregator for ETH/USD @ Sepolia testnet
    AggregatorV3Interface dataFeed;
    uint256 public minContrib;
    
    constructor(uint256 _minContrib) {
        console.log('FundMe min contrib:', _minContrib);
        minContrib = _minContrib;
        dataFeed = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
    }

    function fund() public payable {
        require(msg.value >= minContrib, 'Must be >= min contrib');
    }

    function withdraw() public {}

    // see https://docs.chain.link/data-feeds/using-data-feeds
    function getLatestData() public view returns (int) {
        // prettier-ignore
        (
            /* uint80 roundID */,
            int answer,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = dataFeed.latestRoundData();

        // console.log('getLatestData', answer);
        return answer;
    }
}
