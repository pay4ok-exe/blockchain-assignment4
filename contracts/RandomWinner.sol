// contracts/RandomWinner.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract RandomWinner is Ownable {

    uint256 private totalAmount;
    uint256 private dividend;
    uint256 private divisor;
    uint256 private randomNonce;
    uint256 private minAmount;

    // Simplified constructor to prevent deployment errors
    constructor(address initialOwner) Ownable(initialOwner) {
        dividend = 1;
        divisor = 3;
        randomNonce = 0;
        minAmount = 100000; // Default minimum amount
        totalAmount = 0;
    }

    function max(uint256 a, uint256 b) internal pure returns (uint256) {
        return a > b ? a : b;
    }

    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    function random() private returns (uint256) {
        randomNonce++;
        return uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, randomNonce))) % divisor;
    }

    function configure(uint256 _minAmount, uint256 _dividend, uint256 _divisor) public onlyOwner {
        require(_divisor > 0, "Divisor must be greater than 0");
        require(_dividend <= _divisor, "Dividend must be less than or equal to divisor");
        
        minAmount = _minAmount;
        dividend = _dividend;
        divisor = _divisor;
    }

    // Add funds to the contract
    function addFunds() public payable {
        totalAmount += msg.value;
    }

    function getTotalAmount() public view returns (uint256) {
        return totalAmount;
    }

    function getWinAmount(uint256 amount) public view returns (uint256) {
        uint256 _totalAmount = totalAmount + amount;
        uint256 winAmount = max(min(2 * amount, _totalAmount - minAmount), 0);
        return winAmount;
    }

    function attempt(address payable account) public payable returns (string memory) {
        uint256 amount = msg.value;
        require(amount > 0, "You have to send money.");

        uint256 winAmount = getWinAmount(amount);
        bool isWinner = random() < dividend;

        if (isWinner) {
            require(address(this).balance >= winAmount, "Contract doesn't have enough funds to pay");
            account.transfer(winAmount);
            totalAmount = totalAmount + amount - winAmount;
            return "YOU WON";
        } else {
            totalAmount += amount;
            return "YOU LOST";
        }
    }
}