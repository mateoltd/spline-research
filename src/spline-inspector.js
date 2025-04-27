#!/usr/bin/env node
// spline-inspector.js
// -------------------
// A comprehensive Node.js CLI tool to auto-dig into `.splinecode` files,
// unpack all MessagePack items, and run a battery of tests for better insights.

const fs = require('fs');
const path = require('path');
const msgpack = require('msgpack-lite');

// Utility: check if value is ExtType 116 blob
function isGeometryBlob(item) {
  return item instanceof msgpack.ExtBuffer && item.type === 116;
}
// Utility: check if array is transform-like (3 floats/ints)
function isTransform(item) {
  return Array.isArray(item) && item.length === 3 && item.every(n => typeof n === 'number');
}
// Utility: check if string is UUID
function isUUID(str) {
  return typeof str === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(str);
}

// Load and unpack .splinecode
const filePath = process.argv[2] || 'scene.splinecode';
if (!fs.existsSync(filePath)) {
  console.error(`Usage: node spline-inspector.js <.splinecode file>`);
  process.exit(1);
}
const buffer = fs.readFileSync(filePath);
const unpacker = new msgpack.DecodeBuffer(buffer);
const items = [];
while (unpacker.offset < buffer.length) {
  try {
    items.push(msgpack.decode(unpacker));
  } catch (e) {
    console.error('Decode error at offset', unpacker.offset, e.message);
    break;
  }
}
console.log(`Unpacked ${items.length} MessagePack items.`);

// Analysis 1: Type counts
const typeCounts = items.reduce((acc, item) => {
  const t = item === null ? 'null'
          : Array.isArray(item) ? 'array'
          : item instanceof msgpack.ExtBuffer ? `ext${item.type}`
          : typeof item;
  acc[t] = (acc[t] || 0) + 1;
  return acc;
}, {});

// Analysis 2: extType frequencies
const extFreq = items.reduce((acc, item) => {
  if (item instanceof msgpack.ExtBuffer) {
    acc[item.type] = (acc[item.type] || 0) + 1;
  }
  return acc;
}, {});

// Analysis 3: UUIDs, transforms, geometry blobs, schemas, numeric patterns
const uuids = items.filter(isUUID);
const transforms = items.filter(isTransform);
const geometryBlobs = items.filter(isGeometryBlob);
const schemas = items.filter(i => Array.isArray(i) && i.length > 3 && i.every(x => typeof x === 'string'));
const numericLists = items.filter(i => Array.isArray(i) && i.length > 5 && i.every(x => typeof x === 'number'));

// Analysis 4: Scan for repeated patterns in numeric lists
const repeatedLists = numericLists.filter(arr => {
  const uniq = new Set(arr).size;
  return uniq / arr.length < 0.8;
});

// Analysis 5: Attempt decompress extType items with raw inflate/gunzip
const zlib = require('zlib');
let zlibResults = [];
items.forEach((item, idx) => {
  if (item instanceof msgpack.ExtBuffer) {
    const data = item.data;
    try {
      zlib.inflate(data, () => {});
      zlibResults.push({ idx, type: item.type, method: 'inflate' });
    } catch {};
    try {
      zlib.inflateRaw(data, () => {});
      zlibResults.push({ idx, type: item.type, method: 'inflateRaw' });
    } catch {};
    try {
      zlib.gunzip(data, () => {});
      zlibResults.push({ idx, type: item.type, method: 'gunzip' });
    } catch {};
  }
});

// Analysis 6: String length distribution
const stringLengths = items.filter(i => typeof i === 'string').map(s => s.length);

// Consolidate report\ 
const report = {
  totalItems: items.length,
  typeCounts,
  extFreq,
  uuids: { count: uuids.length, sample: uuids.slice(0,10) },
  transforms: { count: transforms.length, sample: transforms.slice(0,5) },
  geometryBlobs: geometryBlobs.length,
  schemas: schemas.length,
  repeatedLists: repeatedLists.length,
  zlibAttempts: zlibResults,
  stringLengthStats: {
    min: Math.min(...stringLengths),
    max: Math.max(...stringLengths),
    avg: stringLengths.reduce((a,b) => a+b,0)/stringLengths.length,
  }
};

// Output JSON report
fs.writeFileSync('spline_insight_report.json', JSON.stringify(report, null, 2));
console.log('Insight report written to spline_insight_report.json');

// TODO: Expand with visualizations, histogram generation, deep correlation tests
