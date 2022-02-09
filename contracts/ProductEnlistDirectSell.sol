// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

contract ProductEnlistDirectSell {
    
    
    address public seller;
    string public name;
    uint public startingPrice;
    string public description;
    
    
    function addProduct(string memory _name, uint _startingPrice, string memory _description) public {
        
        seller = msg.sender;
        name = _name;
        startingPrice = _startingPrice;
        description = _description;
    }
    
    function getProduct() public returns(address, string memory, uint, string memory){
        
        return (seller, name, startingPrice, description); 
    }
    
    
    function getSellerAddress() public returns(address){
        
        return seller;
    }
    
    function removeProduct(uint _id) public returns(bool) {
        
        return true;
    }
    
}