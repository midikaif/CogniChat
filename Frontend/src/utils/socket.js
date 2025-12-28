import {io} from "socket.io-client";

export const connectSocket = () => {
    const SOCKET_URL = import.meta.env.DEV ? "http://localhost:3000" : "/";

    return io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket"],
    });
}