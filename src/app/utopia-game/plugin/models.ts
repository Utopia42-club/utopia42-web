import { SerializableVector3Int } from "src/app/ehtereum/models";

export interface MetaBlockType {
    blockType?: string; // default to grass
    metaBlock?: ImageBlockType | VideoBlockType | LinkBlockType | TdObjectBlockType | MarkerBlockType
}

interface ImageBlockType {
    type: "image";
    properties: {
        front?: ImageFaceProps;
        back?: ImageFaceProps;
        right?: ImageFaceProps;
        left?: ImageFaceProps;
        top?: ImageFaceProps;
        bottom?: ImageFaceProps;
    };
}

interface VideoBlockType {
    type: "video";
    properties: {
        front?: VideoFaceProps;
        back?: VideoFaceProps;
        right?: VideoFaceProps;
        left?: VideoFaceProps;
        top?: VideoFaceProps;
        bottom?: VideoFaceProps;
    };
}

interface LinkBlockType {
    type: "link";
    properties: {
        url: string;
        pos: [number]
    }
}

interface TdObjectBlockType {
    type: "3d_object";
    properties: {
        scale: SerializableVector3Int;
        offset: SerializableVector3Int;
        rotation: SerializableVector3Int;
        detectCollision: boolean;
    }
}

interface MarkerBlockType {
    type: "marker";
    properties: {
        name: string
    }
}

interface ImageFaceProps {
    url: string;
    width: number;
    height: number;
    detectCollision: boolean;
}

interface VideoFaceProps {
    url: string;
    width: number;
    height: number;
    detectCollision: boolean;
    previewTime: number;
}