import axios from "axios";
import { API_BASE_URL } from "../env"

export const registerUser = async (url: string, body: any) => {
  try {
    const result = await axios.post(url, { ...body });
    return result;
  } catch (err) {
    return err;
  }
};

export const loginUser = async (url: string, body: any) => {
  try {
    const result = await axios.post(url, { ...body });
    return result;
  } catch (err) {
    return err;
  }
};

export const submitScore = async (url: string, body: any) => {
  try {
    const result = await axios.post(url, { ...body });
    return result;
  } catch (err) {
    return err;
  }
};

export const urlGenerator = (endURL: string) => `${API_BASE_URL}${endURL}`;