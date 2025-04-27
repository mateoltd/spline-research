// Spline Inspector
// Unpacks and analyzes `.splinecode` files.

import * as fs from 'fs';
import { decodeAll } from '../shared/msgpack';
import { InspectionReport } from './types';
import { analyzeTypeCounts } from './analysis/type-counts';
import { analyzeExtFrequencies } from './analysis/ext-freq';
import { analyzeIdentifiers } from './analysis/identifier-analysis';
import { analyzeNumericPatterns } from './analysis/numeric-patterns';
import { analyzeZlibAttempts } from './analysis/zlib-attempts';
import { analyzeStringStats } from './analysis/string-stats';

/**
 * Reads, unpacks, and analyzes a splinecode file, generating a report.
 *
 * @param filePath Path to the .splinecode file.
 * @param reportPath Path to write the JSON report.
 */
export async function inspectSplineFile(filePath: string, reportPath: string): Promise<void> {
    console.log(`Inspecting file: ${filePath}`);

    if (!fs.existsSync(filePath)) {
        console.error(`Error: File not found at ${filePath}`);
        // Optionally throw an error or write an error report
        fs.writeFileSync(reportPath, JSON.stringify({ filePath, errors: [`File not found at ${filePath}`] }, null, 2));
        return;
    }

    let items: unknown[];
    try {
        const buffer = fs.readFileSync(filePath);
        console.log(`Read ${buffer.length} bytes.`);
        items = await decodeAll(buffer);
        console.log(`Unpacked ${items.length} MessagePack items.`);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown decoding error';
        console.error(`Error decoding file: ${errorMessage}`);
        fs.writeFileSync(reportPath, JSON.stringify({ filePath, totalItems: 0, errors: [`Decoding failed: ${errorMessage}`] }, null, 2));
        return;
    }

    console.log('Running analyses...');

    // Run all analyses
    const typeCounts = analyzeTypeCounts(items);
    const extFreq = analyzeExtFrequencies(items);
    const { uuids, transforms, geometryBlobs, schemas } = analyzeIdentifiers(items);
    const { numericLists, repeatedLists } = analyzeNumericPatterns(items);
    const zlibAttempts = analyzeZlibAttempts(items);
    const stringLengthStats = analyzeStringStats(items);

    // Consolidate report
    const report: InspectionReport = {
        filePath,
        totalItems: items.length,
        typeCounts,
        extFreq,
        uuids: { count: uuids.length, sample: uuids.slice(0, 10) }, // Sample UUIDs
        transforms: { count: transforms.length, sample: transforms.slice(0, 5) }, // Sample transforms
        geometryBlobs: { count: geometryBlobs.length },
        schemas: { count: schemas.length },
        numericLists: { count: numericLists.length },
        repeatedLists: { count: repeatedLists.length },
        zlibAttempts,
        stringLengthStats,
    };

    // Output JSON report
    try {
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`Inspection report written to ${reportPath}`);
    } catch (error) {
        const writeErrorMessage = error instanceof Error ? error.message : 'Unknown error writing report';
        console.error(`Error writing report: ${writeErrorMessage}`);
        // Log the report to console as a fallback
        console.error('Report Data:', JSON.stringify(report, null, 2));
    }
}

// TODO: Expand with visualizations, histogram generation, deep correlation tests 