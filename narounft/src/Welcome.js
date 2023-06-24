import React, { useState } from 'react';
import './welcome.css';  // Don't forget to import the CSS file

const Welcome = () => {
  const points = 1000;  // Dummy points data

  // Dummy novels data
  const novels = Array.from({ length: 50 }, (_, i) => ({
    title: `Novel ${i + 1}`,
    description: 'This is a wonderful novel.', // Dummy description
    points: 100  // Dummy points
  }));

  const [selectedNovel, setSelectedNovel] = useState(null);

  const handleNovelClick = (novel) => {
    setSelectedNovel(novel);
  };

  const closePopup = () => {
    setSelectedNovel(null);
  };
  

  return (
    <div className="container">
      <header className="top-bar">
        <button className="purchase-button">NFTを購入する</button>
        <p>現在のポイントは{points}</p>
      </header>

      <main className="content-field">
        <div className="novels-grid">
          {novels.map((novel, index) => (
            <div key={index} className="novel-tile" onClick={() => handleNovelClick(novel)}>
              {novel.title}
            </div>
          ))}
        </div>
      </main>

      <footer className="footer">
        XXXXX
      </footer>

      {selectedNovel && (
      <div className="popup">
        <div className="popup-content">
          <h2>{selectedNovel.title}</h2>
          <p>{selectedNovel.description}</p>
          <p>{selectedNovel.points}ポイント取得</p>
          <button>購読する</button>
          <button onClick={closePopup}>閉じる</button>
        </div>
      </div>
    )}
    </div>
  );
};

export default Welcome;
