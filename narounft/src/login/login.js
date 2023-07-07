import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import nftContractABI from '../contractabi.js';
import { useNavigate } from 'react-router-dom'; // 追加

const Login = () => {
  const [web3, setWeb3] = useState(null);
  const navigate = useNavigate(); // 追加

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
    const nftContract = new web3.eth.Contract(nftContractABI, nftContractAddress);
  
    const checkToken = async (tokenId) => {
      if (tokenId > 50) {
        console.log('You do not own any of the specified NFTs.');
        return;
      }
  
      try {
        const owner = await nftContract.methods.ownerOf(tokenId).call();
        if (web3.utils.toChecksumAddress(account) === owner) {
          console.log('You are the owner of this NFT!');
          navigate('/welcome', { state: { account } }); // Redirect to the welcome page using React Router's navigate
          return;
        } else {
          checkToken(tokenId + 1);
        }
      } catch (error) {
        console.log('Error checking token ID: ', tokenId);
        checkToken(tokenId + 1);
      }
    };
  
    checkToken(1);
  };

  return (
    <div>
      <button onClick={login}>Login with MetaMask</button>
    </div>
  );
};

export default Login;
