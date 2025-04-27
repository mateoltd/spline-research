import { StringLengthStats } from "../types";

/**
 * Analysis 6: Calculates statistics on the lengths of string items.
 *
 * @param items The array of decoded MessagePack items.
 * @returns Statistics about string lengths found.
 */
export function analyzeStringStats(items: unknown[]): StringLengthStats {
    const stringLengths = items
        .filter((i): i is string => typeof i === 'string')
        .map(s => s.length);

    if (stringLengths.length === 0) {
        return { min: 0, max: 0, avg: 0, count: 0 };
    }

    const min = Math.min(...stringLengths);
    const max = Math.max(...stringLengths);
    const sum = stringLengths.reduce((a, b) => a + b, 0);
    const avg = sum / stringLengths.length;

    return {
        min,
        max,
        avg,
        count: stringLengths.length,
    };
} 