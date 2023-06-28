import React, { useState, useEffect } from 'react';
import './welcome.css';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import firebaseConfig from './firebaseconfig';
import { Link,useLocation } from 'react-router-dom';
// import novellist from "n./ovellist";

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

const novels = [...Array(50)].map((_, i) => {
  const points = i < 25 ? -25 + i : 1 + i % 25;
  return {
    id: i,
    title: `小説 ${i + 1}`,
    description: "これはダミーテキストです。",
    points,
  };
});

const Welcome = () => {
  const [points, setPoints] = useState(0);
  const [activeNovel, setActiveNovel] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [activeNFT, setActiveNFT] = useState(null);
  const location = useLocation();
  const account = location.state.account;
  const userRef = db.ref('users/' + account);

  useEffect(() => {
    userRef.once('value', (snapshot) => {
      const userData = snapshot.val();
      if (userData) {
        setPoints(userData.points);
      } else {
        userRef.set({points: 0});
      }
    });
  }, [userRef]);

  const buyNFT = () => {
    setActiveNFT({title: 'NFT Title', description: 'NFT Description', points: -30});
  };

  const purchaseNFT = () => {
    if (points < -activeNFT.points) {
      setErrorMessage('ポイントが足りません！');
    } else {
      setPoints(points + activeNFT.points);
      setActiveNFT(null);
      userRef.update({points: points + activeNFT.points});
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

  const purchaseItem = (itemCost) => {
    if (points < itemCost) {
      setErrorMessage('ポイントが足りません');
    } else {
      setPoints(prevPoints => prevPoints - itemCost);
      setActiveNovel(null);
      alert('アイテムを購入しました');
      userRef.update({points: points - itemCost});
    }
  };

  return (
    <div>
      <div className="top-bar">
        <button onClick={buyNFT}>NFTを購入する</button>
        <Link to={{ pathname: "/novellist", state: { account } }}>
          <button>NovelListへ</button>
        </Link>
        <p>現在のポイントは {points}</p>
      </div>

      <div className="content-field">
        {novels.map((novel) => (
          <div className="tile" key={novel.title} onClick={() => openPopup(novel)}>
            <h3>{novel.title}</h3>
            <p className="points">{novel.points}P</p>
          </div>
        ))}
      </div>

      {activeNovel && (
        <div className="popup">
          <button className="close-btn" onClick={closePopup}>閉じる</button>
          <h2>{activeNovel.title}</h2>
          <p>{activeNovel.description}</p>
          <p>{activeNovel.points}P</p>
          <button onClick={() => purchaseItem(activeNovel.points)}>購入する</button>
        </div>
      )}

      {activeNFT && (
        <div className="popup">
          <button className="close-btn" onClick={closeNFTPopup}>閉じる</button>
          <h2>{activeNFT.title}</h2>
          <p>{activeNFT.description}</p>
          <p>{activeNFT.points}P</p>
          <button onClick={purchaseNFT}>購入する</button>
        </div>
      )}

      {errorMessage && (
        <div className="popup">
          <button className="close-btn" onClick={closePopup}>閉じる</button>
          <p>{errorMessage}</p>
        </div>
      )}
    </div>
  );
};

export default Welcome;
