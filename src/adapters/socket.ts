import { io } from "socket.io-client";

const URL: string = "https://chat-application-server-dcth.onrender.com";
// const URL: string = "http://localhost:5000";
// const URL = "http://192.168.1.56:5000";

export const socket = io(URL);
