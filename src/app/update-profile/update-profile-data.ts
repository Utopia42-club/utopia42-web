import { UtopiaContract } from "../ehtereum/utopia-contract";
import { EditProfileRequest } from "../utopia-game/utopia-bridge.service";

export interface EditProfileData {
    request: EditProfileRequest;
    contract: UtopiaContract;
}