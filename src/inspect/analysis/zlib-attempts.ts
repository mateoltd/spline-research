import * as zlib from 'zlib';
import { isExtBuffer } from '../../shared/msgpack';
import { ZlibAttemptResult } from '../types';

/**
 * Analysis 5: Attempts to decompress ExtType buffers using zlib methods.
 * Note: This runs synchronously and may not be ideal for large files or many buffers.
 * Consider making this asynchronous if performance becomes an issue.
 *
 * @param items The array of decoded MessagePack items.
 * @returns An array of successful decompression attempts.
 */
export function analyzeZlibAttempts(items: unknown[]): ZlibAttemptResult[] {
    const zlibResults: ZlibAttemptResult[] = [];

    items.forEach((item, index) => {
        if (isExtBuffer(item)) {
            const data = item.data;
            const type = item.type;

            // Use try-catch for each method as they might throw
            try {
                // Note: Using sync methods for simplicity here based on original code.
                // The original code had callbacks `() => {}` which suggests async, but
                // didn't actually wait. Using sync methods is clearer.
                zlib.inflateSync(data);
                zlibResults.push({ index, type, method: 'inflate' });
            } catch {}

            try {
                zlib.inflateRawSync(data);
                zlibResults.push({ index, type, method: 'inflateRaw' });
            } catch {}

            try {
                zlib.gunzipSync(data);
                zlibResults.push({ index, type, method: 'gunzip' });
            } catch {}
        }
    });

    return zlibResults;
} 