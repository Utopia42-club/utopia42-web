import { Land } from "../ehtereum/models";
import { UtopiaContract } from "../ehtereum/utopia-contract";
import { GameRequest } from "../utopia-game/game-request";

export interface BuyLandsData {
    request: GameRequest<Land[]>;
    contract: UtopiaContract;
}