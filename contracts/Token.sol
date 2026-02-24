// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract YourToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 1000000 * 10**18; // 1 Million tokens
    address public minter;

    event MinterUpdated(address indexed oldMinter, address indexed newMinter);

    constructor(address _faucet) ERC20("Janardhan Token", "JAN") Ownable(msg.sender) {
        minter = _faucet;
        emit MinterUpdated(address(0), _faucet);
    }

    function setMinter(address _minter) external onlyOwner {
        address oldMinter = minter;
        minter = _minter;
        emit MinterUpdated(oldMinter, _minter);
    }

    function mint(address to, uint256 amount) external {
        require(msg.sender == minter, "Only minter can call this function");
        require(totalSupply() + amount <= MAX_SUPPLY, "Would exceed max supply");
        _mint(to, amount);
    }
}
