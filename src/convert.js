/*
Tool: Spline-to-ThreeJS Converter 

IMPORTANT: This method is in progress, it doesn't fully work right now. 

This Node.js script reads a .splinecode file, decompresses it, extracts scene JSON,
extracts textures, and generates a Three.js scene module (scene.js) with support
for meshes (buffer geometries & all common primitives), cameras, lights,
full PBR materials (albedo, normal, emissive, ao, roughness, metalness maps),
animations via THREE.AnimationMixer, and easy integration.

Usage:
  1. npm install
  2. node convert.js path/to/scene.splinecode
  3. Import and call createScene(container) in your Three.js app.
*/

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Decompress splinecode (zlib)
function decompress(data) {
  return new Promise((resolve, reject) => {
    zlib.inflate(data, (err, buffer) => {
      if (err) return reject(err);
      resolve(buffer.toString('utf8'));
    });
  });
}

async function convert(splinePath) {
  const raw = fs.readFileSync(splinePath);
  const text = await decompress(raw);
  const scene = JSON.parse(text);

  const outDir = path.resolve(__dirname, 'output');
  const texDir = path.join(outDir, 'textures');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
  if (!fs.existsSync(texDir)) fs.mkdirSync(texDir);

  // Extract textures
  if (scene.textures) {
    scene.textures.forEach((tex, i) => {
      const [meta, base64] = tex.data.split(',');
      const ext = meta.match(/image\/(\w+)/)[1];
      const buf = Buffer.from(base64, 'base64');
      const fname = `texture_${i}.${ext}`;
      fs.writeFileSync(path.join(texDir, fname), buf);
      tex.filename = `textures/${fname}`;
    });
  }

  const lines = [];
  lines.push("import * as THREE from 'three';");
  lines.push("export function createScene(container) {");
  lines.push("  const scene = new THREE.Scene();");
  lines.push("  const mixers = [];");
  lines.push("  let activeCamera = null;");

  // Cameras
  if (scene.cameras) {
    scene.cameras.forEach((cam, i) => {
      if (cam.type === 'perspective') {
        const { fov, near, far } = cam.parameters;
        lines.push(`  const camera${i} = new THREE.PerspectiveCamera(${fov}, container.clientWidth/container.clientHeight, ${near}, ${far});`);
      } else if (cam.type === 'orthographic') {
        const { left, right, top, bottom, near, far } = cam.parameters;
        lines.push(`  const camera${i} = new THREE.OrthographicCamera(${left}, ${right}, ${top}, ${bottom}, ${near}, ${far});`);
      }
      lines.push(`  camera${i}.position.set(${cam.transform.position.join(',')});`);
      lines.push(`  scene.add(camera${i});`);
      lines.push(`  activeCamera = camera${i};`);
    });
  }

  // Lights
  if (scene.lights) {
    scene.lights.forEach((l, i) => {
      const varName = `light${i}`;
      switch(l.type) {
        case 'ambient':
          lines.push(`  const ${varName} = new THREE.AmbientLight(0xffffff, ${l.intensity});`);
          break;
        case 'directional':
          lines.push(`  const ${varName} = new THREE.DirectionalLight(0xffffff, ${l.intensity});`);
          lines.push(`  ${varName}.position.set(${l.transform.position.join(',')});`);
          break;
        case 'point':
          lines.push(`  const ${varName} = new THREE.PointLight(0xffffff, ${l.intensity}, ${l.distance||0});`);
          lines.push(`  ${varName}.position.set(${l.transform.position.join(',')});`);
          break;
        case 'spot':
          lines.push(`  const ${varName} = new THREE.SpotLight(0xffffff, ${l.intensity});`);
          lines.push(`  ${varName}.position.set(${l.transform.position.join(',')});`);
          break;
      }
      lines.push(`  scene.add(${varName});`);
    });
  }

  // Materials (full PBR)
  if (scene.materials) {
    scene.materials.forEach((mat, i) => {
      const params = [];
      if (mat.color) params.push(`color: 0x${mat.color.toString(16)}`);
      if (mat.emissive) params.push(`emissive: 0x${mat.emissive.toString(16)}`);
      if (mat.roughness !== undefined) params.push(`roughness: ${mat.roughness}`);
      if (mat.metalness !== undefined) params.push(`metalness: ${mat.metalness}`);
      // texture maps
      [['map', 'mapTextureIndex'], ['normalMap', 'normalTextureIndex'], ['emissiveMap', 'emissiveTextureIndex'], ['aoMap', 'aoTextureIndex'], ['roughnessMap', 'roughnessTextureIndex'], ['metalnessMap', 'metalnessTextureIndex'], ['displacementMap', 'displacementTextureIndex']]
        .forEach(([p, idxKey]) => {
          if (mat[idxKey] != null) params.push(`${p}: new THREE.TextureLoader().load('${scene.textures[mat[idxKey]].filename}')`);
        });
      lines.push(`  const mat${i} = new THREE.MeshStandardMaterial({ ${params.join(', ')} });`);
    });
  }

  // Meshes & Geometries
  if (scene.nodes) {
    scene.nodes.forEach((node, i) => {
      if (node.type === 'mesh' && node.geometry) {
        const geom = node.geometry;
        const gVar = `geo${i}`;
        // primitives
        switch(geom.type) {
          case 'box': {
            const { width, height, depth } = geom.parameters;
            lines.push(`  const ${gVar} = new THREE.BoxGeometry(${width}, ${height}, ${depth});`);
            break;
          }
          case 'sphere': {
            const { radius, widthSegments, heightSegments } = geom.parameters;
            lines.push(`  const ${gVar} = new THREE.SphereGeometry(${radius}, ${widthSegments}, ${heightSegments});`);
            break;
          }
          case 'cylinder': {
            const { radiusTop, radiusBottom, height, radialSegments } = geom.parameters;
            lines.push(`  const ${gVar} = new THREE.CylinderGeometry(${radiusTop}, ${radiusBottom}, ${height}, ${radialSegments});`);
            break;
          }
          case 'cone': {
            const { radius, height, radialSegments } = geom.parameters;
            lines.push(`  const ${gVar} = new THREE.ConeGeometry(${radius}, ${height}, ${radialSegments});`);
            break;
          }
          case 'torus': {
            const { radius, tube, radialSegments, tubularSegments } = geom.parameters;
            lines.push(`  const ${gVar} = new THREE.TorusGeometry(${radius}, ${tube}, ${radialSegments}, ${tubularSegments});`);
            break;
          }
          case 'plane': {
            const { width, height, widthSegments, heightSegments } = geom.parameters;
            lines.push(`  const ${gVar} = new THREE.PlaneGeometry(${width}, ${height}, ${widthSegments}, ${heightSegments});`);
            break;
          }
          default: {
            // buffer geometry fallback
            lines.push(`  const ${gVar} = new THREE.BufferGeometry();`);
            Object.entries(geom.attributes).forEach(([attr, obj]) => {
              // determine itemSize if provided or infer
              const arr = obj.array || obj;
              const itemSize = obj.itemSize || (arr.length / (geom.vertexCount || (arr.length / 3)));
              lines.push(`  ${gVar}.setAttribute('${attr}', new THREE.BufferAttribute(new Float32Array([${arr.join(',')}]), ${itemSize}));`);
            });
            break;
          }
        }
        const matVar = node.materialIndex != null ? `mat${node.materialIndex}` : 'undefined';
        const mVar = `mesh${i}`;
        lines.push(`  const ${mVar} = new THREE.Mesh(${gVar}, ${matVar});`);
        lines.push(`  ${mVar}.position.set(${node.transform.position.join(',')});`);
        lines.push(`  ${mVar}.rotation.set(${node.transform.rotation.join(',')});`);
        lines.push(`  ${mVar}.scale.set(${node.transform.scale.join(',')});`);
        lines.push(`  scene.add(${mVar});`);
      }
    });
  }

  // Animations
  if (scene.animations) {
    lines.push(`  const clock = new THREE.Clock();`);
    scene.animations.forEach((anim, ai) => {
      lines.push(`  const mixer${ai} = new THREE.AnimationMixer(scene);`);
      anim.clips.forEach((clip, ci) => {
        const varClip = `clip${ai}_${ci}`;
        lines.push(`  const ${varClip} = THREE.AnimationClip.parse(${JSON.stringify(clip)});`);
        lines.push(`  const action${ai}_${ci} = mixer${ai}.clipAction(${varClip});`);
        lines.push(`  action${ai}_${ci}.play();`);
      });
      lines.push(`  mixers.push(mixer${ai});`);
    });
  }

  // Renderer & loop
  lines.push("  const renderer = new THREE.WebGLRenderer({ antialias: true });");
  lines.push("  renderer.setSize(container.clientWidth, container.clientHeight);");
  lines.push("  container.appendChild(renderer.domElement);");
  lines.push("  function animate() {");
  lines.push("    requestAnimationFrame(animate);");
  lines.push("    const delta = clock.getDelta();");
  lines.push("    mixers.forEach(m => m.update(delta));");
  lines.push("    renderer.render(scene, activeCamera);");
  lines.push("  }");
  lines.push("  animate();");
  lines.push("  return { scene, renderer, mixers, activeCamera };" );
  lines.push("}");

  fs.writeFileSync(path.join(outDir, 'scene.js'), lines.join("\n"));
  console.log('Conversion complete. See output/ folder.');
}

// CLI
const args = process.argv.slice(2);
if (!args[0]) {
  console.error('Usage: node convert.js <scene.splinecode>');
  process.exit(1);
}
convert(args[0]).catch(console.error);
