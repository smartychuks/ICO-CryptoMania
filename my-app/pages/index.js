import Head from 'next/head'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react';
import styles from '../styles/Home.module.css'
import Web3Modal from 'web3modal'
import { BigNumber, Contract, utils, providers } from 'ethers'
import{TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, NFT_CONTRACT_ABI, NFT_CONTRACT_ADDRESS} from'../constants'


export default function Home() {

  const [walletConnected, setWalletConnected] = useState(false);
  const zero = BigNumber.from(0);
  const [tokensMinted, setTokenMinted] = useState(zero);
  const [balanceOfCryptoManiaToken, setBalanceOfCryptoManiaToken] = useState(zero);
  const [tokenAmount, setTokenAmount] = useState(zero);
  const [loading, setLoading] = useState(false);
  const [tokensToBeClaimed, setTokensToBeClaimed] = useState(zero);
  const [isOwner, setIsOwner] = useState(false);
  const web3ModalRef = useRef();

  

  const getTokensToBeClaimed = async() =>{
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      )

      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();
      const balance = await nftContract.balanceOf(address);

      if(balance === zero){
        setTokensToBeClaimed(zero);
      }else{
        var amount = 0;
        for(var i = 0; i < balance; i++){
          const tokenId = await nftContract.tokenOfOwnerByIndex(address, i);
          const claimed = await tokenContract.tokenIdsClaimed(tokenId);
          if(!claimed){
            amount++;
          }
        }
        setTokensToBeClaimed(BigNumber.from(amount));
      }
    } catch (error) {
      console.error(error);
      setTokensToBeClaimed(zero);
    }
  }

  const getBalanceOfCryptoManiaTokens = async() => {
    try {
      const provider = await getProviderOrSigner();
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );
      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();
      const balance = await tokenContract.balanceOf(address);
      setBalanceOfCryptoManiaToken(balance);
    } catch (error) {
      console.error(error);      
    }
  }

  
  const mintCryptoManiaToken = async(amount) =>{
    try {
      const signer = await getProviderOrSigner(true);
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      );

      const value = 0.001*amount;

      const tx = await tokenContract.mint(amount, {
        value: utils.parseEther(value.toString()),
      });

      setLoading(true);
      await tx.wait();
      setLoading(false);
      window.alert('Successfully Minted Crypto Mania Token');
      await getBalanceOfCryptoManiaTokens();
      await getTotalTokenMinted();
      await getTokensToBeClaimed();

    } catch (error) {
      console.error(error);
    }
  }

  const claimCryptoManiaTokens = async() =>{
    try {
      const signer = getProviderOrSigner(true);
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      );
      const tx = await tokenContract.claim();
      setLoading(true);
      await tx.wait();
      setLoading(false);
      window.alert("Congrats you Claimed crypto Mania Token");
      await getBalanceOfCryptoManiaTokens();
      await getTotalTokenMinted();
      await getTokensToBeClaimed();
    } catch (error) {
      console.error(error);
    }
  }

  const getTotalTokenMinted = async () => {
    try {
      const provider = await getProviderOrSigner();
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );
      const _tokenMinted = await tokenContract.totalSupply();
      setTokenMinted(_tokenMinted);
    } catch (error) {
      console.error(error);
    }
  }

  const getOwner = async() =>{
    try {
      const provider = await getProviderOrSigner();
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );
      const _owner = await tokenContract.owner();
      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();
      
      if(address.toLowerCase() === _owner.toLowerCase()){
        setIsOwner(true);
      }

    } catch (error) {
      console.error(error);
    }
  }

  // Function to withdraw ether from contract
  const withdrawCoins = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      );

      const tx = await tokenContract.withdraw();
      setLoading(true);
      await tx.wait();
      setLoading(false);
      await getOwner();
    } catch (error) {
      console.error(error);
    }
  }


  const getProviderOrSigner = async(needSigner = false)=>{
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    const {chainId} = await web3Provider.getNetwork();

    if(chainId !== 5){
      windows.alert("Pls Changer The Network To Goerli");
      throw new Error("Pls change Network To Goerli");
    }
    if(needSigner){
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  const connectWallet = async () =>{
    try{
      await getProviderOrSigner()
      setWalletConnected(true);
    }catch(error){
      console.error(error);
    }
  };

  
  useEffect(() =>{
    if(!walletConnected){
       web3ModalRef.current = new Web3Modal ({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false
      });
      connectWallet();
      getBalanceOfCryptoManiaTokens();
      getTotalTokenMinted();
      getTokensToBeClaimed();
      getOwner();
    }
  }, [walletConnected]);


  const renderButton = ()=>{
    if(loading){
      return(
        <div>
          <button className={styles.button}>
            Loading...
          </button>
        </div>
      );
    }

    if(walletConnected && isOwner){
      return(
        <div>
          <button className={styles.button1} onClick={()=>withdrawCoins}>
            Withdraw Coins
          </button>
        </div>
      )
    }

    if(tokensToBeClaimed > 0){
      return(
        <div>
          <div className={styles.description}>
          {tokensToBeClaimed * 10} Tokens can be claimed
          </div>
          <button className={styles.button} onClick={claimCryptoManiaTokens}>
            Claim Tokens
          </button>
        </div>
      )
    }

    return(
      <div style={{ display: "flex-col" }}>
        <div>
          <input type="number" placeholder="Number of Tokens" onChange={(e) => setTokenAmount(BigNumber.from(e.target.value))} />
          <button className={styles.button} disabled={!(tokenAmount>0)} onClick={()=>mintCryptoManiaToken(tokenAmount)}>
            Mint Tokens
          </button>
        </div>
      </div>
    );
  };
  return (
    <div>
        <Head>  
          <title>Crypto Mania ICO</title>
          <meta name="description" content="ICO dapp" />
          <link rel="icon" href='./favicon.ico' />
        </Head>
        <div className={styles.main}>
          <div>
            <h1 className={styles.title}>Welcome to Crypto Mania ICO</h1>
            <div className={styles.description}>
              You can claim or mint crypto Mania Tokens now
            </div>
            {walletConnected ? (
                <div>
                  <div className={styles.description}> 
                    You have minted {utils.formatEther(balanceOfCryptoManiaToken)} Crypto Mania Tokens
                  </div>
                  <div className={styles.description}>
                    Overall {utils.formatEther(tokensMinted)}/10000 have been minted!!!
                  </div>
                  {renderButton()}
                </div>
              ): 
              <button onClick={connectWallet} className={styles.button}>
                Connect Wallet
              </button>
            }
          </div>
          <div>
            <img className={styles.image} src="./0.svg" />
          </div>
        </div>
        <footer className={styles.footer}>
          Made by iSmarty for CryptoMania
        </footer>
    </div>
  );
}
