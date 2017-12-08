import {ISocketHandlerMetadata} from "./ISocketHandlerMetadata";

/**
 * @experimental
 */
export interface ISocketProviderMetadata {
    namespace: string;
    handlers: {
        [propertyKey: string]: ISocketHandlerMetadata
    };
}