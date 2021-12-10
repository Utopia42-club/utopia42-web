import { Land } from "../ehtereum/models";

export interface BuyLandValidation {
    valid: boolean;
    lastCheckedLandId?:number;
    conflictingLand?: Land
}