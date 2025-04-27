import { isExtBuffer } from "../../shared/msgpack";

/**
 * Analysis 2: Counts the frequency of each MessagePack ExtType.
 *
 * @param items The array of decoded MessagePack items.
 * @returns A record mapping ExtType numbers to their counts.
 */
export function analyzeExtFrequencies(items: unknown[]): Record<number, number> {
    const extFreq: Record<number, number> = {};
    for (const item of items) {
        if (isExtBuffer(item)) {
            extFreq[item.type] = (extFreq[item.type] || 0) + 1;
        }
    }
    return extFreq;
} 