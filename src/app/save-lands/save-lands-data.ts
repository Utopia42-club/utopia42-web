import { UtopiaContract } from "../ehtereum/utopia-contract";
import { SaveLandsRequest } from "../utopia-game/utopia-bridge.service";

export interface SaveLandsData {
    request: SaveLandsRequest;
    contract: UtopiaContract;
}