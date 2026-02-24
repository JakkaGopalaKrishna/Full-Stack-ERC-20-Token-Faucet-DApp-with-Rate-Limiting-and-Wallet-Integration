// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IToken {
    function mint(address to, uint256 amount) external;
    function decimals() external view returns (uint8);
}

contract TokenFaucet is ReentrancyGuard {
    IToken public token;
    address public admin;
    bool private _paused;

    uint256 public constant FAUCET_AMOUNT = 10 * 10**18; // 10 tokens
    uint256 public constant COOLDOWN_TIME = 24 hours;
    uint256 public constant MAX_CLAIM_AMOUNT = 100 * 10**18; // 100 tokens max lifetime

    mapping(address => uint256) public lastClaimAt;
    mapping(address => uint256) public totalClaimed;

    event TokensClaimed(address indexed user, uint256 amount, uint256 timestamp);
    event FaucetPaused(bool paused);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    modifier whenNotPaused() {
        require(!_paused, "Faucet is paused");
        _;
    }

    constructor(address _tokenAddress) {
        token = IToken(_tokenAddress);
        admin = msg.sender;
        _paused = false;
    }

    function requestTokens() external whenNotPaused nonReentrant {
        require(block.timestamp >= lastClaimAt[msg.sender] + COOLDOWN_TIME, "Cooldown period not elapsed");
        require(totalClaimed[msg.sender] + FAUCET_AMOUNT <= MAX_CLAIM_AMOUNT, "Lifetime claim limit reached");

        lastClaimAt[msg.sender] = block.timestamp;
        totalClaimed[msg.sender] += FAUCET_AMOUNT;

        token.mint(msg.sender, FAUCET_AMOUNT);

        emit TokensClaimed(msg.sender, FAUCET_AMOUNT, block.timestamp);
    }

    function canClaim(address user) public view returns (bool) {
        if (_paused) return false;
        if (block.timestamp < lastClaimAt[user] + COOLDOWN_TIME) return false;
        if (totalClaimed[user] >= MAX_CLAIM_AMOUNT) return false;
        return true;
    }

    function remainingAllowance(address user) public view returns (uint256) {
        if (totalClaimed[user] >= MAX_CLAIM_AMOUNT) {
            return 0;
        }
        return MAX_CLAIM_AMOUNT - totalClaimed[user];
    }

    function isPaused() public view returns (bool) {
        return _paused;
    }

    function setPaused(bool paused) external onlyAdmin {
        _paused = paused;
        emit FaucetPaused(paused);
    }
}
