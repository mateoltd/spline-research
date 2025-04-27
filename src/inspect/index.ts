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
import { generateTranslationJson } from './analysis/translation';
import { SplineTranslation } from './types';

/**
 * Reads, unpacks, and analyzes a splinecode file, generating both a statistical
 * report and a structural JSON translation.
 *
 * @param filePath Path to the .splinecode file.
 * @param reportPath Path to write the statistical JSON report.
 * @param translationPath Path to write the structural JSON translation.
 */
export async function inspectSplineFile(
    filePath: string,
    reportPath: string,
    translationPath: string
): Promise<void> {
    console.log(`Inspecting file: ${filePath}`);

    if (!fs.existsSync(filePath)) {
        console.error(`Error: File not found at ${filePath}`);
        const errorPayload = { filePath, errors: [`File not found at ${filePath}`] };
        // Attempt to write error to both potential output files
        try { fs.writeFileSync(reportPath, JSON.stringify(errorPayload, null, 2)); } catch {}
        try { fs.writeFileSync(translationPath, JSON.stringify(errorPayload, null, 2)); } catch {}
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
        const errorPayload = { filePath, totalItems: 0, errors: [`Decoding failed: ${errorMessage}`] };
        try { fs.writeFileSync(reportPath, JSON.stringify(errorPayload, null, 2)); } catch {}
        try { fs.writeFileSync(translationPath, JSON.stringify(errorPayload, null, 2)); } catch {}
        return;
    }

    console.log('Running statistical analyses...');
    const typeCounts = analyzeTypeCounts(items);
    const extFreq = analyzeExtFrequencies(items);
    const { uuids, transforms, geometryBlobs, schemas } = analyzeIdentifiers(items);
    const { numericLists, repeatedLists } = analyzeNumericPatterns(items);
    const zlibAttempts = analyzeZlibAttempts(items);
    const stringLengthStats = analyzeStringStats(items);

    const report: InspectionReport = {
        filePath,
        totalItems: items.length,
        typeCounts,
        extFreq,
        uuids: { count: uuids.length, sample: uuids.slice(0, 10) },
        transforms: { count: transforms.length, sample: transforms.slice(0, 5) },
        geometryBlobs: { count: geometryBlobs.length },
        schemas: { count: schemas.length },
        numericLists: { count: numericLists.length },
        repeatedLists: { count: repeatedLists.length },
        zlibAttempts,
        stringLengthStats,
    };

    console.log('Generating structural JSON translation...');
    let translation: SplineTranslation;
    try {
        translation = generateTranslationJson(items, filePath);
    } catch(genError) {
        console.error(`Error generating translation JSON: ${genError}`);
        // Decide how to handle - maybe add error to report?
        report.errors = [...(report.errors || []), `Translation generation failed: ${genError}`];
        translation = {
            metadata: { generatedAt: new Date().toISOString(), isCompleteRepresentation: false, notes: `Generation failed: ${genError}`, totalItems: items.length, inputFile: filePath },
            items: []
        };
    }

    try {
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`  Statistical report written to: ${reportPath}`);
    } catch (error) {
        const writeErrorMessage = error instanceof Error ? error.message : 'Unknown error writing report';
        console.error(`Error writing statistical report: ${writeErrorMessage}`);
        console.error('Report Data:', JSON.stringify(report, null, 2));
    }

    try {
        fs.writeFileSync(translationPath, JSON.stringify(translation, null, 2));
        console.log(`  Structural translation written to: ${translationPath}`);
    } catch (error) {
        const writeErrorMessage = error instanceof Error ? error.message : 'Unknown error writing translation';
        console.error(`Error writing structural translation: ${writeErrorMessage}`);
        console.error('Translation Data:', JSON.stringify(translation, null, 2));
    }
}

// TODO: Expand with visualizations, histogram generation, deep correlation tests 