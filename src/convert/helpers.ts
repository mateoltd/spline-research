import { UUID } from '../shared/types';
import { ExtBuffer, isExtBufferType } from '../shared/msgpack';
import { Transform, Schema } from './types';

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
 * Type guard to check if a value is a schema definition (array of strings).
 */
export function isSchema(value: unknown): value is Schema {
    return (
        Array.isArray(value) &&
        value.length > 3 && // Assuming schemas have more than 3 fields based on original code
        value.every((k) => typeof k === 'string')
    );
}

/**
 * Generates a random hex color string (e.g., "0xff00aa").
 */
export function getRandomHexColor(): string {
    return `0x${(0xffffff * Math.random() | 0).toString(16).padStart(6, '0')}`;
} 