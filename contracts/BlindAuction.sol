// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

contract BlindAuction {
    
    
    
    address payable public beneficiary;
    uint public auctionEndTime;
    uint public startingPrice;
    
    address payable public highestBidder;
    address payable public currentHighestBidder;
    uint public highestBid;
    uint public currentHighestBid;
    
    address  payable [] public bidders;
    
    mapping(address => uint) public pendingReturns;
    
    bool ended = false;
    uint flag = 0;
    
    modifier notSeller(){
        require(
            
            msg.sender != beneficiary,
            "Seller not allowed to bid"
        );
        _;
    }
    
    function startAuction(uint _biddingTime, uint _startingPrice) public{
        
        auctionEndTime = block.timestamp + _biddingTime;
        startingPrice = _startingPrice;
        beneficiary = payable(msg.sender);
        highestBid = _startingPrice;
        
    }
    
   function getHighestBid() public view returns (uint){
       
       return currentHighestBid;
   }
    
    function getHighestBidder() public view returns (address){
       
       return currentHighestBidder;
    }
   
    
    function bid() public notSeller  payable {
        
        uint temp = 0;
        if(block.timestamp > auctionEndTime){
            revert("The auction has already ended");
        }
        
        if(msg.value <= startingPrice){
            revert("There is already higher or equal bid");
        }
        
        if(msg.value <= highestBid){
            
            pendingReturns[msg.sender] += msg.value;
            for(uint i = 0; i < bidders.length; i+=1){
                if(msg.sender == bidders[i]){
                    temp = 1;
                    break;
                }
            }
            if(temp == 0){
                bidders.push(payable(msg.sender));
            }
            
        }
        
        if(flag == 0){

            highestBidder = payable(msg.sender);
            highestBid = msg.value;            
            flag = 1;
        }
        if(msg.value > highestBid){
            temp = 0;
            
            pendingReturns[highestBidder] += highestBid;
            
            for(uint i = 0; i < bidders.length; i+=1){
                if(msg.sender == bidders[i]){
                    temp = 1;
                    break;
                }
            }
            if(temp == 0){
                bidders.push(payable(msg.sender));
            }
            
            highestBidder = payable(msg.sender);
            highestBid = msg.value;
        }
        
    
    }
    
    function auctionEnd() public {
        
        if(block.timestamp < auctionEndTime){
            revert("The auction has not ended yet");
        }
        
        if(ended){
            revert("The function auctionEnded has already been called");
        }
    
        if(address(this).balance != 0){
            beneficiary.transfer(highestBid);
        }
        
        for(uint i = 0; i < bidders.length; i+=1){
            if(pendingReturns[bidders[i]] != 0){
                bidders[i].transfer((pendingReturns[bidders[i]]));
                pendingReturns[bidders[i]] = 0;
            }
        }
        
        for(uint i = 0; i < bidders.length; i+=1){
            bidders.pop();
        }
        
        currentHighestBidder = highestBidder;
        currentHighestBid = highestBid;

        highestBid = 0;
        highestBidder = payable(0x0000000000000000000000000000000000000000);
    }
    
}