import React, { useState } from 'react';
import './welcome.css';

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

  const openPopup = (novel) => {
    setActiveNovel(novel);
  };

  const closePopup = () => {
    setActiveNovel(null);
  };

  return (
    <div>
      <div className="top-bar">
        <button onClick={() => setPoints(points + 10)}>NFTを購入する</button>
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
          <button onClick={() => { setPoints(points + activeNovel.points); closePopup(); }}>購読する</button>
        </div>
      )}

      <div className="footer">XXXXX</div>
    </div>
  );
};

export default Welcome;
