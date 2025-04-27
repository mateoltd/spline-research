# Reverse Engineering Spline `.splinecode` Files

## Introduction
This document outlines the findings from reverse engineering Spline's `.splinecode` file format. The goal is to enable the open-source community to understand, parse, and convert `.splinecode` files into usable formats such as Three.js scenes.

## File Structure Analysis

### 1. Encoding Format
- The `.splinecode` file is **not compressed** using standard methods like zlib or gzip.
- It is a **stream of MessagePack-encoded objects**.
- The stream contains **831 MessagePack items** in the analyzed sample.

### 2. Data Types Observed
- **MessagePack Extension Types**: 128 entries, used for custom Spline-specific metadata and data blobs.
- **Arrays of Strings**: 162 lists, some acting as section identifiers such as `['schema', 'scene', 'frames', 'shared', 'version']`.
- **Primitive Types**: 362 integers, 97 strings, 70 floats, and 10 null values.
- **Bytes**: 2 entries, no large binary blobs detected.

### 3. Extension Types Details
- Common `ExtType` codes observed: `114`, `2`, `6`, `1`, `3`, `116`.

- **ExtType Code 116**: Two large entries (indices 637 and 638) confirmed to represent **proprietary compressed geometry buffers**.
  - Analysis shows these blobs are **not Draco**, **not raw Float32 arrays**, and **not textures**.
  - Hex inspection reveals a likely **chunked binary format**, unique to Spline, possibly interleaving vertex data, normals, UVs, and indices.
  - Further reverse engineering is required to decode this format, potentially by comparing multiple `.splinecode` files to identify structural patterns.

- **ExtType Code 114**: 85 entries identified, likely serving as **scene metadata markers or lightweight descriptors**.
  - Initial decoding reveals many entries are **single-character strings** (e.g., `@`, `A`, `C`), suggesting usage as type identifiers, flags, or placeholders.
  - Larger `ExtType 114` entries may contain structured metadata, requiring further analysis to decode scene-related information such as node definitions, transformations, or material links.

### 4. Scene Graph Observation
- No single dictionary object containing the full scene graph (`nodes`, `materials`, `cameras`, etc.) was detected.
- The scene data appears to be **fragmented across multiple items**, potentially using references, positional conventions, or implicit ordering to link data.
- No lists containing `ExtType` entries were found, ruling out simple resource pool structures.
- Positional analysis around geometry blobs suggests possible implicit linking but remains inconclusive.
- Broad scans for materials, lights, cameras, and animations returned no standard key identifiers, indicating that Spline likely uses non-descriptive keys, positional data, or binary encoding for scene components.
- Attempts to correlate schema lists with adjacent value arrays were unsuccessful, suggesting a more complex or indirect mapping system.
- Several lists containing boolean triplets and numeric triplets were identified, likely representing flags (e.g., visibility) or transform vectors (position, rotation, scale).
- **Repeated numeric patterns** were found, suggesting usage for bit flags or compressed data structures.
- **UUID-like strings** were detected, indicating that Spline uses a **UUID-based referencing system** to link nodes, materials, geometries, and animations.

## Reverse Engineering Findings
- The `.splinecode` format uses a custom serialization strategy combining:
  - MessagePack streams with multiple concatenated objects
  - Extension types for metadata and binary data
  - Fragmented scene graph data linked through references or positional patterns
  - Proprietary compressed geometry within large `ExtType` 116 blobs
  - Metadata markers and descriptors within `ExtType` 114 entries
  - Non-standard encoding for scene components like materials, lights, and cameras
  - Schema-driven definitions with potential indirect key-value mappings
  - UUID-based references for object linking

- No encryption or obfuscation detected, making it feasible for open-source tools to parse with continued effort.

## Next Steps for Open Source Tools

### Modifications Needed for the Converter Script
1. **Replace zlib Decompression**
   - Remove zlib-based logic.
   - Implement a **MessagePack streaming parser** to read multiple objects.

2. **Identify Core Scene Data**
   - Trace UUID references or positional patterns across unpacked items to reconstruct the scene graph.
   - Investigate schema lists and how they map to value structures.

3. **Texture and Geometry Extraction**
   - Decode large `ExtType` blobs:
     - Investigate and document Spline's proprietary geometry format.

4. **Rebuild Scene Logic**
   - Map nodes, materials, geometries, lights, cameras, and animations from fragmented data.
   - Adapt existing Three.js generation logic to use this parsed structure.

5. **Handle MessagePack Extension Types**
   - Document and decode custom ExtTypes used by Spline, especially codes `114` and `116`.
   - Analyze larger `ExtType 114` entries for potential scene metadata and descriptors.

## Conclusion
This reverse engineering effort has demystified much of the `.splinecode` format, revealing it as a structured MessagePack stream with fragmented data linking, metadata markers, schema-driven definitions, UUID-based referencing, proprietary compressed geometry, and non-standard encoding for scene components. With these insights, we can develop open-source tools to convert Spline projects into fully self-hosted Three.js scenes, empowering developers with greater control over their 3D assets.

---
