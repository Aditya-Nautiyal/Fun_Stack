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
  const [selectedItems, setSelectedItems] = useState([]);
  const [itemCount, setItemCount] = useState(4);
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
    const res = shuffleArrayInPlace(itemsGeneration());
    setItems(res);
  }, [itemCount]);

  useEffect(() => {
    setItemCount(dropdownValue * dropdownValue);
  }, [dropdownValue]);

  const itemsGeneration = () => {
    return Array.from({ length: itemCount }, (v, i) => {
      // Calculate the pair index (0, 1 for the first pair, 2, 3 for the second pair, etc.)
      const pairIndex = Math.floor(i / 2);
      return {
        id: i,
        visible: false, // Example: alternate visibility
        comparingValue: pairIndex, // Assign same comparingValue to two consecutive items
      };
    });
  };

  const cirleClicked = (ele) => {
    if (selectedItems.some((item) => item.id === ele.id)) {
      setSelectedItems(selectedItems.filter((item) => item.id !== ele.id));
      setItems((item) =>
        item.id === ele.id ? { ...item, visible: false } : item
      );
    } else {
      setSelectedItems([...selectedItems, ele]);
      setItems((item) =>
        item.id === ele.id ? { ...item, visible: true } : item
      );
    }
  };

  const newGameButtonClicked = () => {
    const res = shuffleArrayInPlace(itemsGeneration());
    setItems(res);
    setSelectedItems([]);
  };

  const onDropdownSelect = (e) => {
    newGameButtonClicked();
    setDropdownValue(e.target.value)
  };

  const shuffleArrayInPlace = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };
  
  const bodyStruture = () => {
    return (
      <div
        className="gridBodyStructure"
        style={{
          gridTemplateColumns: `repeat(${Math.sqrt(items.length)}, 1fr)`,
        }}
      >
        {items.map((ele, index) => (
          <div key={`${index}${ele.id}`} onClick={() => cirleClicked(ele)}>
            <div
              className={`mGameCircle ${
                selectedItems.some((item) => item.id === ele.id)
                  ? "is-flipped"
                  : ""
              }`}
            >
              {/* Initial button content */}
              <div className="front" />
              {/* Content after flip */}
              <div className="back">{ele.comparingValue}</div>
            </div>
          </div>
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
            <button className="newButtonMGame" onClick={newGameButtonClicked}>
              {NEW_GAME}
            </button>
            <select
              id="options"
              className="styled-select"
              onChange={(e) => onDropdownSelect(e)}
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
