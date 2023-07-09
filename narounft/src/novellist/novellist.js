import React, { useState, useEffect } from 'react';
import './novellist.css';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore'; 
import { useLocation ,useNavigate} from 'react-router-dom';


const db = firebase.firestore()

const NovelList = () => {
  const [ownedNovels, setOwnedNovels] = useState([]);
  const [errorMessage] = useState(null);
  const [points, setPoints] = useState(0);
  const location = useLocation();
  const [account] = useState(location.state.account);
  const userRef = db.collection('users').doc(account);

  useEffect(() => {
    userRef.get().then((doc) => {
      if (doc.exists) {
        setPoints(doc.data().points);
        const novelIDs = doc.data().ownedNovels || [];
        const novelPromises = novelIDs.map((id) => {
          const novelRef = db.collection('novels').doc(id);
          return novelRef.get();
        });
        Promise.all(novelPromises).then((novels) => {
          const validNovels = novels.map((novel) => ({id: novel.id, ...novel.data()})).filter((novel) => novel); // Validate novels
          setOwnedNovels(validNovels);
        });
      } else {
        userRef.set({ points: 0 });
      }
    });
  
    return () => {};
  }, [account, userRef]);

  const navigate = useNavigate();

  return (
    <div>
      <div className="top-bar">
      <button onClick={() => navigate('/welcome', { state: { account } })}>小説一覧に戻る</button>
        <p>{points} ポイント</p>
      </div>

      <div className="content-field">
        <button onClick={() => navigate('/newnovels', { state: { account } })}>新しい小説を作成する</button>
        {ownedNovels.map((novel, index) => (
          <div className="tile" key={index} onClick={() => navigate('/editnovel', { state: { novel, account } })}>
            <h3>{novel.title}</h3>
            <p>{novel.description}</p>
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
