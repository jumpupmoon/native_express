pragma solidity ^0.5.0;

import "./KIP7Token.sol";
import "./KIP17Token.sol";

contract Factory {

    KIP7Token private KIP7;
    KIP17Token private KIP17;
    
    address private _owner;
    
    modifier onlyOwner(){
        require (_owner==msg.sender);
        _;
    }
    
    constructor() public {
        _owner=msg.sender;
        KIP17 = new KIP17Token("course","cert");
        KIP7 = new KIP7Token("WhiteDeer","WD", uint8(0),0);
    }

    function mint(address account,uint256 amount) public onlyOwner{
        KIP7Token(KIP7).mint(account,amount);
    }
    
    function burnFrom(address account, uint256 amount) public onlyOwner{
        KIP7Token(KIP7).burnFrom(account,amount); 
    }
    
    function balanceOf(address account) public view onlyOwner returns (uint256) {
        return KIP7Token(KIP7).balanceOf(account);
    } 
    
    function totalSupply() public  view onlyOwner returns (uint256){
        return KIP7Token(KIP7).totalSupply();
    }
    
    function mintCert(address account,uint8 num,uint256 tokenId) public onlyOwner{
        KIP17Token(KIP17).mintCert(account,num,tokenId);
    }

    function certData(address account,uint256 tokenId) public view onlyOwner returns(uint8,uint256){
        return KIP17Token(KIP17).certData(account,tokenId);
    } 
    
}
