// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

contract ProductEnlistOpenAuction {
    
    
    address public seller;
    string public name;
    uint public startingPrice;
    string public description;
    uint public duration;
    
    
    function addProduct(string memory _name, uint _startingPrice, string memory _description, uint _duration) public {
        
        seller = msg.sender;
        name = _name;
        startingPrice = _startingPrice;
        description = _description;
        duration = _duration;
    }
    
    function getProduct() public returns(address, string memory, uint, string memory, uint){
        
        return (seller, name, startingPrice, description, duration); 
    }
    
}