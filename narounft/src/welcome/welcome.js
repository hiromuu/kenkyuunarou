import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore'; 
import firebaseConfig from '../firebaseconfig/firebaseconfig';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './welcome.module.css';

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

  const [, setSubscribedNovels] = useState([]);

  useEffect(() => {
    const userRef = db.collection('users').doc(account);
    userRef.get().then((doc) => {
      if (doc.exists) {
        setPoints(doc.data().points);
        setSubscribedNovels(doc.data().subscribedNovels || []);  // Add this line
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
  const handleNovelPurchase = async () => {
    try {
      // Purchase the novel
      await purchaseItem(activeNovel.copyrightPoints, '小説購入');
      
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
