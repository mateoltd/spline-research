import { UUID } from "../../shared/types";
import { ExtBuffer } from "../../shared/msgpack";
import { Transform, Schema } from "../types";
import { isUUID, isTransform, isGeometryBlob, isSchema } from "../helpers";

export interface IdentifierAnalysisResult {
    uuids: UUID[];
    transforms: Transform[];
    geometryBlobs: ExtBuffer[];
    schemas: Schema[];
}

/**
 * Analysis 3: Identifies specific item types like UUIDs, transforms, etc.
 *
 * @param items The array of decoded MessagePack items.
 * @returns An object containing arrays of identified items.
 */
export function analyzeIdentifiers(items: unknown[]): IdentifierAnalysisResult {
    const uuids = items.filter(isUUID);
    const transforms = items.filter(isTransform);
    const geometryBlobs = items.filter(isGeometryBlob);
    const schemas = items.filter(isSchema);

    return { uuids, transforms, geometryBlobs, schemas };
} 