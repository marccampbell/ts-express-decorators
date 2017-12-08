import * as SocketIO from "socket.io";
import {ProviderStorable} from "../../di/class/ProviderStorable";
import {ISocketHandlerMetadata} from "../interfaces/ISocketHandlerMetadata";
import {ISocketParamMetadata} from "../interfaces/ISocketParamMetadata";
import {ISocketProviderMetadata} from "../interfaces/ISocketProviderMetadata";
import {SocketFilters} from "../interfaces/SocketFilters";
import {SocketReturnsTypes} from "../interfaces/SocketReturnsTypes";

/**
 * @experimental
 */
export class SocketHandlersBuilder {
    private socketProviderMetadata: ISocketProviderMetadata;

    constructor(private provider: ProviderStorable<any>) {
        this.socketProviderMetadata = this.provider.store.get("socketIO");
    }

    /**
     *
     * @returns {any}
     */
    public build(ws: SocketIO.Namespace) {

        ws.on("connection", (socket: SocketIO.Socket) => {
            this.buildHandlers(socket, ws);

            if (this.provider.instance.$onConnection) {
                this.provider.instance.$onConnection(socket, ws);
            }
        });

        if (this.provider.instance.$onDisconnect) {
            ws.on("disconnect", (socket: any) => {
                this.provider.instance.$onDisconnect(socket, ws);
            });
        }
    }

    /**
     *
     * @param {SocketIO.Socket} socket
     * @param {SocketIO.Namespace} ws
     */
    private buildHandlers(socket: SocketIO.Socket, ws: SocketIO.Namespace) {

        Object.keys(this.socketProviderMetadata.handlers)
            .forEach((propertyKey: string) => {

                const handlerMetadata: ISocketHandlerMetadata = this.socketProviderMetadata.handlers[propertyKey];

                socket.on(handlerMetadata.eventName, (...parameters: any[]) => {
                    this.invoke(handlerMetadata, parameters, socket, ws);
                });
            });
    }

    /**
     *
     * @returns {Promise<any>}
     * @param handlerMetadata
     * @param args
     * @param socket
     * @param ws
     */
    private async invoke(handlerMetadata: ISocketHandlerMetadata, args: any[], socket: SocketIO.Socket, ws: SocketIO.Namespace): Promise<void> {
        const {instance} = this.provider;
        const {methodClassName, returns} = handlerMetadata;
        const scope: any = {args, socket, ws};
        const parameters = this.buildParameters(handlerMetadata.parameters, scope);

        const result = await instance[methodClassName](...parameters);

        if (returns) {
            SocketHandlersBuilder.sendResponse(returns.eventName, returns.type, result, scope);
        }
    }

    /**
     *
     * @param parameters
     * @param scope
     * @returns {any[]}
     */
    private buildParameters(parameters: { [key: number ]: ISocketParamMetadata }, scope: any): any[] {
        return Object
            .keys(parameters)
            .map(
                (index: any) => {
                    const param: ISocketParamMetadata = parameters[index];

                    switch (param.filter) {
                        case SocketFilters.ARGS:

                            if (param.mapIndex !== undefined) {
                                return scope.args[param.mapIndex];
                            }

                            return scope.args;

                        case SocketFilters.SOCKET :
                            return scope.socket;

                        case SocketFilters.NSP:
                            return scope.ws;
                    }
                }
            );
    }

    /**
     *
     * @param {string} eventName
     * @param {SocketReturnsTypes} type
     * @param response
     * @param scope
     */
    private static sendResponse(eventName: string, type: SocketReturnsTypes, response: any, scope: any) {
        switch (type) {
            case SocketReturnsTypes.BROADCAST:
                scope.ws.emit(eventName, response);
                break;
            case SocketReturnsTypes.BROADCAST_OTHERS:
                scope.socket.broadcast.emit(eventName, response);
                break;
            case SocketReturnsTypes.EMIT:
                scope.socket.emit(eventName, response);
                break;
        }
    }
}


