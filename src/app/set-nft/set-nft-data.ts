import {UtopiaContract} from "../ehtereum/utopia-contract";
import {SetNftRequest} from "../utopia-game/utopia-bridge.service";

export interface SetNftData {
    request: SetNftRequest;
    contract: UtopiaContract;
}
