import {
    isUUID,
    isTransform,
    isGeometryBlob,
    isSchema,
    isNumericList,
    getMsgPackType
} from "../helpers";
import { isExtBuffer } from "../../shared/msgpack";
import { TranslatedItem, SplineTranslation, TranslationMetadata } from "../types";

const MAX_DISPLAY_LENGTH = 100; // Max length for strings/buffers in JSON
const MAX_ARRAY_ITEMS = 20; // Max items to show directly in arrays

/**
 * Creates a display-friendly representation of a value, truncating if necessary.
 */
function getDisplayValue(value: unknown): { displayValue: any; rawValue?: any } {
    if (typeof value === 'string' && value.length > MAX_DISPLAY_LENGTH) {
        return {
            displayValue: `${value.substring(0, MAX_DISPLAY_LENGTH)}... (truncated)`,
            rawValue: value
        };
    }
    if (Buffer.isBuffer(value)) {
         if (value.length > MAX_DISPLAY_LENGTH) {
            return { displayValue: `Buffer(length=${value.length}, truncated)`, rawValue: value };
         } else {
             // Display short buffers as hex
            return { displayValue: `Buffer<${value.toString('hex')}>`, rawValue: value };
         }
    }
     if (value instanceof Uint8Array) {
         if (value.length > MAX_DISPLAY_LENGTH) {
             return { displayValue: `Uint8Array(length=${value.length}, truncated)`, rawValue: value };
         } else {
              // Display short arrays directly
              return { displayValue: Array.from(value), rawValue: value }; // Convert to plain array for JSON
         }
     }
    if (Array.isArray(value) && value.length > MAX_ARRAY_ITEMS) {
        return {
            displayValue: `Array(length=${value.length}, truncated)`, // Consider showing first few items
            rawValue: value
        };
    }
    // For other types (numbers, booleans, small arrays, objects), display directly
    return { displayValue: value };
}

/**
 * Determines the potential semantic type based on type guards.
 */
function getPotentialType(item: unknown): TranslatedItem['potentialType'] {
    if (isUUID(item)) return "UUID";
    if (isTransform(item)) return "Transform";
    if (isGeometryBlob(item)) return "GeometryBlob"; // Specific ExtType 116
    if (isSchema(item)) return "Schema";
    if (isNumericList(item)) return "NumericList";
    if (isExtBuffer(item)) return "ExtBuffer"; // Any other ExtBuffer
    if (typeof item === 'string') return "String";
    if (typeof item === 'number') return "Number";
    if (typeof item === 'boolean') return "Boolean";
    if (item === null) return "Null";
    if (Array.isArray(item)) return "Array";
    if (typeof item === 'object') return "Object";
    return "Unknown";
}

/**
 * Generates a structured JSON representation of the decoded MessagePack items.
 *
 * @param items The array of decoded MessagePack items.
 * @param inputFilePath Optional path to the input file for metadata.
 * @returns A SplineTranslation object ready for JSON serialization.
 */
export function generateTranslationJson(items: unknown[], inputFilePath?: string): SplineTranslation {
    const translatedItems: TranslatedItem[] = items.map((item, index) => {
        const { displayValue, rawValue } = getDisplayValue(item);
        const translatedItem: TranslatedItem = {
            index,
            msgpackType: getMsgPackType(item),
            potentialType: getPotentialType(item),
            value: displayValue,
        };
        if (rawValue !== undefined) {
            // Note: Storing rawValue might significantly increase JSON size
            // Consider omitting it or using it selectively
            // translatedItem.rawValue = rawValue; // Uncomment to include raw value
        }
        return translatedItem;
    });

    const metadata: TranslationMetadata = {
        generatedAt: new Date().toISOString(),
        isCompleteRepresentation: false,
        notes: "This is a best-effort translation based on observed MessagePack items. Structure, relationships, and ExtBuffer contents are inferred.",
        totalItems: items.length,
        inputFile: inputFilePath
    };

    return {
        metadata,
        items: translatedItems,
    };
} 