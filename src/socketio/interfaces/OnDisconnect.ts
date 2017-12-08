/**
 * @experimental
 */
export interface OnDisconnect {
    $onDisconnect(socket: SocketIO.Socket, nsp: SocketIO.Namespace): void;
}