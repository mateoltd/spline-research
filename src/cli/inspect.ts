#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { inspectSplineFile } from '../inspect/index';

// Default input splinecode file if none is provided
const DEFAULT_INPUT_FILE = 'scene.splinecode';
const REPORT_FILENAME = 'spline_insight_report.json';
const TRANSLATION_FILENAME = 'spline_translation.json';

async function main() {
    const inputFile = process.argv[2] || DEFAULT_INPUT_FILE;
    const inputPath = path.resolve(inputFile);

    // Create a timestamped output directory under 'generated'
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const baseOutputDir = path.resolve('generated');
    const outputDir = path.join(baseOutputDir, timestamp);
    fs.mkdirSync(outputDir, { recursive: true });

    // Define paths for both output files
    const reportPath = path.join(outputDir, REPORT_FILENAME);
    const translationPath = path.join(outputDir, TRANSLATION_FILENAME);

    console.log(`Starting Spline inspection...`);
    console.log(`  Input:  ${inputPath}`);
    console.log(`  Outputs in: ${outputDir}`);
    // console.log(`    Report:      ${reportPath}`); // Keep logs cleaner
    // console.log(`    Translation: ${translationPath}`);

    try {
        // Pass both paths to the inspect function
        await inspectSplineFile(inputPath, reportPath, translationPath);
        console.log(`Inspection complete.`);
    } catch (error) {
        // Errors during inspection (like decoding) are caught here
        console.error("\nInspection failed:", error);
        process.exit(1);
    }
}

main().catch(err => {
    // Catch unexpected errors in the CLI runner itself
    console.error("Unexpected error running inspect CLI:", err);
    process.exit(1);
}); 