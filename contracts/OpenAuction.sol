// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;


contract OpenAuction {
    
    
    address payable public beneficiary;
    uint public auctionEndTime;
    uint public startingPrice;
    
    address payable public highestBidder;    
    uint public highestBid;  

    modifier notSeller(){
    
        require(
            msg.sender != beneficiary,
            "Only Buyer can call this"
        );
        _;
    }  
    
    function startAuction(uint _biddingTime, uint _startingPrice) public{
        
        auctionEndTime = block.timestamp + _biddingTime;
        startingPrice = _startingPrice;
        beneficiary = payable(msg.sender);
        highestBid = _startingPrice;
        
    }

    
    function bid() public notSeller payable {
        
        if(block.timestamp > auctionEndTime){
            revert("The auction has already ended");
        }
        
        if(msg.value <= highestBid){
            revert("There is already higher or equal bid");
        }
        
        if(highestBid > startingPrice){
            (highestBidder).transfer(highestBid);  //If error then remove payable
        }

        highestBidder = payable(msg.sender);
        highestBid = msg.value;
    }
    
    function getHighestBid() public returns(uint) {
        return highestBid;   
    }

    function getHighestBidder() public returns(address) {
        return highestBidder;
    } 
  
    
    function auctionEnd() public {
        
        beneficiary.transfer(highestBid);
        highestBid = 0;
        highestBidder = payable(0x0000000000000000000000000000000000000000);

    }
    
}