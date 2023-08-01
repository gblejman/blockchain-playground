// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";
import "./SimpleStorage.sol";

/**
 * @title SimpleStorageFactory
 * @dev Creates and tracks instances of SimpleStorage by owner. Delegates calls to the owner's contract
 */
contract SimpleStorageFactory {
    /**
     * Mapping of owners to contracts
     */
    mapping(address => SimpleStorage) contracts;

    /**
     * Create instance of contract and store by owner
     */
    function create(uint _value) public returns (SimpleStorage) {
        SimpleStorage delegate = new SimpleStorage(_value);
        contracts[msg.sender] = delegate;
        return delegate;
    }

    // delegate
    function get() public view returns (uint256) {
        // check contract exists for owner - mapping defaults are: any possible address key, any possible contract value
        require(address(contracts[msg.sender]).code.length > 0, "Contract does not exist");
        return contracts[msg.sender].get();
    }

    // delegate
    function set(uint256 _value) public {
        // check contract exists for owner
        require(address(contracts[msg.sender]).code.length > 0, "Contract does not exist");
        contracts[msg.sender].set(_value);
    }
}
