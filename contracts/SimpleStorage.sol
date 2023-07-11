// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";

/**
 * @title SimpleStorage
 * @dev Store and retrieve a number 
 */
contract SimpleStorage {
    uint256 public value;

    constructor(uint _value) {
        console.log('constructor initial value:', _value);
        value = _value;
    }


    function set(uint256 _value) public {
        value = _value;
    }
}