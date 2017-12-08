/**
 * @experimental
 */
export interface OnConnection {
    $onConnection(socket: SocketIO.Socket, nsp: SocketIO.Namespace): void;
}