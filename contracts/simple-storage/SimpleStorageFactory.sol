// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";
import "./SimpleStorage.sol";

/**
 * @title SimpleStorageFactory
 * @dev Creates an instance of SimpleStorage
 */
contract SimpleStorageFactory {
    SimpleStorage simpleStorage;

    constructor(uint _value) {
        console.log('SimpleStorageFactory constructor initial value:', _value);
        simpleStorage = new SimpleStorage(_value);
    }

    // delegate
    function get() public  view returns (uint256) {
        return simpleStorage.get();
    }

    // delegate
    function set(uint256 _value) public {
        simpleStorage.set(_value);
    }
}