import Web3 from 'web3';
import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore'; 
import firebaseConfig from '../firebaseconfig/firebaseconfig';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './welcome.module.css';
import { ethers } from "ethers";
// MetaMaskのプロバイダを取得します。
const provider = new ethers.providers.Web3Provider(window.ethereum);

let web3;

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
    userRef.get().then((doc) => {
      if (doc.exists) {
        setPoints(doc.data().points);
        setSubscribedNovels(doc.data().subscribedNovels || []);  // Update this line
      } else {
        userRef.set({ points: 0, subscribedNovels: [] });  // Add subscribedNovels: [] here
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
    const accounts = await web3.eth.getAccounts(); // Get user's accounts from MetaMask
    const sender = accounts[0]; // Use the first account as the sender
  
    const tx = {
      from: sender,
      to: recipient,
      value: web3.utils.toWei(amountInMATIC, 'mwei') // Convert from MATIC to wei
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
    if (subscribedNovels.includes(novel.id)) {
      // 既に購読している小説の場合、直接小説のページへ遷移します。
      navigate(`/noveldetails`, { state: { account ,novel} });
    } else {
      // 初めて購読する小説の場合、ポイントとイーサリアムの取引が行われます。
      setActiveNovel(novel);
    }
  };

  const closePopup = () => {
    setActiveNovel(null);
    setErrorMessage(null);
  };

  const closeNFTPopup = () => {
    setActiveNFT(null);
  };
  const handleNovelPurchase = async () => {
    try {
      // Purchase the novel
      await purchaseItem(activeNovel.copyrightPoints, '小説購入');
  
      // ここでEtherの送信を行います。
      const signer = provider.getSigner();
      const tx = await signer.sendTransaction({
        to: activeNovel.userId, // このアドレスは小説の作者のアドレスです。
        value: ethers.utils.parseEther("0.001"), // 0.001 ETH を送信します。
      });
      await tx.wait(); // トランザクションが確定するまで待ちます。
  
      // Update the novel's owner in the novels collection
      const novelDoc = db.collection('novels').doc(activeNovel.id);
      await novelDoc.update({ userId: account });
  
      // Remove the novel from the previous owner's ownedNovels array
      const previousOwnerDoc = db.collection('users').doc(activeNovel.userId);
      await previousOwnerDoc.update({
        ownedNovels: firebase.firestore.FieldValue.arrayRemove(activeNovel.id)
      });
  
      // Add the novel to the new owner's ownedNovels array
      const userDoc = db.collection('users').doc(account);
      await userDoc.update({
        ownedNovels: firebase.firestore.FieldValue.arrayUnion(activeNovel.id)
      });
  
      // 購読成功後、小説のページへ飛びます。
      navigate(`/novel/${activeNovel.id}`);
    } catch (error) {
      setErrorMessage(`小説の購入中にエラーが発生しました: ${error.message}`);
    }
  };
  
  const purchaseItem = async (itemCost, itemType) => {
    if (points < itemCost) {
      setErrorMessage(`ポイントが足りません！ ${itemType}には${itemCost}Pが必要です。`);
    } else {
      setPoints(prevPoints => prevPoints - itemCost);
      setActiveNovel(null);
      alert(`${itemType}を購入しました`);
      const userDoc = db.collection('users').doc(account); // Firestoreのドキュメント参照を取得
      await userDoc.update({points: points - itemCost});
      console.log("itemtypeを判断する");
      console.log(itemType);
  
      // Send MATIC transaction here.
      const maticAmount = itemCost / 1000; // Assuming 1 point = 0.001 MATIC.
      await sendMATIC(account, maticAmount);
  
      // Transfer points to the author if it's a novel purchase
      if (itemType === '小説を購入する') {
        console.log("小説を購入");
        console.log(activeNovel.userId);
        const authorDoc = db.collection('users').doc(activeNovel.userId);
        const authorDocData = await authorDoc.get();
        if (authorDocData.exists) {
          console.log("authorDocData.exists");
          const authorPoints = authorDocData.data().points;
          console.log(authorPoints);
          console.log(itemCost);
          await authorDoc.update({ points: authorPoints + itemCost });
  
          // Send MATIC transaction here as well.
          await sendMATIC(activeNovel.userId, maticAmount);
        }
      }
    }
  };

  return (
    <div>
      <div className={styles.topbar}>
        <button onClick={buyNFT}>NFTを購入する</button>
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
        <button onClick={handleNovelPurchase}>購読する</button>
        <button onClick={() => purchaseItem(activeNovel.copyrightPoints, '小説を購入する')}>小説を購入する</button>
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
