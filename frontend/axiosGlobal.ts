/* eslint-disable react-hooks/rules-of-hooks */
import axios from "axios";

export const $API_HOST = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;

export const $AuthHeader = {
  Accept: "application/json",
};

export const AxiosHost = axios.create({
  baseURL: $API_HOST,
});
