import { UtopiaContract } from "../ehtereum/utopia-contract";
import { GameRequest } from "../utopia-game/game-request";

export interface SaveLandsData {
    request: GameRequest<string[]>;
    contract: UtopiaContract;
}