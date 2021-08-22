import { UtopiaContract } from "../ehtereum/utopia-contract";
import { UpdateProfileRequest } from "../utopia-game/utopia-bridge.service";

export interface UpdateProfileData {
    request: UpdateProfileRequest;
    contract: UtopiaContract;
}