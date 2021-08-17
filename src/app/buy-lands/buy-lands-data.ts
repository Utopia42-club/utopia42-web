import { UtopiaContract } from '../ehtereum/utopia-contract';
import { BuyLandsRequest } from '../utopia-game/utopia-bridge.service';

export interface BuyLandsData {
    request: BuyLandsRequest;
    contract: UtopiaContract;
}
