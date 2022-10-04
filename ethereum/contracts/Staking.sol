pragma solidity ^0.8.0; 

contract Staking {
    address public owner; 
    uint maximumLiquidity = 1000000000000000000; 
    struct Position {
        uint positionID; 
        address walletAddress; 
        uint createdDate; 
        uint unlockedDate; 
        uint percentInterest; 
        uint weiStaked; 
        uint weiInterest; 
        bool opened; 
    }

    Position position ; 
    uint public currentPositionID; 
    mapping(uint => Position) public positions; 
    mapping(address => uint[]) public positionIdByAddress; 
    mapping(uint=> uint) public tiers; 
    uint[] public lockPeriods; 

    constructor() payable {
        owner = msg.sender; 
        currentPositionID = 0; 
        tiers[30] = 700; 
        tiers[90] = 900; 
        tiers[180] = 1200; 
        lockPeriods.push(30); 
        lockPeriods.push(90); 
        lockPeriods.push(180); 

    }

    function stakeEther(uint _numDays) external payable {
        require(tiers[_numDays]>0, "mapping not found"); 
        uint256 totalLoans = address(this).balance + msg.value + calculateInterest(tiers[_numDays], _numDays, msg.value); 
        if(totalLoans>=maximumLiquidity)
        liquidate(); 
        positions[currentPositionID] = Position(currentPositionID, 
        msg.sender, 
        block.timestamp, 
        block.timestamp + (_numDays*1 days), 
        tiers[_numDays], 
        msg.value,
        calculateInterest(tiers[_numDays], _numDays, msg.value), 
        true );
        positionIdByAddress[msg.sender].push(currentPositionID); 
        currentPositionID +=1;  

    }
    function liquidate() private  {

        for (uint256 i=0; i<=currentPositionID; i++) {
            this.closePosition(i); 
            }

    }
    function calculateInterest(uint _basisPoints, uint _numDays, uint _wei) private pure returns(uint){
        return(_basisPoints*_wei/10000); 

    }
    //pure beteken dit raak nie aan die blockchain nie

    function modifyLockPeriods(uint _numDays, uint _basisPoints) external {
        require(owner == msg.sender, "Only owner may modify Staking periods"); 
        tiers[_numDays] = _basisPoints; 
        lockPeriods.push(_numDays); 
    }

    function getLockPeriods() external view returns(uint[] memory) {
        return lockPeriods; 
    }

    function getInterestRates(uint _numDays) external view returns(uint) {
        return tiers[_numDays]; 
    }

    function getPositionById(uint _positionId) external view returns(Position memory ) {
        return positions[_positionId]; 
    }

    function getPositionIdsForAddress(address _wallet) external view returns(uint[] memory){
        return(positionIdByAddress[_wallet]);  

    }

    function changeUnlockDate(uint _positionId, uint _newUnlockDate) external  {
        require(owner == msg.sender, "Only owner may modify Staking periods"); 
        positions[_positionId].unlockedDate = _newUnlockDate; 
    }

    function closePosition (uint _positionId) external  {
        //require(owner == msg.sender, "Only owner may modify Staking periods"); 
        require(positions[_positionId].walletAddress == msg.sender, "Only owner can close position");
        require(positions[_positionId].opened == true, "Position is already closed"); 
        positions[_positionId].opened = false; 

        if(block.timestamp > positions[_positionId].unlockedDate) {
            uint amount = positions[_positionId].weiStaked + positions[_positionId].weiInterest; 
            payable(msg.sender).call{value: amount}(""); 
        } 
        else {
            payable(msg.sender).call{value:positions[_positionId].weiStaked }(""); 

        }

    }
}