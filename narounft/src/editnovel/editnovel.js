import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import styles from '../newnovels/newnovels.module.css'; // 同じCSSを使います

const db = firebase.firestore();

const EditNovel = () => {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [subscriptionPoints, setSubscriptionPoints] = useState(0);
  const [copyrightPoints, setCopyrightPoints] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  // 画面遷移時に小説のデータをstateから取得し、各stateにセット
  useEffect(() => {
    console.log( "location.state.novel");
    console.log( location.state.novel);
    const novel = location.state.novel;
    setTitle(novel.title);
    setSummary(novel.summary);
    setContent(novel.content);
    setSubscriptionPoints(novel.subscriptionPoints);
    setCopyrightPoints(novel.copyrightPoints);
  }, [location.state.novel]);

  const handleSave = () => {
    // 更新する小説データを作成
    const novelData = {
      title,
      summary,
      content,
      subscriptionPoints,
      copyrightPoints
    };
    // Firestoreの該当する小説のデータを更新
    db.collection('novels').doc(location.state.novel.id).set(novelData)
    .then(() => {
      // データ更新後、小説リスト画面に戻る
      navigate('/novellist', { state: { account: location.state.account } });
    }).catch((error) => {
      console.error("Error updating novel: ", error);
    });
  };

  return (
    <div>
      <div className={styles.topBar}>
        <button onClick={() => navigate('/novellist', { state: { account: location.state.account } })}>小説リストへ戻る</button>
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

export default EditNovel;
