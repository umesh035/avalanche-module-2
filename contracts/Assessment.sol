// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event InsurancePurchased(uint256 premium);
    event InsuranceClaimFiled(address indexed owner, uint256 claimAmount);

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    function getBalance() public view returns (uint256) {
        return balance;
    }

    function deposit(uint256 _amount) public payable {
        require(msg.sender == owner, "You are not the owner of this account");
        uint256 _previousBalance = balance;

        balance += _amount;

        assert(balance == _previousBalance + _amount);

        emit Deposit(_amount);
    }

    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        uint256 _previousBalance = balance;

        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }

        balance -= _withdrawAmount;

        assert(balance == (_previousBalance - _withdrawAmount));

        emit Withdraw(_withdrawAmount);
    }

    function purchaseInsurance(uint256 _premium) public payable {
        require(msg.sender == owner, "You are not the owner of this account");
        require(msg.value == _premium, "Incorrect premium amount sent");
        emit InsurancePurchased(_premium);
    }

    function fileInsuranceClaim(uint256 _claimAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        emit InsuranceClaimFiled(msg.sender, _claimAmount);
    }
}
