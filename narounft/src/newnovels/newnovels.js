import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import styles from './newnovels.module.css';

const db = firebase.firestore();

const NewNovel = () => {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [subscriptionPoints, setSubscriptionPoints] = useState(0); // added
  const [copyrightPoints, setCopyrightPoints] = useState(0); // added
  const location = useLocation();
  const [account] = useState(location.state.account);
  const navigate = useNavigate();

  const handleSave = () => {
    const novelData = {
      title,
      summary,
      content,
      subscriptionPoints,
      copyrightPoints,
      userId: account,
    };

    db.collection('novels').add(novelData)
    .then((docRef) => {
      docRef.update({
        novelId: docRef.id
      });
      const userRef = db.collection('users').doc(account);
      userRef.update({
        ownedNovels: firebase.firestore.FieldValue.arrayUnion(docRef.id)
      });

      navigate('/novellist', { state: { account } });
    }).catch((error) => {
      console.error("Error adding novel: ", error);
    });
  };

  return (
    <div>
      <div className={styles.topBar}>
    <button onClick={() => navigate('/novellist', { state: { account } })}>小説リストへ戻る</button>
    <button onClick={handleSave}>小説を保存</button>
</div>

<div className={styles.contentField}>
    <div className={styles.pointInputs}>
        <div>
            <label>購読ポイント: </label>
            <input 
                type="number"
                value={subscriptionPoints}
                onChange={(e) => setSubscriptionPoints(Number(e.target.value))}
            />
        </div>
        <div>
            <label>著作権利ポイント: </label>
            <input 
                type="number"
                value={copyrightPoints}
                onChange={(e) => setCopyrightPoints(Number(e.target.value))}
            />
        </div>
    </div>

    <div className={styles.titleField}>
        <h1>タイトル:</h1>
        <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="タイトルを入力してください"
        />
    </div>

    <div className={styles.summaryField}>
        <h2>概要:</h2>
        <textarea
            rows="5"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="概要を入力してください"
        />
    </div>

    <div className={styles.contentField}>
        <h3>本文:</h3>
        <textarea
            rows="40"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="内容を入力してください"
            className="large-text-area"
        />
    </div>
</div>
    </div>
  );
};

export default NewNovel;
