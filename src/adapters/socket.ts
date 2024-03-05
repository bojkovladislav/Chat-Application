import { io } from "socket.io-client";

const URL: string = "http://localhost:5000";
// const URL: string = "https://chat-application-server-dcth.onrender.com";

export const socket = io(URL);
