// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";

/**
 * @title FundMe
 * @dev Fund a project. Only owner can widthraw
 */
contract FundMe {

    uint256 public minContrib;
    
    constructor(uint256 _minContrib) {
        console.log('FundMe min contrib:', _minContrib);
        minContrib = _minContrib;
    }

    function fund() public payable {
        require(msg.value >= minContrib, 'Must be >= min contrib');
    }
    function withdraw() public {}
}
