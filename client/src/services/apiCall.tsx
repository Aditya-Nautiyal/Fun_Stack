// Accept or reject a friend request in Firestore
import {
  doc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
  or,
  and,
  setDoc,
  getDoc,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "../firebase/firebase.js";

/**
 * Update the status of a friend request (accept or reject)
 * @param requestId The Firestore document ID of the friend request
 * @param action "accept" or "reject"
 */
export const respondFriendRequest = async (
  requestId: string,
  action: "accept" | "reject",
) => {
  if (!requestId || !["accept", "reject"].includes(action)) {
    return { error: "Invalid input." };
  }
  try {
    const requestRef = doc(db, "friendRequests", requestId);
    await updateDoc(requestRef, {
      status: action === "accept" ? "accepted" : "rejected",
      respondedAt: serverTimestamp(),
    });
    return { message: `Request ${action}ed.` };
  } catch (err) {
    let errorMsg = "Error updating request.";
    if (err && typeof err === "object" && "message" in err) {
      errorMsg = (err as { message?: string }).message || errorMsg;
    }
    return { error: errorMsg };
  }
};
// Real-time listener for friend requests (received by user)

/**
 * Listen for real-time updates to friend requests (both sent and received).
 * @param userEmail The email of the user to listen for requests.
 * @param callback Function to call with the updated requests array.
 * @returns Unsubscribe function to stop listening.
 */
export const listenToFriendRequests = (
  userEmail: string,
  callback: (requests: DocumentData[]) => void,
) => {
  const q = query(
    collection(db, "friendRequests"),
    and(
      where("status", "==", "pending"),
      or(
        where("recipient", "==", userEmail),
        where("requester", "==", userEmail)
      )
    )
  );

  const unsub = onSnapshot(
    q,
    (snapshot: QuerySnapshot<DocumentData>) => {
      const requests = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(requests);
    },
    (err) => {
      console.error("Firebase Friend Requests Error: ", err.message);
    }
  );

  return unsub;
};
import axiosInstance from "./axiosInstance";
import { API_BASE_URL } from "../env";

export const registerUser = async (url: string, body: any) => {
  try {
    const result = await axiosInstance.post(url, { ...body });
    return result;
  } catch (err) {
    return err;
  }
};

export const loginUser = async (url: string, body: any) => {
  try {
    const result = await axiosInstance.post(url, { ...body });
    return result;
  } catch (err) {
    return err;
  }
};

export const submitScore = async (url: string, body: any) => {
  try {
    const result = await axiosInstance.post(url, { ...body });
    return result;
  } catch (err) {
    return err;
  }
};

export const fetchHighScore = async (url: string, body: any) => {
  try {
    const result = await axiosInstance.post(url, { ...body });
    return result;
  } catch (err) {
    return err;
  }
};

/**
 * Listen for real-time updates to accepted friends for a user from Firestore.
 * @param userEmail The email of the current user
 * @param callback The function to return list of friends
 * @returns Array of friend emails
 */
export const listenToFriends = (
  userEmail: string,
  callback: (friends: string[]) => void,
) => {
  if (!userEmail) {
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, "friendRequests"),
    and(
      where("status", "==", "accepted"),
      or(
        where("requester", "==", userEmail),
        where("recipient", "==", userEmail)
      )
    )
  );

  const unsub = onSnapshot(
    q,
    (snap) => {
      const friends: string[] = [];
      snap.forEach((doc) => {
        const data = doc.data();
        if (data.recipient && data.recipient !== userEmail) friends.push(data.recipient);
        if (data.requester && data.requester !== userEmail) friends.push(data.requester);
      });
      callback(Array.from(new Set(friends)));
    },
    (err) => {
      console.error("Firebase Friends Index Error: ", err.message);
    }
  );

  return unsub;
};

// Firestore-based friend request sender

export const sendFriendRequest = async (
  recipient: string,
  requester: string,
) => {
  if (!recipient || !requester || recipient === requester) {
    return { error: "Invalid recipient or requester." };
  }
  try {
    // Check for existing pending/accepted request
    const q = query(
      collection(db, "friendRequests"),
      where("requester", "==", requester),
      where("recipient", "==", recipient),
      where("status", "in", ["pending", "accepted"]),
    );
    const existing = await getDocs(q);
    if (!existing.empty) {
      return { error: "Already friends or pending." };
    }
    await addDoc(collection(db, "friendRequests"), {
      requester,
      recipient,
      status: "pending",
      createdAt: serverTimestamp(),
    });
    return { message: "Friend request sent." };
  } catch (err) {
    let errorMsg = "Error sending request.";
    if (err && typeof err === "object" && "message" in err) {
      errorMsg = (err as { message?: string }).message || errorMsg;
    }
    return { error: errorMsg };
  }
};

// respondFriendRequest will be replaced by Firestore logic in the next step

export const urlGenerator = (endURL: string) => `${API_BASE_URL}${endURL}`;

// -- USER PRESENCE ENGINE --

/**
 * Updates the online status of the current user.
 * Triggered on mount, unmount, and via heartbeat.
 */
export const updateUserPresence = async (email: string, isOnline: boolean) => {
  if (!email) return;
  try {
    const userRef = doc(db, "userStatus", email);
    await setDoc(
      userRef,
      {
        email: email, // Store email to easily query by it
        online: isOnline,
        lastActive: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error("Presence update failed:", err);
  }
};

/**
 * Real-time listener for up to 10 friends' presence.
 */
export const listenToFriendsPresence = (
  friendEmails: string[],
  callback: (presenceMap: any) => void
) => {
  if (!friendEmails || friendEmails.length === 0) {
    callback({});
    return () => {};
  }

  // Firestore "in" queries support a maximum of 10 items.
  const activeChunks = friendEmails.slice(0, 10);

  const q = query(
    collection(db, "userStatus"),
    where("email", "in", activeChunks)
  );

  return onSnapshot(
    q,
    (snap) => {
      const presenceMap: any = {};
      const now = new Date().getTime();
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        
        // Define online as explicitly 'true' and having a recent heartbeat (within 2 mins)
        const lastActive = data.lastActive?.toDate().getTime() || 0;
        const isOnline = data.online === true && (now - lastActive < 120000);
        
        presenceMap[docSnap.id] = isOnline;
      });
      callback(presenceMap);
    },
    (err) => {
      console.error("Firebase Presence Listener Error: ", err.message);
    }
  );
};
