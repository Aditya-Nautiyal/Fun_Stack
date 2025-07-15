import { useRef, useEffect, useState } from "react";
import { useJwt } from "react-jwt";
import Timer from "../../components/timer/Timer.jsx";
import ConfettiExplosion from "react-confetti-explosion";
import {
  submitScore,
  fetchHighScore,
  urlGenerator,
} from "../../services/apiCall.tsx";
import {
  FUN_STACK,
  NEW_GAME,
  FOUR_BY_FOUR,
  SIX_BY_SIX,
  TOP_SCORE,
  EMAIL_CAPS,
  SCORE_CAPS,
  TOP_SCORE_CAPS,
  CLOSE_CAPS,
  LOGOUT,
  LOGOUT_SUCCESS
} from "../../constants/string";
import { LoginAndSignUp } from "../../constants/navigation.jsx";
import { GENERIC_FAILIURE, GENERIC_SUCCESS } from "../../constants/codes.jsx";
import "./MemoryGame.css";
import Overlay from "../../components/overlay/Overlay";
import { useNavigate } from "react-router-dom";

import SpaceFiller from "../../components/spaceFiller/SpaceFiller.jsx";
import { toast } from "react-toastify";
import { ToastMsgStructure } from "../../components/toastMsg/ToastMsgStructure.jsx";

const INITIAL_MINUTES = 5;
const INITIAL_SECONDS = 0;

export default function MemoryGame() {
  const token = localStorage.getItem("accessToken");
  const tokenDetails = useJwt(token);
  const divRef = useRef(null); // Create a ref for the div
  const footerRef = useRef(null); // Create a ref for the div
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [checkPairArray, setCheckPairArray] = useState([]);

  const [itemCount, setItemCount] = useState(4);
  const [headerHeight, setHeaderHeight] = useState(0); // State to store the height
  const [footerHeight, setFooterHeight] = useState(0); // State to store the height
  const [isRunning, setIsRunning] = useState(false);
  const [initialMinute, setInitialMinute] = useState(INITIAL_MINUTES);
  const [initialSecond, setInitialSecond] = useState(INITIAL_SECONDS);
  const [timerKey, setTimerKey] = useState(0);
  const [isAllFlipped, setIsAllFlipped] = useState(false);
  const [stoppageTime, setStoppageTime] = useState("");
  const [isOverlayOpen, setOverlayOpen] = useState(false);
  const [highScoreList, setHighScoreList] = useState([]);
  const [userEmail, setUserEmail] = useState("");
  const [dropdownValue, setDropdownValue] = useState("4"); // State to store the height
  const [options] = useState([
    {
      label: FOUR_BY_FOUR,
      value: "4",
    },
    {
      label: SIX_BY_SIX,
      value: "6",
    },
  ]);

  useEffect(() => {
    // Check if token is valid and extract user email
    if (tokenDetails) {
      setUserEmail(tokenDetails?.decodedToken?.username);
    }
  }, []);

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
      setIsRunning(false);
    }
  }, [selectedItems, items]);

  useEffect(() => {
    if (isAllFlipped) {
      submitScoreApi();
    }
  }, [stoppageTime]);

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
      selectedItems?.some((item) => item.id === ele.id) &&
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
    setInitialMinute(INITIAL_MINUTES);
    setInitialSecond(INITIAL_SECONDS);
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
    setStoppageTime(time);
  };

  const toggleOverlay = () => {
    if (!isOverlayOpen) {
      getHighScore();
    } else {
      setOverlayOpen(!isOverlayOpen);
    }
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
            <div
              key={`${index}${JSON.stringify(ele)}`}
              onClick={() => cirleClicked(ele)}
            >
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

  const submitScoreApi = async () => {
    const score = String(stoppageTime?.minutes * 60 + stoppageTime?.seconds);
    const result = await submitScore(urlGenerator("submitScore"), {
      email: userEmail,
      score,
      matrixSize: String(dropdownValue),
    });
    if (String(result?.data?.statusCode) === GENERIC_SUCCESS) {
      toast.success(result?.data?.desc, ToastMsgStructure);
    } else if (String(result?.data?.statusCode) === GENERIC_FAILIURE) {
      toast.error(result?.data?.desc, ToastMsgStructure);
    } else {
      toast.error("Error...", ToastMsgStructure);
    }
  };

  const getHighScore = async () => {
    const result = await fetchHighScore(urlGenerator("getHighScore"), {
      matrixSize: String(dropdownValue),
    });
    if (String(result?.data?.statusCode) === GENERIC_SUCCESS) {
      //  toast.success(result?.data?.desc, ToastMsgStructure);/
      setHighScoreList(result?.data?.list);
      setOverlayOpen(!isOverlayOpen);
    } else if (String(result?.data?.statusCode) === GENERIC_FAILIURE) {
      toast.error(result?.data?.desc, ToastMsgStructure);
    } else {
      toast.error("Error...", ToastMsgStructure);
    }
  };

  const overlayContent = () => {
    if (highScoreList.length > 0) {
      return (
        <>
          <SpaceFiller margin="20px" />
          <div className="overlay-content-table">
            <div className="overlay-table-header1">{EMAIL_CAPS}</div>
            <div className="overlay-table-header2">{`${SCORE_CAPS} (${dropdownValue} * ${dropdownValue})`}</div>
          </div>
          <SpaceFiller margin="20px" />
          {highScoreList.map((ele, i) => (
            <div key={`${i}_${JSON.stringify(ele)}`}>
              <div
                className={`overlay-content-table ${
                  i % 2 === 0 ? "grey-backgroud" : ""
                }`}
              >
                <div className="overlay-table-column1">{ele.email}</div>
                <div className="overlay-table-column2">
                  {scoreFormatter(ele.score)}
                </div>
              </div>
              <SpaceFiller margin="5px" />
            </div>
          ))}
          <SpaceFiller margin="20px" />
        </>
      );
    }
    return null;
  };

  const scoreFormatter = (seconds) => {
    const minutes = Math.floor(seconds / 60); // Get the minutes
    const remainingSeconds = seconds % 60; // Get the remaining seconds
    return `${minutes} min ${
      remainingSeconds < 10 ? "0" : ""
    }${remainingSeconds} sec`;
  };

  const onLogOutClick = () => {
    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      navigate(LoginAndSignUp); // Make sure LoginAndSignUp is a route or path string
      toast.success(LOGOUT_SUCCESS, ToastMsgStructure);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="parentMGameWrapper">
      <div className="header" ref={divRef}>
        <div className="headerContent">
          <div className="mGameTitle">{FUN_STACK}</div>
          <div className="mGameHeaderButtonWrapper">
            <select
              id="options"
              className="styled-select"
              onChange={(e) => onDropdownSelect(e)}
            >
              {options.map((ele, index) => (
                <option
                  key={`${index}${JSON.stringify(ele)}`}
                  value={ele.value}
                >
                  {ele.label}
                </option>
              ))}
            </select>
            <button className="logout-button" onClick={onLogOutClick}>
              {LOGOUT}
            </button>
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
      <div
        className={"footer common-flex-box"}
        style={{ gap: "30px" }}
        ref={footerRef}
      >
        <button className="newButtonMGame" onClick={newGameButtonClicked}>
          {NEW_GAME}
        </button>
        <Timer
          key={timerKey}
          initialMinutes={initialMinute}
          initialSeconds={initialSecond}
          isRunning={isRunning}
          onStop={handleTimerStop}
          minimumMinute={0}
          minimumSeconds={30}
        />
        <div className="topScore-container" onClick={toggleOverlay}>
          {TOP_SCORE}
        </div>
      </div>
      {isOverlayOpen && (
        <Overlay
          headerTitle={TOP_SCORE_CAPS}
          buttonTitle={CLOSE_CAPS}
          content={overlayContent()}
          onClose={toggleOverlay}
        />
      )}
    </div>
  );
}
