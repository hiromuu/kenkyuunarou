import Web3 from 'web3';
import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore'; 
import firebaseConfig from '../firebaseconfig/firebaseconfig';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './welcome.module.css';

let web3 = new Web3(window.ethereum);

if (window.ethereum) {
  web3 = new Web3(window.ethereum);
  try {
    // Request account access if needed
    window.ethereum.enable();
  } catch (error) {
    console.error("User denied account access");
  }
} else {
  console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
}

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

const Welcome = () => {
  const [points, setPoints] = useState(0);
  const [novels, setNovels] = useState([]);
  const [activeNovel, setActiveNovel] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [activeNFT, setActiveNFT] = useState(null);
  const location = useLocation();
  const account = location.state.account;
  const navigate = useNavigate();

  // Here is where we define 'subscribedNovels'
  const [subscribedNovels, setSubscribedNovels] = useState([]);

  useEffect(() => {
    const userRef = db.collection('users').doc(account);
    userRef.onSnapshot((doc) => {  // use onSnapshot to listen for updates
      if (doc.exists) {
        setPoints(doc.data().points);
        setSubscribedNovels(doc.data().subscribedNovels || []);
      } else {
        userRef.set({ points: 20, subscribedNovels: [] });
      }
    });
  }, [account]);

  useEffect(() => {
    const fetchNovels = async () => {
      const novelCollection = await db.collection('novels').get();
      const novelData = novelCollection.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setNovels(novelData);
    };
    fetchNovels();
  }, [])

  const sendMATIC = async (recipient, amountInMATIC) => {
    console.log("amountInMATIC");
    console.log(amountInMATIC);
    const accounts = await web3.eth.getAccounts(); // Get user's accounts from MetaMask
    const sender = accounts[0]; // Use the first account as the sender
  
    const tx = {
      from: sender,
      to: recipient,
      value: web3.utils.toWei(amountInMATIC, 'ether') 
    };
  
    try {
      const receipt = await web3.eth.sendTransaction(tx);
      console.log(receipt);
    } catch (error) {
      console.error(`Failed to send MATIC: ${error}`);
    }
  };

  

  const buyNFT = () => {
    setActiveNFT({title: 'NFT Title', description: 'NFT Description', points: -30});
  };

  const purchaseNFT = () => {
    if (points < -activeNFT.points) {
      setErrorMessage('ポイントが足りません！');
    } else {
      setPoints(points + activeNFT.points);
      setActiveNFT(null);
      const userDoc = db.collection('users').doc(account); 
      userDoc.update({points: points + activeNFT.points});
    }
  };

  const openPopup = (novel) => {
    setActiveNovel(novel);
  };

  const closePopup = () => {
    setActiveNovel(null);
    setErrorMessage(null);
  };

  const closeNFTPopup = () => {
    setActiveNFT(null);
  };
  
  const purchaseItem = async (itemCost, itemType) => {
    if (points < itemCost) {
      setErrorMessage(`ポイントが足りません！ ${itemType}には${itemCost}Pが必要です。`);
    } else {
      // Confirm the transaction with the user
      const userResponse = window.confirm(`${itemType}を購入しますか？`);

      // If the user chooses 'Cancel', then return from the function
      if (!userResponse) {
        return;
      }

      // If the user chooses 'OK', continue with the transaction
      setPoints(prevPoints => prevPoints - itemCost);
      const userDoc = db.collection('users').doc(account); 
      await userDoc.update({
        points: points - itemCost, 
        subscribedNovels: firebase.firestore.FieldValue.arrayUnion(activeNovel.id)
      });
      console.log(itemCost);
      console.log("itemtypeを判断する");
      console.log(itemType);

      // Send MATIC transaction here.
      const maticAmount = parseFloat(itemCost) / 1000; // 
      console.log(maticAmount);
      await sendMATIC(activeNovel.userId, maticAmount);

      console.log(activeNovel.userId);
      const authorDoc = db.collection('users').doc(activeNovel.userId);
      const authorDocData = await authorDoc.get();
      console.log("authorDocData.exists");
      const authorPoints = authorDocData.data().points;
      console.log(authorPoints);
      console.log(itemCost);
      await authorDoc.update({ points: authorPoints + itemCost });
      const novelDoc = db.collection('novels').doc(activeNovel.id);
      const novelData = await novelDoc.get();
      if (itemType === '購読') {
        await novelDoc.update({ subscriptionCount: (novelData.data().subscriptionCount || 0) + 1 });
      }
      // Transfer points to the author if it's a novel purchase
      if (itemType === '小説を購入する') {
        console.log("小説を購入");
        
        // Update the novel's owner in the novels collection
        const novelDoc = db.collection('novels').doc(activeNovel.id);
        await novelDoc.update({ userId: account ,purchaseCount: (novelData.data().purchaseCount || 0) + 1});
    
        // Remove the novel from the previous owner's ownedNovels array
        const previousOwnerDoc = db.collection('users').doc(activeNovel.userId);
        await previousOwnerDoc.update({
          ownedNovels: firebase.firestore.FieldValue.arrayRemove(activeNovel.id),
        });
    
        // Add the novel to the new owner's ownedNovels array
        const userDoc = db.collection('users').doc(account); 
        await userDoc.update({points: points - itemCost, subscribedNovels: firebase.firestore.FieldValue.arrayUnion(activeNovel.id) });
      }
      const tempActiveNovel = activeNovel;
      setActiveNovel(null);
      navigate('/noveldetails', { state: { account ,novel: tempActiveNovel} });
    }
  };

  return (
    <div>
      <div className={styles.topbar}>
        <button onClick={buyNFT}>未実装</button>
        <button onClick={() => navigate('/novellist', { state: { account } })}>NovelListへ</button>
        <p>現在のポイントは {points}</p>
      </div>

      <div className={styles.contentfield}>
      {novels.map((novel) => (
        <div className="tile" key={novel.id} onClick={() => openPopup(novel)}>
            <h3>{novel.title}</h3>
            <p className="points">購読ポイント: {novel.subscriptionPoints}P</p>
            <p className="points2">小説購入ポイント: {novel.copyrightPoints}P</p>
        </div>
        ))}
      </div>

      {activeNovel && (
        <div className={styles.popup}>
          <button className="close-btn" onClick={closePopup}>閉じる</button>
          <h2>{activeNovel.title}</h2>
          <p>{activeNovel.description}</p>
          <p>購読ポイント: {activeNovel.subscriptionPoints}P</p>
          <p>小説購入ポイント: {activeNovel.copyrightPoints}P</p>
          <p>{activeNovel.summary}</p>
          {subscribedNovels.includes(activeNovel.id) ? (
            <>
              <button onClick={() => navigate(`/noveldetails`, { state: { account, novel: activeNovel } })}>読む(無料)</button>
              <button onClick={() => purchaseItem(activeNovel.copyrightPoints, '小説を購入する')}>小説を購入する</button>
            </>
          ) : (
            <>
              <button onClick={() => purchaseItem(activeNovel.subscriptionPoints, '購読')}>購読する</button>
              <button onClick={() => purchaseItem(activeNovel.copyrightPoints, '小説を購入する')}>小説を購入する</button>
            </>
          )}
            </div>
          )}

      {activeNFT && (
        <div className={styles.popup}>
          <button className="close-btn" onClick={closeNFTPopup}>閉じる</button>
          <h2>{activeNFT.title}</h2>
          <p>{activeNFT.description}</p>
          <p>{activeNFT.points}P</p>
          <button onClick={purchaseNFT}>購入する</button>
        </div>
      )}

      {errorMessage && (
        <div className={styles.popup}>
          <button className="close-btn" onClick={closePopup}>閉じる</button>
          <p>{errorMessage}</p>
        </div>
      )}
    </div>
  );
};

export default Welcome;
