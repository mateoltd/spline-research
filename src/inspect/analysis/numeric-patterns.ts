import { NumericList } from "../types";
import { isNumericList } from "../helpers";

export interface NumericPatternAnalysisResult {
    numericLists: NumericList[];
    repeatedLists: NumericList[];
}

/**
 * Analysis 4: Finds numeric lists and identifies those with repeated patterns.
 *
 * @param items The array of decoded MessagePack items.
 * @returns An object containing all numeric lists and lists with low uniqueness.
 */
export function analyzeNumericPatterns(items: unknown[]): NumericPatternAnalysisResult {
    const numericLists = items.filter(isNumericList);

    // Scan for repeated patterns (low uniqueness ratio)
    const repeatedLists = numericLists.filter(arr => {
        if (arr.length === 0) return false; // Avoid division by zero
        const uniqueCount = new Set(arr).size;
        return uniqueCount / arr.length < 0.8; // Threshold from original code
    });

    return { numericLists, repeatedLists };
} 