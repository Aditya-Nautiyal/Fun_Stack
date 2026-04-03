import { useRef, useEffect, useState } from "react";
import { useJwt } from "react-jwt";
import { db } from "../../firebase/firebase.js";
import { doc, getDoc, collection as fbCollection, query as fbQuery, where, orderBy as fbOrderBy, limit as fbLimit, getDocs } from "firebase/firestore";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import Timer from "../../components/timer/Timer.jsx";
import ConfettiExplosion from "react-confetti-explosion";
import {
  submitScore,
  fetchHighScore,
  urlGenerator,
  fetchFriendList,
  sendFriendRequest,
  fetchFriendRequests,
  respondFriendRequest,
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
  LOGOUT_SUCCESS,
  FRIEND_LIST_TITLE,
  FRIENDS_TAB,
  REQUESTS_TAB,
  FRIEND_EMAIL_PLACEHOLDER,
  SEND_BTN,
  STATUS_HEADER,
  HIGH_SCORE_HEADER,
  NO_FRIENDS,
  REQUESTER_HEADER,
  ACTION_HEADER,
  NO_REQUESTS,
  ACCEPT_BTN,
  REJECT_BTN,
  ONLINE,
  OFFLINE,
  FRIEND_REQUEST_SENT,
  ERR_SENDING_REQUEST,
  ERR_RESPONDING_REQUEST,
  EMAIL_HEADER
} from "../../constants/string";
import { LoginAndSignUp } from "../../constants/navigation.jsx";
import { GENERIC_FAILIURE, GENERIC_SUCCESS } from "../../constants/codes.jsx";
import "./MemoryGame.css";
import Overlay from "../../components/overlay/Overlay";
import { useNavigate } from "react-router-dom";

import SpaceFiller from "../../components/spaceFiller/SpaceFiller.jsx";
import { toast } from "react-toastify";
import { ToastMsgStructure } from "../../components/toastMsg/ToastMsgStructure.jsx";

import noMatchSound from "../../assets/sounds/noMatchSound.mp3";
import matchSound from "../../assets/sounds/matchSound.mp3";
import gameCompletion from "../../assets/sounds/gameCompletion.mp3";

const INITIAL_MINUTES = 5;
const INITIAL_SECONDS = 0;

export default function MemoryGame() {
  const token = localStorage.getItem("accessToken");
  const tokenDetails = useJwt(token);
  const divRef = useRef(null); // Create a ref for the div
  const footerRef = useRef(null); // Create a ref for the div
  const noMatchAudioRef = useRef(new Audio(noMatchSound));
  const matchAudioRef = useRef(new Audio(matchSound));
  const completionAudioRef = useRef(new Audio(gameCompletion));

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
  const [isFriendOverlayOpen, setFriendOverlayOpen] = useState(false);
  const [friendList, setFriendList] = useState([]); // Placeholder for friend data
  const [friendRequests, setFriendRequests] = useState([]);
  const [friendEmailInput, setFriendEmailInput] = useState("");
  const [activeTab, setActiveTab] = useState("friends"); // "friends" or "requests"
  // Handler to open/close friend list overlay
  const fetchFriendStatusAndScore = async (email, matrixSize = "4") => {
    // Online status: Assume a Firestore doc at users/{email} with { online: true/false }
    let online = false;
    try {
      const userDoc = await getDoc(doc(db, "users", email));
      if (userDoc.exists()) {
        online = !!userDoc.data().online;
      }
    } catch { }

    // High score: Query scoreForFour or scoreForSix, order by score desc, limit 1
    let highScore = null;
    try {
      const collectionName = matrixSize === "4" ? "scoreForFour" : "scoreForSix";
      const q = fbQuery(
        fbCollection(db, collectionName),
        where("email", "==", email),
        fbOrderBy("score", "desc"),
        fbLimit(1)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        highScore = snap.docs[0].data().score;
      }
    } catch { }
    return { online, highScore };
  };

  const fetchFriendData = async () => {
    try {
      const res = await fetchFriendList();
      if (res?.data?.friends) {
        // Fetch online status and high score for each friend
        const friendData = await Promise.all(
          res.data.friends.map(async (email) => {
            const { online, highScore } = await fetchFriendStatusAndScore(email, dropdownValue);
            return { email, online, highScore };
          })
        );
        setFriendList(friendData);
      } else {
        setFriendList([]);
      }

      const reqRes = await fetchFriendRequests();
      if (reqRes?.data?.requests) {
        setFriendRequests(reqRes.data.requests);
      } else {
        setFriendRequests([]);
      }
    } catch (err) {
      setFriendList([]);
      setFriendRequests([]);
    }
  };

  const toggleFriendOverlay = async () => {
    if (!isFriendOverlayOpen) {
      await fetchFriendData();
    } else {
      setFriendEmailInput("");
      setActiveTab("friends");
    }
    setFriendOverlayOpen((prev) => !prev);
  };

  const handleSendRequest = async () => {
    if (!friendEmailInput) return;
    const res = await sendFriendRequest(friendEmailInput);
    if (res?.data?.message === FRIEND_REQUEST_SENT) {
      toast.success(res.data.message, ToastMsgStructure);
      setFriendEmailInput("");
    } else {
      toast.error(res?.response?.data?.message || ERR_SENDING_REQUEST, ToastMsgStructure);
    }
  };

  const handleResponse = async (requester, action) => {
    const res = await respondFriendRequest(requester, action);
    if (res?.data?.message) {
      toast.success(res.data.message, ToastMsgStructure);
      await fetchFriendData(); // refresh lists
    } else {
      toast.error(ERR_RESPONDING_REQUEST, ToastMsgStructure);
    }
  };

  const [highScoreList, setHighScoreList] = useState([]);
  const [userEmail, setUserEmail] = useState("");
  const [dropdownValue, setDropdownValue] = useState("4"); // State to store the height
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
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
    if (tokenDetails) {
      setUserEmail(tokenDetails?.decodedToken?.username);
    }
  }, [tokenDetails]);

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
      if (isSoundEnabled) {
        // 🔊 PLAY NO MATCH SOUND
        noMatchAudioRef.current.currentTime = 0;
        noMatchAudioRef.current.play();
      }

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
      if (isSoundEnabled) {
        // 🔊 PLAY MATCH SOUND
        matchAudioRef.current.currentTime = 0;
        matchAudioRef.current.play();
      }

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

      if (isSoundEnabled) {
        // 🔊 PLAY GAME COMPLETION SOUND
        completionAudioRef.current.currentTime = 0;
        completionAudioRef.current.play();
      }

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
      console.log("same item clicked");

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

  //Fisher-Yates Shuffle Algorithm or Knuth Shuffle
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
                className={`mGameCircle ${selectedItems.some((item) => item.id === ele.id)
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

  const toggleOverlay = () => {
    if (!isOverlayOpen) {
      const collectionName =
        dropdownValue === "4" ? "scoreForFour" : "scoreForSix";

      const scoresRef = collection(db, collectionName);
      const q = query(scoresRef, orderBy("score", "desc"), limit(10));
      // Start listening when opening overlay (top 10 only)
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const top10 = snapshot.docs.map((doc) => doc.data());
        setHighScoreList(top10);
      });

      // Store unsubscribe if needed later
      setOverlayOpen(true);

      // Optional: Clean up listener when overlay is closed
      return () => unsubscribe();
    } else {
      setOverlayOpen(false);
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
                className={`overlay-content-table ${i % 2 === 0 ? "grey-backgroud" : ""
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
    return `${minutes} min ${remainingSeconds < 10 ? "0" : ""
      }${remainingSeconds} sec`;
  };

  const onLogOutClick = () => {
    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      navigate("/");
      toast.success(LOGOUT_SUCCESS, ToastMsgStructure);
    } catch (error) {
      console.error("Logout failed:-", error);
    }
  };

  const friendListUI = () => <Overlay
    headerTitle={FRIEND_LIST_TITLE}
    buttonTitle={CLOSE_CAPS}
    content={
      <div>
        <div className="friend-tabs-wrapper">
          <button
            className={`friend-tab-btn ${activeTab === 'friends' ? 'active' : ''}`}
            onClick={() => setActiveTab('friends')}
          >{FRIENDS_TAB} ({friendList?.length || 0})</button>
          <button
            className={`friend-tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >{REQUESTS_TAB} ({friendRequests?.length || 0})</button>
        </div>
        <SpaceFiller margin="15px" />

        {activeTab === 'friends' ? (
          <>
            <div className="friend-search-wrapper">
              <input
                type="email"
                placeholder={FRIEND_EMAIL_PLACEHOLDER}
                className="friend-email-input"
                value={friendEmailInput}
                onChange={(e) => setFriendEmailInput(e.target.value)}
              />
              <button
                className="friend-send-btn"
                onClick={handleSendRequest}
              >{SEND_BTN}</button>
            </div>
            <div className="overlay-content-table">
              <div className="overlay-table-header1">{EMAIL_HEADER}</div>
              <div className="overlay-table-header2">{STATUS_HEADER}</div>
              <div className="overlay-table-header2">{HIGH_SCORE_HEADER}</div>
            </div>
            <SpaceFiller margin="10px" />
            {friendList.length === 0 ? (
              <div className="friend-empty-state">{NO_FRIENDS}</div>
            ) : (
              friendList.map((friend, idx) => (
                <div key={idx} className={`overlay-content-table ${idx % 2 === 0 ? "grey-backgroud" : ""}`}>
                  <div className="overlay-table-column1">{friend.email}</div>
                  <div className="overlay-table-column2">
                    <span className={friend.online ? 'status-online' : 'status-offline'}>
                      {friend.online ? ONLINE : OFFLINE}
                    </span>
                  </div>
                  <div className="overlay-table-column2">{friend.highScore ?? '-'}</div>
                </div>
              ))
            )}
          </>
        ) : (
          <>
            <div className="overlay-content-table">
              <div className="overlay-table-header1">{REQUESTER_HEADER}</div>
              <div className="overlay-table-header2">{ACTION_HEADER}</div>
            </div>
            <SpaceFiller margin="10px" />
            {friendRequests.length === 0 ? (
              <div className="friend-empty-state">{NO_REQUESTS}</div>
            ) : (
              friendRequests.map((req, idx) => (
                <div key={idx} className={`overlay-content-table friend-request-row ${idx % 2 === 0 ? "grey-backgroud" : ""}`}>
                  <div className="overlay-table-column1">{req.requester}</div>
                  <div className="overlay-table-column2 friend-action-wrapper">
                    <button
                      className="friend-accept-btn"
                      onClick={() => handleResponse(req.requester, "accept")}
                    >{ACCEPT_BTN}</button>
                    <button
                      className="friend-reject-btn"
                      onClick={() => handleResponse(req.requester, "reject")}
                    >{REJECT_BTN}</button>
                  </div>
                </div>
              ))
            )}
          </>
        )}
        <SpaceFiller margin="20px" />
      </div>
    }
    onClose={toggleFriendOverlay}
  />

  return (
    <div className="parentMGameWrapper">
      <div className="header" ref={divRef}>
        <div className="headerContent">
          <div className="mGameTitle">{FUN_STACK}</div>
          <div className="mGameHeaderButtonWrapper">
            <button
              className="logout-button"
              onClick={() => setIsSoundEnabled((prev) => !prev)}
            >
              {isSoundEnabled ? "Sound ON 🔊" : "Sound OFF 🔇"}
            </button>
            <button
              className="logout-button"
              style={{ backgroundColor: '#007bff' }}
              onClick={toggleFriendOverlay}
            >
              {FRIEND_LIST_TITLE}
            </button>
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
      {isFriendOverlayOpen && friendListUI()}
    </div>
  );
}
