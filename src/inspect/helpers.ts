import { UUID } from '../shared/types';
import { ExtBuffer, isExtBufferType, isExtBuffer } from '../shared/msgpack';
import { Transform, Schema, NumericList } from './types';

const UUID_REGEX = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
const GEOMETRY_BLOB_EXT_TYPE = 116;

/**
 * Type guard to check if a value is a UUID string.
 */
export function isUUID(value: unknown): value is UUID {
    return typeof value === 'string' && UUID_REGEX.test(value);
}

/**
 * Type guard to check if a value is a transform vector (array of 3 numbers).
 */
export function isTransform(value: unknown): value is Transform {
    return (
        Array.isArray(value) &&
        value.length === 3 &&
        value.every((n) => typeof n === 'number')
    );
}

/**
 * Type guard to check if a value is a geometry blob (ExtType 116).
 */
export function isGeometryBlob(value: unknown): value is ExtBuffer {
    return isExtBufferType(value, GEOMETRY_BLOB_EXT_TYPE);
}

/**
 * Type guard to check if a value is a schema definition.
 */
export function isSchema(value: unknown): value is Schema {
    return (
        Array.isArray(value) &&
        value.length > 3 && // Based on original logic
        value.every((k) => typeof k === 'string')
    );
}

/**
 * Type guard to check if a value is a numeric list (based on original heuristic).
 */
export function isNumericList(value: unknown): value is NumericList {
    return (
        Array.isArray(value) &&
        value.length > 5 && // Based on original logic
        value.every((x) => typeof x === 'number')
    );
}

/**
 * Determines the MessagePack type category for an item.
 */
export function getMsgPackType(item: unknown): string {
    if (item === null) return 'null';
    if (Array.isArray(item)) return 'array';
    if (isExtBuffer(item)) return `ext${item.type}`;
    return typeof item;
} 