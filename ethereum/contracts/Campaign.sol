pragma solidity ^0.4.26; 

contract campaignFactory{
    address[] public deployedCampaigns; 

    function createCampaign(uint minimum) {
        address _manager = msg.sender; 
        address newCampaign = new Campaign(minimum, _manager); 
        deployedCampaigns.push(newCampaign); 
        
    }

    function getDeployedContracts() public view returns(address[]) {
        return deployedCampaigns; 

    }

}

contract Campaign {

    struct Request {
        string description; 
        uint value; 
        address recipient; 
        bool complete; 
        uint approvalCount; 
        mapping(address => bool) approvals; 

    }
    address public manager; 
    uint public minimumContribution; 
    mapping(address => bool) public approvers; 
    uint public approversCount; 
    Request[] public requests; 

    modifier restricted() {
        require(msg.sender == manager); 
        _; 
    }

     constructor  (uint minimum, address _manager) {
        manager = _manager; 
        minimumContribution = minimum; 
    }

    function contribute () public payable {
        require(msg.value>minimumContribution); 
        approvers[msg.sender] = true; 
        approversCount +=1; 
    }

    function createRequest(string description, uint value, address recipient) 
    public restricted {
        //require(approvers[msg.sender]); 
        Request memory newRequest = 
        Request( {description: description, value: value, recipient: recipient, complete: false, approvalCount: 0 }); 
        requests.push(newRequest); 



    }

    function approveRequest(uint index) public {
        require(approvers[msg.sender]); 
        require(!requests[index].approvals[msg.sender]); 
        requests[index].approvalCount +=1; 
        requests[index].approvals[msg.sender] = true; 

    }
    function finilizeRequest(uint index) public restricted {

        require(requests[index].approvalCount> requests[index].approvalCount/2 ); 
        require(!requests[index].complete); 
        requests[index].recipient.transfer(requests[index].value); 
        requests[index].complete = true; 

    }   

    function getSummary() public view returns(uint, uint, uint, uint, address) {
        return (minimumContribution, 
        this.balance, 
        requests.length, 
        approversCount, 
        manager); 

    }

    function getRequestsCount() public view returns (uint) {
        return requests.length; 
    }


}