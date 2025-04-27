import { encode, decodeMulti, decode, ExtensionCodec, DecodeError } from "@msgpack/msgpack";
import { Readable } from 'stream'; // Import Readable for stream creation

/**
 * Represents a MessagePack Extension type.
 * Note: @msgpack/msgpack uses ExtensionCodec for handling these.
 * This interface is kept for potential future use or compatibility checks,
 * but the primary mechanism involves ExtensionCodec.
 */
export interface ExtBuffer {
    type: number;
    data: Uint8Array; // Use Uint8Array as recommended by @msgpack/msgpack
}

/**
 * Checks if an item is potentially a MessagePack Extension Type object.
 * This is a basic duck-typing check. Proper handling requires ExtensionCodec.
 */
export function isExtBuffer(item: unknown): item is ExtBuffer {
    return typeof item === 'object' && item !== null && 'type' in item && 'data' in item && typeof (item as any).type === 'number' && (item as any).data instanceof Uint8Array;
}

/**
 * Checks if an item is a specific MessagePack Extension type number.
 * Requires ExtensionCodec for actual decoding of the type.
 */
export function isExtBufferType(item: unknown, extType: number): item is ExtBuffer {
    // This check is limited without an ExtensionCodec.
    // It only verifies the type property if the object structure matches.
    return isExtBuffer(item) && item.type === extType;
}

/**
 * Asynchronously decodes all MessagePack items from a buffer containing multiple concatenated objects.
 *
 * @param data The raw buffer data (Node.js Buffer or Uint8Array).
 * @returns A Promise resolving to an array of decoded items.
 * @throws If a decoding error occurs.
 */
export async function decodeAll(data: Buffer | Uint8Array): Promise<unknown[]> {
    const items: unknown[] = [];
    try {
        // decodeMulti takes the buffer directly and returns an iterable generator
        const decoder = decodeMulti(data);
        for (const item of decoder) {
            // No await needed here as decodeMulti(buffer) is synchronous iterable
            items.push(item);
        }
    } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error(`MessagePack decode error: ${err.message}`);
        // Safely check for potential DecodeError properties
        if (error instanceof DecodeError && typeof (error as any).byteOffset === 'number') {
             console.error(`DecodeError details: Offset=${(error as any).byteOffset}`);
        }
        if (err.stack) {
            console.error(err.stack);
        }
        throw new Error(`Failed to decode MessagePack. Original error: ${err.message}`);
    }
    return items;
}

// Re-export encode directly
export { encode };

// Note: ExtensionCodec setup would be needed here if custom types (like ExtBuffer 116)
// need specific encoding/decoding logic beyond standard MessagePack types.
export const extensionCodec = new ExtensionCodec();
// Example registration (if needed later):
// extensionCodec.register({ type: 116, encode: ..., decode: ... }); 