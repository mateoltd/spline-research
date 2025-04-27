import { getMsgPackType } from "../helpers";

/**
 * Analysis 1: Counts the occurrences of each MessagePack item type.
 *
 * @param items The array of decoded MessagePack items.
 * @returns A record mapping type names to their counts.
 */
export function analyzeTypeCounts(items: unknown[]): Record<string, number> {
    const typeCounts: Record<string, number> = {};
    for (const item of items) {
        const typeKey = getMsgPackType(item);
        typeCounts[typeKey] = (typeCounts[typeKey] || 0) + 1;
    }
    return typeCounts;
} 