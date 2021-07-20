
export interface Land {
    x1: number;
    x2: number;
    y1: number;
    y2: number;
    time?: number;
    ipfsKey?: string;
}

export interface PricedLand extends Land {
    price?: number;
}