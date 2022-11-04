import React, {useEffect, useState} from 'react';
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import { ethers } from "ethers";
import myEpicNft from './utils/MyEpicNFT.json';
import Typewriter from 'typewriter-effect/dist/core';

// Constants
const TWITTER_HANDLE = 'Harsh7902';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const CONTRACT_ADDRESS = "0x1a88a2D295C8e436e537bc1517B1Fd4F294610Ee";
// const OPENSEA_LINK = 'https://testnets.opensea.io/collection/squarenft-u6zm1jy2as';
const OPENSEA_LINK = 'https://testnets.opensea.io/collection/squarenft-rqiuk2g03p';
// const TOTAL_MINT_COUNT = 50;


    
const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  
  

  const miningAnimationStarts = () => {
    let StatusDiv = document.getElementsByClassName("toggle")[0];
    StatusDiv.style.display = 'block'
    var app = document.getElementById("text");
    var typewriter = new Typewriter(app, {
      loop: true,
      delay: 75,
    });
    typewriter
      .pauseFor(50)
      .typeString("......")
      // .pauseFor(300)
      .deleteChars(4)
      .start();
  }
  const miningAnimationStops = () => {
    let StatusDiv = document.getElementsByClassName("toggle")[0];
    StatusDiv.style.display = 'none'
    let OpenSeaDiv = document.getElementById("ViewOpensea");
    OpenSeaDiv.style.display = 'inline-block'
    
  }
  const checkIfWalletIsConnected = async  () => {
    /*
    * First make sure we have access to window.ethereum
    */
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }
    /*
    * Check if we're authorized to access the user's wallet
    */
    const accounts = await ethereum.request({ method: 'eth_accounts' });

    /*
    * User can have multiple authorized accounts, we grab the first one if its there!
    */
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      let chainId = await ethereum.request({ method: 'eth_chainId' });
      

      // String, hex code of the chainId of the Rinkebey test network
      const goerliChainId = "0x5"; 
      if (chainId !== goerliChainId) {
        alert("You are not connected to the Goerli Test Network!");
      } else {
        console.log("Connected to chain " + chainId);
        // Setup listener! This is for the case where a user comes to our site
          // and ALREADY had their wallet connected + authorized.
          setCurrentAccount(account);
          setupEventListener()
      }
    } else {
      console.log("No authorized account found");
    }
  }
   /*
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }
      
      /*
      * Fancy method to request access to account.
      */
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      /*
      * Boom! This should print out public address once we authorize Metamask.*/
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]); 
      // Setup listener! This is for the case where a user comes to our site
      // and connected their wallet for the first time.
      setupEventListener() 
    }catch (error) {
      console.log(error);
    }
  }

    // Setup our listener.
    const setupEventListener = async () => {
      // Most of this looks the same as our function askContractToMintNft
      try {
        const { ethereum } = window;
  
        if (ethereum) {
          // Same stuff again
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);
  
          // THIS IS THE MAGIC SAUCE.
          // This will essentially "capture" our event when our contract throws it.
          // If you're familiar with webhooks, it's very similar to that!
          connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
            console.log(from, tokenId.toNumber())
            alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
          });
  
          console.log("Setup event listener!")
  
        } else {
          console.log("Ethereum object doesn't exist!");
        }
      } catch (error) {
        console.log(error)
      }
    }

  const askContractToMintNft = async () => {
    
  
    try {
      const { ethereum } = window;
  
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);
  
        console.log("Going to pop wallet now to pay gas...")
        let nftTxn = await connectedContract.makeAnEpicNFT();
  
        console.log("Mining...please wait.")
        miningAnimationStarts();
        await nftTxn.wait();
        
        console.log(`Mined, see transaction: https://goerli.etherscan.io/tx/${nftTxn.hash}`);
        miningAnimationStops()
      } else {
        console.log("Ethereum object doesn't exist!");
      }
} catch (error) {
  console.log(error)
}
}

  
  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );
  useEffect(() => {
    checkIfWalletIsConnected();
  })
  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>

          {currentAccount === "" ? (
            renderNotConnectedContainer()
          ) : (
            <button
              onClick={askContractToMintNft}
              className="cta-button connect-wallet-button"
            >
              Mint NFT
            </button>
          )}
          <button id="ViewOpensea" className="cta-button connect-wallet-button">
            <a href={OPENSEA_LINK} target="_blank" rel="noreferrer">
              🌊 View Collection on OpenSea
            </a>
          </button>
        </div>
        <div id="status" className="toggle">
          <h4>Log Status</h4>
          <hr />
          <p onClick={miningAnimationStarts}>
            Mining, Please wait <span id="text"></span>
          </p>
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );

  
};




export default App;