// Spline to Three.js Converter
// Parses `.splinecode` MessagePack stream and generates a Three.js scene.

import * as fs from 'fs';
import * as THREE from 'three'; // Assuming THREE types are available via @types/three
import { decodeAll } from '../shared/msgpack';
import { SplineSceneData, ThreeJsScene, Transform } from './types';
import { isUUID, isTransform, isGeometryBlob, isSchema, getRandomHexColor } from './helpers';
import { UUID } from '../shared/types';

/**
 * Parses the raw MessagePack items into structured scene data.
 */
function parseSplineData(items: unknown[]): SplineSceneData {
    const uuids = items.filter(isUUID);
    const transforms = items.filter(isTransform);
    const geometryBlobs = items.filter(isGeometryBlob);
    const schemas = items.filter(isSchema);

    return {
        items,
        uuids,
        transforms,
        geometryBlobs,
        schemas,
    };
}

/**
 * Generates Three.js scene code from parsed Spline data.
 */
function generateThreeJsScene(data: SplineSceneData): ThreeJsScene {
    let output = `import * as THREE from 'three';\n\n`;
    output += `export function createScene() {\n`;
    output += `  const scene = new THREE.Scene();\n\n`;

    data.uuids.forEach((uuid: UUID, index: number) => {
        const geometryBlob = data.geometryBlobs.find((_, i) => i === index); // Simple index association
        const transform = data.transforms.find((_, i) => i === index); // Simple index association

        output += `  // Node UUID: ${uuid}\n`;

        if (geometryBlob) {
            output += `  const geo${index} = new THREE.BoxGeometry(1, 1, 1); // Placeholder for geometry blob\n`;
        } else {
            output += `  const geo${index} = new THREE.SphereGeometry(0.5); // Default placeholder\n`;
        }

        const randomColor = getRandomHexColor();
        output += `  const mat${index} = new THREE.MeshBasicMaterial({ color: ${randomColor}, wireframe: true });\n`;
        output += `  const mesh${index} = new THREE.Mesh(geo${index}, mat${index});\n`;

        if (transform) {
            const [x, y, z] = transform;
            output += `  mesh${index}.position.set(${x}, ${y}, ${z});\n`;
        }

        output += `  scene.add(mesh${index});\n\n`;
    });

    output += `  return scene;\n`;
    output += `}\n\n`;

    // Add notes
    output += `// Notes:\n`;
    output += `// - Geometry blobs (ExtType 116) are placeholders until proprietary format is decoded.\n`;
    output += `// - UUIDs mapped to meshes, but actual node types and hierarchies need further decoding.\n`;
    output += `// - No materials, lights, or cameras due to lack of direct mappings.\n`;
    output += `// - Schema definitions detected (${data.schemas.length}) but not yet linked to value structures.\n`;

    return { code: output };
}

/**
 * Reads a splinecode file, converts it, and writes a Three.js scene file.
 *
 * @param inputPath Path to the .splinecode file.
 * @param outputPath Path to write the generated .js file.
 */
export async function convertSplineToThreeJs(inputPath: string, outputPath: string): Promise<void> {
    console.log(`Reading splinecode file: ${inputPath}`);
    const data = fs.readFileSync(inputPath);

    console.log(`Decoding MessagePack data...`);
    const items = await decodeAll(data);

    console.log(`Parsing ${items.length} items...`);
    const splineData = parseSplineData(items);

    console.log(`Generating Three.js scene code...`);
    const threeJsScene = generateThreeJsScene(splineData);

    console.log(`Writing Three.js scene to: ${outputPath}`);
    fs.writeFileSync(outputPath, threeJsScene.code);

    console.log('Conversion complete.');
}

/* TODO:
- Implement schema-to-data mapping once value pairing is confirmed.
- Decode ExtType 114 for materials, lights, cameras when structure is known.
- Reverse engineer ExtType 116 geometry format.
- Handle animations and dynamic behaviors.
*/ 