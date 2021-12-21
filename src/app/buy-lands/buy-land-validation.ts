import { Land } from "../ehtereum/models";

export interface BuyLandValidation {
    valid: boolean;
    signature: string;
    lastCheckedLandId:number;
    conflictingLand?: Land
}