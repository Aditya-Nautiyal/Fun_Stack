import "./MemoryGame.css";

export default function MemoryGame() {
  return (
    <div className="parentMGameWrapper">
      {/* <div className="mGameContainer">asasd asd asd adasd</div> */}
      <div className="header">
        <div className="headerContent">
          <div className="mGameTitle">Fun Stack</div>
          <div className="mGameHeaderButtonWrapper">
            <button className="newButtonMGame">New game</button>
            <select id="options" className="styled-select">
              <option value="option1">Option 1</option>
              <option value="option2">Option 2</option>
              <option value="option3">Option 3</option>
            </select>
          </div>
        </div>
      </div>
      <div className="mGameBodyWrapper">
        <p>Even more content...</p>
        {/* Add more content to see the scrolling effect */}
      </div>
      <div className="footer">Fixed Footer</div>
    </div>
  );
}
