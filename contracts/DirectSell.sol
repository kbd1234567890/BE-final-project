
// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

contract DirectSell {
    
    uint public value;
    address payable public seller;
    address payable public buyer;
    enum State {Created, Locked, Inactive}


    State public state;

    modifier notSeller(){
    
        require(
            msg.sender != seller,
            "Only Buyer can Call this"
        );
        _;
    }
    
    function sellerTrans() public payable{
        
        seller = payable(msg.sender);
        value = msg.value / 2;
        
        require(2 * value == msg.value);
    }
    
    modifier condition(bool _condition){
        require(_condition);
        _;
    }
    
    modifier onlyBuyer() {
        require(
            msg.sender == buyer,
            "Only buyer can call this."
        );
        _;
    }
    
    modifier onlySeller() {
        require(
            msg.sender == seller,
            "Only seller can call this."
        );
        _;
    }
    
    modifier inState(State _state) {
        require(
            state == _state,
            "Invalid state."
        );
        _;
    }
    
    event Aborted();
    event PurchaseConfirmed();
    event ItemReceived();
    
    function abort() public onlySeller inState(State.Created){
    
        emit Aborted();
        
        state = State.Inactive;
        seller.transfer(address(this).balance);
    }
    
    function purchaseConfirmed() 
        public 
        notSeller
        inState(State.Created) 
        condition(msg.value == (2 * value)) 
        payable
    {
        
        emit PurchaseConfirmed();
        buyer = payable(msg.sender);
        state = State.Locked;
    }
    
    
    function confirmReceived()
        external
        onlyBuyer
        inState(State.Locked)
    {
        emit ItemReceived();

        state = State.Inactive;

        buyer.transfer(value);
        seller.transfer(address(this).balance);
        
        state = State.Created;
    }
}





