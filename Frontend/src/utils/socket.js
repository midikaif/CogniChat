import {io} from "socket.io-client";

export const connectSocket = () => {
    const SOCKET_URL = import.meta.env.DEV
      ? "http://localhost:3000"
      : "https://cognichat-fv23.onrender.com";


    return io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket"],
    });
}