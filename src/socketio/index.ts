import * as SocketIO from "socket.io";

declare interface IServerSettings {
    socketIO?: SocketIO.ServerOptions;
}

// interfaces
export * from "./interfaces/OnConnection";
export * from "./interfaces/OnDisconnect";

// decorators
export * from "./decorators/socketService";
export * from "./decorators/input";
export * from "./decorators/args";
export * from "./decorators/io";
export * from "./decorators/nsp";
export * from "./decorators/socket";
export * from "./decorators/emit";
export * from "./decorators/broadcast";
export * from "./decorators/broadcastOthers";

// service
export * from "./services/SocketIOServer";
export * from "./services/SocketIOService";

