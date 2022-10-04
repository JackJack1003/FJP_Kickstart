pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Loan {

//exchange variables
  address owner;
  bytes32[] public whitelistedSymbols;
  mapping(bytes32 => address) public whitelistedTokens;
  mapping(address => mapping(bytes32 => uint256)) public balances;
//staking var begin
      address public owner; 
    uint maximumLiquidity = 1000000000000000000; 
    struct Position {
        uint positionID; 
        address walletAddress;  
        uint weiStaked; 
        bytes32 sentSymbol, 
        uint sentValue
        bool opened; 
    }

    Position position ; 
    uint public currentPositionID; 
    mapping(uint => Position) public positions; 
    mapping(address => uint[]) public positionIdByAddress;  

  constructor() payable{
    owner = msg.sender;
        currentPositionID = 0; 
  }

  function whitelistToken(bytes32 symbol, address tokenAddress) external {
    require(msg.sender == owner, "This function is not public!");

    whitelistedSymbols.push(symbol);
    whitelistedTokens[symbol] = tokenAddress;
  }

  function getWhitelistedSymbols() external view returns(bytes32[] memory) {
    return whitelistedSymbols;
  }

  function getWhitelistedTokenAddress(bytes32 symbol) external view returns(address) {
    return whitelistedTokens[symbol];
  }

  receive() external payable {
    balances[msg.sender]['Eth'] += msg.value;
  }

  function withdrawEther(uint amount) external {
    require(balances[msg.sender]['Eth'] >= amount, 'Insufficient funds');

    balances[msg.sender]['Eth'] -= amount;
    payable(msg.sender).call{value: amount}("");
  }

  function depositTokens(uint256 amount, bytes32 symbol) external {
    balances[msg.sender][symbol] += amount;
    IERC20(whitelistedTokens[symbol]).transferFrom(msg.sender, address(this), amount);
  }

  function withdrawTokens(uint256 amount, bytes32 symbol) external {
    require(balances[msg.sender][symbol] >= amount, 'Insufficient funds');

    balances[msg.sender][symbol] -= amount;
    IERC20(whitelistedTokens[symbol]).transfer(msg.sender, amount);
  }

  function getTokenBalance(bytes32 symbol) external view returns(uint256) {
    return balances[msg.sender][symbol];
  }

//stake code begin

    function stakeEther(bytes32 _symbol, uint _valueSent) external payable {
    
        positions[currentPositionID] = Position(currentPositionID, 
        msg.sender, 
        msg.value,
        _symbol, 
        _sentValue
        true );
        positionIdByAddress[msg.sender].push(currentPositionID); 
        currentPositionID +=1;  

    }

    function getPositionById(uint _positionId) external view returns(Position memory ) {
        return positions[_positionId]; 
    }

    function getPositionIdsForAddress(address _wallet) external view returns(uint[] memory){
        return(positionIdByAddress[_wallet]);  

    }


    function closePosition (uint _positionId) external  {
        //require(owner == msg.sender, "Only owner may modify Staking periods"); 
        require(positions[_positionId].walletAddress == msg.sender, "Only owner can close position");
        require(positions[_positionId].opened == true, "Position is already closed"); 
        positions[_positionId].opened = false; 

            payable(msg.sender).call{value:positions[_positionId].weiStaked }("");
            this.withdrawTokens(positions[_positionId].sentValue, positions[_positionId].sentSymbol);  


        

    }
}