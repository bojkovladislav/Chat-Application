import { io } from "socket.io-client";

const URL: string = "http://localhost:5000";

export const socket = io(URL);
