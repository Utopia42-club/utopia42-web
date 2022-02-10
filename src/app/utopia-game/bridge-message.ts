import { ConnectionDetail } from '../ehtereum/connection-detail';

export interface BridgeMessage<T> {
    connection: ConnectionDetail;
    body: T;
}

export interface WebToUnityRequest {
    id: string;
    objectName: string;
    methodName: string;
    parameter: string;
}

export interface Response {
    id: string;
    body: string;
}
