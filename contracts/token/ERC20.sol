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
    uint256 private _totalSupply;
    address private _owner;
    // mapping of owner to amount
    mapping(address => uint256) private _balances;
    // mapping of owner to spender to amount
    mapping(address => mapping(address => uint256)) _allowances;

    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
        _owner = msg.sender;
        _mint(msg.sender);
    }

    // erc20 does not have an opinion on how the total supply is generated
    function _mint(address owner_) private {
        _totalSupply = 1000000 * 10 ** 18;
        _balances[owner_] = _totalSupply;
    }

    function name() public view returns (string memory) {
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function decimals() public pure returns (uint8) {
        return 18;
    }

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address owner) public view returns (uint256 balance) {
        return _balances[owner];
    }

    function owner() public view returns (address owner) {
        return _owner;
    }

    function transfer(address to, uint256 value) public returns (bool success) {
        _transfer(msg.sender, to, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) public returns (bool success) {
        address spender = msg.sender;
        uint256 currentAllowance = allowance(from, spender);
        require(currentAllowance >= value, "Insufficient Allowance");
        _approve(from, spender, currentAllowance - value);
        _transfer(from, to, value);
        // would allow reentrancy attack: calling transferFrom again before this concludes would find there allowance hasn't decreased in state,
        // and could drain the balance
        // Must first change the state, then execute
        // _approve(from, msg.sender, currentAllowance - value);
        return true;
    }

    function approve(address spender, uint256 value) public returns (bool success) {
        _approve(msg.sender, spender, value);
        return true;
    }

    function allowance(address owner, address spender) public view returns (uint256 remaining) {
        return _allowances[owner][spender];
    }

    function _approve(address owner, address spender, uint256 value) internal {
        _allowances[owner][spender] = value;
        emit Approval(owner, spender, value);
    }

    function _transfer(address from, address to, uint256 value) internal {
        require(from != address(0), "Invalid Sender Address");
        require(to != address(0), "Invalid Receiver Address");
        require(_balances[from] >= value, "Insufficient Balance");
        _balances[from] -= value;
        _balances[to] += value;
        emit Transfer(from, to, value);
    }
}
