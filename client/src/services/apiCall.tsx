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
 * Listen for real-time updates to friend requests for a recipient.
 * @param recipientEmail The email of the user to listen for requests.
 * @param callback Function to call with the updated requests array.
 * @returns Unsubscribe function to stop listening.
 */
export const listenToFriendRequests = (
  recipientEmail: string,
  callback: (requests: DocumentData[]) => void,
) => {
  const q = query(
    collection(db, "friendRequests"),
    where("recipient", "==", recipientEmail),
    where("status", "==", "pending"),
  );
  return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    const requests = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(requests);
  });
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
 * Fetches the list of accepted friends for a user from Firestore.
 * @param userEmail The email of the current user
 * @returns Array of friend emails
 */
export const fetchFriendList = async (
  userEmail: string,
): Promise<{ friends: string[] }> => {
  if (!userEmail) return { friends: [] };
  try {
    // Firestore does not support $or directly, so we need two queries
    const q1 = query(
      collection(db, "friendRequests"),
      where("status", "==", "accepted"),
      where("requester", "==", userEmail),
    );
    const q2 = query(
      collection(db, "friendRequests"),
      where("status", "==", "accepted"),
      where("recipient", "==", userEmail),
    );
    const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    const friends: string[] = [];
    snap1.forEach((doc) => {
      const data = doc.data();
      if (data.recipient && data.recipient !== userEmail)
        friends.push(data.recipient);
    });
    snap2.forEach((doc) => {
      const data = doc.data();
      if (data.requester && data.requester !== userEmail)
        friends.push(data.requester);
    });
    return { friends };
  } catch (err) {
    return { friends: [] };
  }
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
