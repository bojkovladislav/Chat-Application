import { io } from "socket.io-client";

const URL: string = "https://chat-application-server-dcth.onrender.com";

export const socket = io(URL);
