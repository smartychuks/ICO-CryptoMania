const {ethers} = require("hardhat")
require("dotenv").config({path: ".env"})
const {CRYPTO_MANIA_NFT_CONTRACT}= require("../constants");

async function main() {
 
  const cryptoManiaNFTContract = CRYPTO_MANIA_NFT_CONTRACT;// Crypto Mania NFT contract address

  
  const cryptoManiaTokenContract = await ethers.getContractFactory(
    "CryptoManiaToken"
  );//thks helps to make new smart contracts

  
  const deployedCryptoManiaTokenContract = await cryptoManiaTokenContract.deploy(cryptoManiaNFTContract);//deploy the contract

  await deployedCryptoManiaTokenContract.deployed();
  
  console.log(
    "Crypto Mania Token Contract Address: ", deployedCryptoManiaTokenContract.address);
}

main()
.then(() => process.exit(0))
.catch((error) => {
  console.error(error);
  process.exit(1);
});