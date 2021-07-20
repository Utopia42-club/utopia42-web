import { ConnectionDetail } from "../ehtereum/connection-detail";

export interface GameRequest<T> {
    connection: ConnectionDetail;
    body: T;
}
