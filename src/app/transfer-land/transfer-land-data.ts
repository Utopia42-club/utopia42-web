import { UtopiaContract } from "../ehtereum/utopia-contract";
import { TransferLandRequest } from "../utopia-game/utopia-bridge.service";

export interface TransferLandData {
    request: TransferLandRequest;
    contract: UtopiaContract;
}