#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { convertSplineToThreeJs } from '../convert/index';

// Default input splinecode file if none is provided
const DEFAULT_INPUT_FILE = 'scene.splinecode';

async function main() {
    const inputFile = process.argv[2] || DEFAULT_INPUT_FILE;
    const inputPath = path.resolve(inputFile);

    // Create a timestamped output directory under 'generated'
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const baseOutputDir = path.resolve('generated');
    const outputDir = path.join(baseOutputDir, timestamp);
    fs.mkdirSync(outputDir, { recursive: true });

    const outputFile = 'generatedScene.js';
    const outputPath = path.join(outputDir, outputFile);

    console.log(`Starting Spline to Three.js conversion...`);
    console.log(`  Input:  ${inputPath}`);
    console.log(`  Output: ${outputPath}`);

    try {
        await convertSplineToThreeJs(inputPath, outputPath);
    } catch (error) {
        console.error("\nConversion failed:", error);
        process.exit(1);
    }
}

main().catch(err => {
    console.error("Unexpected error in CLI:", err);
    process.exit(1);
}); 