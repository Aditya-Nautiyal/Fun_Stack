import { useRef, useEffect, useState } from "react";
import {
  FUN_STACK,
  NEW_GAME,
  TOW_BY_TOW,
  FOUR_BY_FOUR,
} from "../../constants/string";
import "./MemoryGame.css";

export default function MemoryGame() {
  const divRef = useRef(null); // Create a ref for the div
  const footerRef = useRef(null); // Create a ref for the div

  const [items, setItems] = useState([]);
  const [itemCount, setItemCount] = useState(64);
  const [headerHeight, setHeaderHeight] = useState(0); // State to store the height
  const [footerHeight, setFooterHeight] = useState(0); // State to store the height
  const [options] = useState([
    {
      label: TOW_BY_TOW,
      value: 2,
    },
    {
      label: FOUR_BY_FOUR,
      value: 4,
    },
  ]);
  const [dropdownValue, setDropdownValue] = useState(2); // State to store the height

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

  useEffect(() => {
    setItemCount(dropdownValue * dropdownValue);
  }, [dropdownValue]);

  const circularStructure = () => <div className="mGameCircle" />;

  const bodyStruture = () => {
    return (
      <div
        className="gridBodyStructure"
        style={{
          gridTemplateColumns: `repeat(${Math.sqrt(items.length)}, 1fr)`,
        }}
      >
        {items.map((ele, index) => (
          <div key={`${index}${ele.id}`}>{circularStructure()}</div>
        ))}
      </div>
    );
  };
  return (
    <div className="parentMGameWrapper">
      <div className="header" ref={divRef}>
        <div className="headerContent">
          <div className="mGameTitle">{FUN_STACK}</div>
          <div className="mGameHeaderButtonWrapper">
            <button className="newButtonMGame">{NEW_GAME}</button>
            <select
              id="options"
              className="styled-select"
              onChange={(e) => setDropdownValue(e.target.value)}
            >
              {options.map((ele, index) => (
                <option key={`${index}${ele.value}`} value={ele.value}>
                  {ele.label}
                </option>
              ))}
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
        <div className="common-flex-box" style={{ height: "100%" }}>
          <div className="circleBox">{bodyStruture()}</div>
        </div>
      </div>
      <div className="footer" ref={footerRef}>
        Footer
      </div>
    </div>
  );
}
