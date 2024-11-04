import { useRef, useEffect, useState } from "react";
import "./MemoryGame.css";

export default function MemoryGame() {
  const divRef = useRef(null); // Create a ref for the div
  const footerRef = useRef(null); // Create a ref for the div

  const [items, setItems] = useState([]);
  const [itemCount, setItemCount] = useState(4);
  const [headerHeight, setHeaderHeight] = useState(0); // State to store the height
  const [footerHeight, setFooterHeight] = useState(0); // State to store the height

  useEffect(() => {
    if (divRef.current) {
      setHeaderHeight(divRef.current.offsetHeight); // Set the height from the ref
    }
    if (footerRef.current) {
      setFooterHeight(footerRef.current.offsetHeight); // Set the height from the ref
    }
    const res = Array.from({ length: itemCount }, (v, i) => ({
      id: i,
      visible: false, // Example: alternate visibility
    }));
    setItems(res);
  }, [itemCount]);

  
  return (
    <div className="parentMGameWrapper">
      <div className="header" ref={divRef}>
        <div className="headerContent">
          <div className="mGameTitle">Fun Stack</div>
          <div className="mGameHeaderButtonWrapper">
            <button className="newButtonMGame">New game</button>
            <select id="options" className="styled-select">
              <option value="option1">2 * 2</option>
              <option value="option2">3 * 3</option>
              <option value="option3">4 * 4</option>
            </select>
          </div>
        </div>
      </div>
      <div
        className="mGameBodyWrapper"
        style={{
          paddingTop: `${headerHeight}px`,
          paddingBottom: `${footerHeight}px`,
        }}
      >
        <div className="common-flex-box">
          <div className="circleBox">Body</div>
        </div>
      </div>
      <div className="footer" ref={footerRef}>
        Footer
      </div>
    </div>
  );
}
