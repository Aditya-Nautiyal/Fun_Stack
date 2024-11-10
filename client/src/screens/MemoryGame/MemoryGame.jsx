import { useRef, useEffect, useState } from "react";
import Timer from "../../components/timer/timer";
import ConfettiExplosion from "react-confetti-explosion";
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
  const [checkPairArray, setCheckPairArray] = useState([]);

  const [itemCount, setItemCount] = useState(4);
  const [headerHeight, setHeaderHeight] = useState(0); // State to store the height
  const [footerHeight, setFooterHeight] = useState(0); // State to store the height
  const [isRunning, setIsRunning] = useState(false);
  const [initialMinute, setInitialMinute] = useState(5);
  const [initialSecond, setInitialSecond] = useState(0);
  const [timerKey, setTimerKey] = useState(0);
  const [isAllFlipped, setIsAllFlipped] = useState(false);
  const [stoppageTime, setStoppageTime] = useState("");

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

  useEffect(() => {
    if (
      checkPairArray.length === 2 &&
      checkPairArray[0] !== checkPairArray[1]
    ) {
      setTimeout(() => {
        setSelectedItems(
          selectedItems.filter(
            (item) => !checkPairArray.includes(item.comparingValue)
          )
        );

        setCheckPairArray([]);
      }, 500);
    } else if (
      checkPairArray.length === 2 &&
      checkPairArray[0] === checkPairArray[1]
    ) {
      setItems(
        items.map((item) =>
          checkPairArray.includes(item.comparingValue)
            ? { ...item, finalCheck: true }
            : item
        )
      );
      setCheckPairArray([]);
    }
    const allFlipped = items.every((item) => item.finalCheck === true);
    if (allFlipped && items.length > 0) {
      setIsAllFlipped(true);
      setIsRunning(false)
    }
  }, [selectedItems, items]);

  const itemsGeneration = () => {
    return Array.from({ length: itemCount }, (v, i) => {
      // Calculate the pair index (0, 1 for the first pair, 2, 3 for the second pair, etc.)
      const pairIndex = Math.floor(i / 2);
      return {
        id: i,
        visible: false, // Example: alternate visibility
        comparingValue: pairIndex, // Assign same comparingValue to two consecutive items
        finalCheck: false,
      };
    });
  };

  const cirleClicked = (ele) => {
    if (
      selectedItems.some((item) => item.id === ele.id) &&
      ele.finalCheck === false
    ) {
      setSelectedItems(selectedItems.filter((item) => item.id !== ele.id));
      setItems((item) =>
        item.id === ele.id ? { ...item, visible: false } : item
      );
      setCheckPairArray([]);
    } else if (ele.finalCheck === false) {
      setSelectedItems([...selectedItems, ele]);
      setItems((item) =>
        item.id === ele.id ? { ...item, visible: true } : item
      );
      setCheckPairArray([...checkPairArray, ele.comparingValue]);
    }
    setIsRunning(true);
  };

  const newGameButtonClicked = () => {
    const res = shuffleArrayInPlace(itemsGeneration());
    setItems(res);
    setSelectedItems([]);
    setCheckPairArray([]);
    setInitialMinute(5);
    setInitialSecond(0);
    setTimerKey((prevKey) => prevKey + 1); // Change key to remount Timer
    setIsRunning(false);
    setIsAllFlipped(false);
  };

  const onDropdownSelect = (e) => {
    newGameButtonClicked();
    setDropdownValue(e.target.value);
  };

  const shuffleArrayInPlace = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const handleTimerStop = (time) => {
    console.log(time)
    setStoppageTime(time);
  };

  const bodyStruture = () => {
    return (
      <>
        {isAllFlipped ? <ConfettiExplosion className="confetti" /> : null}

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
      </>
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
        <div
          className="common-flex-box"
          style={{ height: "100%", caretColor: "transparent" }}
        >
          <div className="circleBox">{bodyStruture()}</div>
        </div>
      </div>
      <div className={"footer common-flex-box"} ref={footerRef}>
        {
          <Timer
            key={timerKey}
            initialMinutes={initialMinute}
            initialSeconds={initialSecond}
            isRunning={isRunning}
            onStop={handleTimerStop}
          />
        }
      </div>
    </div>
  );
}
