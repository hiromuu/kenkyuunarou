import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import styles from './noveldetail.module.css'; // CSS file for the page

const db = firebase.firestore();

const NovelDetails = () => {
  const location = useLocation();
  const { novel, account } = location.state;
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Get the user's account data
    const userRef = db.collection('users').doc(account);
    userRef.get().then((doc) => {
      if (doc.exists) {
        const userData = doc.data();
        if (userData.points < novel.subscriptionPoints) {
          setErrorMessage('購読するためのポイントが足りません。');
        } else {
          // Deduct points and add novel to the user's subscribedNovels
          userRef.update({
            points: firebase.firestore.FieldValue.increment(-novel.subscriptionPoints),
            subscribedNovels: firebase.firestore.FieldValue.arrayUnion(novel.id)
          });
        }
      } else {
        setErrorMessage('ユーザーアカウントが見つかりませんでした。');
      }
    }).catch((error) => {
      console.error("Error getting user document: ", error);
      setErrorMessage('エラーが発生しました。もう一度試してください。');
    });

    return () => {};
  }, [account, novel]);

  return (
    <div>
      <div className={styles.topbar}>
        <button onClick={() => navigate('/welcome', { state: { account } })}>小説一覧に戻る</button>
        <h1>{novel.title}</h1>
        <p>{novel.subscriptionPoints} ポイントで購入可能</p>
      </div>

      <div className={styles.contentfield}>
        <h2>概要:</h2>
        <p>{novel.summary}</p>

        <h3>本文:</h3>
        <p>{novel.content}</p>
      </div>

      {errorMessage && (
        <div className={styles.popup}>
          <p>{errorMessage}</p>
        </div>
      )}
    </div>
  );
};

export default NovelDetails;
