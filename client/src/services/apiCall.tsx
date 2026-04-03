import axiosInstance from "./axiosInstance";
import { API_BASE_URL } from "../env"

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

export const fetchFriendList = async () => {
  try {
    const result = await axiosInstance.get("/friend/list");
    return result;
  } catch (err) {
    return err;
  }
};

export const sendFriendRequest = async (recipient: string) => {
  try {
    const result = await axiosInstance.post("/friend/request", { recipient });
    return result;
  } catch (err) {
    return err;
  }
};

export const fetchFriendRequests = async () => {
  try {
    const result = await axiosInstance.get("/friend/requests");
    return result;
  } catch (err) {
    return err;
  }
};

export const respondFriendRequest = async (requester: string, action: "accept" | "reject") => {
  try {
    const result = await axiosInstance.post("/friend/respond", { requester, action });
    return result;
  } catch (err) {
    return err;
  }
};

export const urlGenerator = (endURL: string) => `${API_BASE_URL}${endURL}`;