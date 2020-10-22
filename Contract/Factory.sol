pragma solidity ^0.5.0;

import "./KIP/token/KIP7/KIP7Token.sol";
import "./KIP/token/KIP17/KIP17Token.sol";

contract Factory {

    mapping(address => KIP7Token) private KIP7;
    mapping(address => KIP17Token) private KIP17;
    
    address private _owner;
    
    modifier onlyOwner(){
        require (_owner==msg.sender);
        _;
    }
    
    constructor() public {
        _owner=msg.sender;
        KIP17[msg.sender] = new KIP17Token("course","cert");
        KIP7[msg.sender] = new KIP7Token("WhiteDeer","WD", uint8(2),0);
    }

    function mint(address account,uint256 amount) public onlyOwner{
        KIP7Token(KIP7[msg.sender]).mint(account,amount);
    }
    
    function burnFrom(address account, uint256 amount) public onlyOwner{
        KIP7Token(KIP7[msg.sender]).burnFrom(account,amount); 
    }
    
    function balanceOf(address account) public view onlyOwner returns (uint256) {
        return KIP7Token(KIP7[msg.sender]).balanceOf(account);
    } 
    
    function totalSupply() public  view onlyOwner returns (uint256){
        return KIP7Token(KIP7[msg.sender]).totalSupply();
    }
    
    function mintCert(address account,uint8 num,uint256 tokenId) public onlyOwner{
        KIP17Token(KIP17[msg.sender]).mintCert(account,num,tokenId);
    }

    function certData(address account,uint256 tokenId) public view onlyOwner returns(uint8,uint256){
        return KIP17Token(KIP17[msg.sender]).certData(account,tokenId);
    } 
    
}
