import React, { useState, useEffect } from 'react';
import './novellist.css';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import firebaseConfig from './firebaseconfig';
import { useLocation, Link } from 'react-router-dom';

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

const NovelList = () => {
  const [ownedNovels, setOwnedNovels] = useState([]);
  const [errorMessage] = useState(null);
  const [points, setPoints] = useState(0);
  const location = useLocation();
  const account = location.state.account;
  const userRef = db.ref('users/' + account);
  const novelRef = db.ref('novels');

  useEffect(() => {
    userRef.child('ownedNovels').on('value', (snapshot) => {
      const novelData = snapshot.val();
      if (novelData) {
        setOwnedNovels(Object.values(novelData));
      } else {
        setOwnedNovels([]);
      }
    });

    userRef.child('points').on('value', (snapshot) => {
      setPoints(snapshot.val() || 0);
    });

    return () => {
      userRef.child('ownedNovels').off();
      userRef.child('points').off();
    };
  }, [userRef]);

  const createNovel = () => {
    const newNovel = {
      title: '新しい小説',
      description: '',
      content: '',
      readingPoints: 0,
      ownershipPoints: 0,
    };

    const newNovelRef = novelRef.push(newNovel);
    userRef.child('ownedNovels').child(newNovelRef.key).set(newNovel);
  };

  return (
    <div>
      <div className="top-bar">
        <Link to="/">小説一覧に戻る</Link>
        <p>{points} ポイント</p>
      </div>

      <div className="content-field">
        <button onClick={createNovel}>新しい小説を作成する</button>
        {ownedNovels.map((novel, index) => (
          <div className="tile" key={index}>
            <Link to={{ pathname: "/edit", state: { novel, account } }}>
              <h3>{novel.title}</h3>
              <p>{novel.description}</p>
            </Link>
          </div>
        ))}
      </div>

      {errorMessage && (
        <div className="popup">
          <p>{errorMessage}</p>
        </div>
      )}
    </div>
  );
};

export default NovelList;
