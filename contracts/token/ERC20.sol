// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";
import "./IERC20.sol";

/**
 * @title ERC20
 * @notice Vanilla impl of erc20 standard: https://eips.ethereum.org/EIPS/eip-20
 */
contract ERC20 is IERC20 {
    // https://docs.soliditylang.org/en/latest/style-guide.html#avoiding-naming-collisions
    // can not have variables and functions named the same
    string private _name;
    string private _symbol;

    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    }

    function name() public view returns (string memory) {
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function decimals() public view returns (uint8) {
        return 18;
    }

    function totalSupply() public view returns (uint256) {
        return 0;
    }

    function balanceOf(address _owner) public view returns (uint256 balance) {
        return 0;
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        return true;
    }

    function approve(address _spender, uint256 _value) public returns (bool success) {
        return true;
    }

    function allowance(address _owner, address _spender) public view returns (uint256 remaining) {
        return 0;
    }
}
