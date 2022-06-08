import { SerializableVector3Int, SerializableVector3 } from 'src/app/ehtereum/models';

export interface Block {
    name: string;
    position: SerializableVector3Int;
}

export interface MetaBlock {
    position: SerializableVector3;
    name: string;
    properties?:
        | TdObjectBlockProps
        | MarkerBlockProps
        | ImageBlockProps
        | VideoBlockProps
        | NftBlockProps;
}

interface TdObjectBlockProps {
    url: string;
    scale?: SerializableVector3;
    rotation?: SerializableVector3;
    detectCollision?: boolean;
    type?: 0 | 1;
}

interface MarkerBlockProps {
    name?: string;
}

interface ImageBlockProps {
    url: string;
    width?: number;
    height?: number;
    detectCollision?: boolean;
    rotation?: SerializableVector3;
}

interface VideoBlockProps {
    url: string;
    width?: number;
    height?: number;
    detectCollision?: boolean;
    previewTime?: number;
    rotation?: SerializableVector3;
}

interface NftBlockProps {
    collection: string;
    tokenId: number;
    width?: number;
    height?: number;
    detectCollision?: boolean;
    rotation?: SerializableVector3;
}
