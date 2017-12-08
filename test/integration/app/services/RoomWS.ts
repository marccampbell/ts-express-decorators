import {Args, Emit, Input, IO, Nsp, OnConnection, OnDisconnect, Socket, SocketService} from "../../../../src/socketio";

@SocketService("/room")
export class RoomWS implements OnConnection, OnDisconnect {
    constructor(@IO private io: SocketIO.Server) {

    }

    $onConnection(socket: SocketIO.Socket, nsp: SocketIO.Namespace) {

    }

    $onDisconnect(socket: SocketIO.Socket, nsp: SocketIO.Namespace) {

    }

    @Input("eventName")
    @Emit("eventTest")
    async myMethod(@Args(0) userName: string, @Socket socket: SocketIO.Socket, @Nsp nsp: SocketIO.Namespace) {
        return "my Message " + userName;
    }
}