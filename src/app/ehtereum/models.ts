export interface Land {
    id?: number;
    startCoordinate: SerializableVector3Int;
    endCoordinate: SerializableVector3Int;
    time?: number;
    ipfsKey?: string;
    isNft?: boolean;
    owner?: string;
    ownerIndex?: number;
    properties?: LandProperties;
}

export interface PricedLand extends Land {
    price?: number;
}

export interface SerializableVector3Int {
    x: number;
    y: number;
    z: number;
}

export interface LandProperties {
    color: string;
}
