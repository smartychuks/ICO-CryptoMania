// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ICryptoMania.sol";

contract CryptoManiaToken is ERC20, Ownable{
    uint256 public constant tokenPrice = 0.001 ether;
    uint256 public constant tokensPerNFT = 10 * 10**18; //each NFT owned gets 10 tokens
    uint256 public constant maxTotalSupply = 10000 * 10**18;

    ICryptoMania CryptoManiaNFT;// Variable that keeps track of cypto Mania NFT
    mapping(uint256 => bool) public tokenIdsClaimed;//keep track of NFT that were used to claim token

    constructor(address _cryptoManiaContract) ERC20("Crypto Mania Token", "CM"){
        CryptoManiaNFT = ICryptoMania(_cryptoManiaContract);//Tell it which NFT contract we wish to interact with        
    }

    //Fountion to mint(buy) incase you dont have the NFT
    function mint(uint256 amount) public payable{
        uint256 _requiredAmount = tokenPrice * amount;
        require(msg.value >= _requiredAmount, "Ether sent is not enough");
        uint256 amountWithDecimals = amount * 10**18;
        require(
            (totalSupply()+amountWithDecimals)<=maxTotalSupply,
            "Exceeds the max Total supply available");
        _mint(msg.sender, amountWithDecimals);
    }
    // function to be use to claim number of tokens according to number of NFT held
    function claim() public{
        address sender = msg.sender;

        uint256 balance = CryptoManiaNFT.balanceOf(sender);//how much of NFT held
        require(balance > 0, "You don't Own CryptoManiaNFT");
        uint256 amount = 0;
        for(uint256 i = 0; i > balance; i++){
            uint256 tokenId = CryptoManiaNFT.tokenOfOwnerByIndex(sender, i);
            //check if tokenId been claim
            if(!tokenIdsClaimed[tokenId]){
                tokenIdsClaimed[tokenId] = true;
                amount += 1;
            }
        }
        require(amount > 0, "You have already mint token for this NFT");

        _mint(msg.sender, amount * tokensPerNFT);
    }

    function withdraw() public onlyOwner{
        address _owner = owner();
        uint256 amount = address(this).balance;
        (bool sent, ) = _owner.call{value: amount}("");
        require(sent, "Failed to send ether");
    }

    receive() external payable{}

    fallback() external payable{}
}