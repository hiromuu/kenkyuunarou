import React, { useEffect, useState } from 'react';
import Web3 from 'web3';

const Login = () => {
  const [web3, setWeb3] = useState(null);

  useEffect(() => {
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
    } else {
      alert("Please install MetaMask!");
    }
  }, []);

  const login = async () => {
    if (!web3) return;
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts[0];
    checkNFTOwnership(account);
  };

  const checkNFTOwnership = async (account) => {
    const nftContractAddress = '0xD877a26eBa98A1747Ce783BE7b34b2CE3361B298';
    const nftContractABI = []; // Replace this with your contract's ABI

    const nftContract = new web3.eth.Contract(nftContractABI, nftContractAddress);

    for (let tokenId = 1; tokenId <= 50; tokenId++) {
      try {
        const owner = await nftContract.methods.ownerOf(tokenId).call();
        if (account === owner) {
          console.log('You are the owner of this NFT!');
          window.location.href = '/welcome'; // Redirect to the welcome page
          return;
        }
      } catch (error) {
        console.log('Error checking token ID: ', tokenId);
      }
    }

    console.log('You do not own any of the specified NFTs.');
  };

  return (
    <div>
      <button onClick={login}>Login with MetaMask</button>
    </div>
  );
};

export default Login;