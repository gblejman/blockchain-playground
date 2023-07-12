// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";

/**
 * @title SimpleStorage
 * @dev Store and retrieve a number 
 */
contract SimpleStorage {
    uint256 value;

    constructor(uint _value) {
        console.log('SimpleStorage constructor initial value:', _value);
        value = _value;
    }


    function get() public  view returns (uint256) {
        return value;
    }

    function set(uint256 _value) public {
        value = _value;
    }
}