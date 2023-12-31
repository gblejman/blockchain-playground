// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";

/**
 * Custom error
 */
error NotOwner();

/**
 * @title FundMe
 * @dev Fund a project with minContrib >= wei amount. Only owner can widthdraw
 */
contract FundMe {
    /**
     * Contract owner/deployer
     */
    address public immutable owner;

    /**
     * Minimal contribution
     */
    uint256 public immutable minContrib;

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

    constructor(uint256 _minContrib) {
        console.log("FundMe min contrib %s, owner %s", _minContrib, msg.sender);
        owner = msg.sender;
        minContrib = _minContrib;
    }

    function fund() public payable {
        require(msg.value >= minContrib, "Must be >= min contrib");
        fundings[msg.sender] += msg.value;
        funders.push(msg.sender);
        emit Fund(msg.value);
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
