import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './noveldetail.module.css'; // CSS file for the page

const NovelDetails = () => {
  const location = useLocation();
  const { novel, account } = location.state;
  const navigate = useNavigate();

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
    </div>
  );
};

export default NovelDetails;
