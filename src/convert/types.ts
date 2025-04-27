import { UUID } from "../shared/types";
import { ExtBuffer } from "../shared/msgpack";

/**
 * Represents a transform vector (typically position, rotation, or scale).
 */
export type Transform = [number, number, number];

/**
 * Represents a schema definition (array of strings, likely field names).
 */
export type Schema = string[];

/**
 * Represents the structured data parsed from the splinecode file.
 */
export interface SplineSceneData {
    items: unknown[];
    uuids: UUID[];
    transforms: Transform[];
    geometryBlobs: ExtBuffer[];
    schemas: Schema[];
}

/**
 * Represents the generated Three.js scene code.
 */
export interface ThreeJsScene {
    code: string;
} 