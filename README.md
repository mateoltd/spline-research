# Spline Open Analysis

A community-driven repository of independent research and analysis on the internals of the Spline platform. This project contains observations, notes, diagrams, tools, and re-implementations made from scratch—**no proprietary Spline code or assets** are included.

---

## Table of Contents

1. [Disclaimer & Legal](#disclaimer--legal)  
2. [Project Overview](#project-overview)  
3. [Scope & Limitations](#scope--limitations)  
4. [Features](#features)  
5. [Getting Started](#getting-started)  
   - [Requirements](#requirements)  
   - [Installation](#installation)  
6. [Usage](#usage)  
7. [Contributing](#contributing)  
8. [Code of Conduct](#code-of-conduct)  
9. [License](#license)  
10. [Acknowledgements](#acknowledgements)  

---

## Disclaimer & Legal

-  **Independent Research**  
   This work is an independent, academic-style investigation. It is not sponsored by, endorsed by or affiliated with Spline, Inc.

-  **No Proprietary Code**  
   All content, diagrams, and re-implementations are built from public observations and experiments. No binaries, source code or assets from Spline have been copied or redistributed.

-  **Respect Spline’s TOS**  
   We believe our reverse-engineering falls under fair-use and interoperability exceptions, but users must confirm compliance with local laws and Spline’s Terms of Service before using or redistributing any material.

-  **No Warranty**  
   This project is provided “as is”, with no guarantees of fitness, accuracy or non-infringement. Use at your own risk.

---

## Project Overview

This repo collects:
-  Protocol and file-format outlines for Spline scenes  
-  Static analyses of WebGL shaders and asset pipelines  
-  Re-implementations of key data-structures and utilities in JavaScript  
-  Visualization sketches, sequence diagrams, and tooling  
-  A working converter from `.splinecode` files to Three.js scenes

---

## Scope & Limitations

-  We do **not** distribute `.wasm`, `.dll` or any Spline binaries.  
-  We do **not** include or reference Spline’s private API keys, user data or internal secrets.  
-  All reverse-engineered code is written from zero, based on network captures, instrumentation, and public behaviour.

---

## Features

- 🔍 **.splinecode Parser** — Decode and extract data from Spline project files  
- 🎨 **Texture Extractor** — Save embedded textures as standard image files  
- 🏗️ **Three.js Scene Generator** — Convert Spline scenes into self-hosted, editable Three.js projects  
- 📊 **File Format Documentation** — Community-maintained specs of Spline's internal formats  
- 🚀 **Extensible Tools** — Build your own workflows on top of our open parsers
- 🛡️ **Network Interception Techniques** — Guides and tools for capturing Spline data using Burp Suite

---

## Getting Started

### Requirements

- Node.js >= 16.x  
- npm or yarn  
- (Optional) Three.js for rendering converted scenes

### Installation

```bash
git clone https://github.com/your-repo/spline-open-analysis.git
cd spline-open-analysis
npm install
```

---

## Usage

### 1. Build the TypeScript project

```bash
npm run build
```

### 2. Convert a `.splinecode` file to a Three.js scene

```bash
npm run cli:convert -- path/to/scene.splinecode
```
- The output will be generated as `src/generated/generatedScene.js`.
- You can import this file in your Three.js project or further process it as needed.

### 3. Inspect a `.splinecode` file for analysis

```bash
npm run cli:inspect -- path/to/scene.splinecode
```
- The output report will be generated as `src/generated/spline_insight_report.json`.
- This JSON contains detailed statistics and insights about the file's structure and contents.

#### Development (run directly with ts-node)

You can also run the tools without building:

```bash
npm run start:convert -- path/to/scene.splinecode
npm run start:inspect -- path/to/scene.splinecode
```

---

## Contributing

We welcome improvements, corrections, and deep dives!

1. Fork the repo and create a branch:  
   ```bash
   git checkout -b feat/your-feature
   ```
2. Ensure linting and tests pass:  
   ```bash
   npm test
   ```
3. Submit a Pull Request describing your changes in detail.

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for our full guidelines.

---

## Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to respect all contributors and maintain a welcoming environment.

---

## License

Distributed under the MIT License.  
See [LICENSE](LICENSE) for more information.

---

## Acknowledgements

-  Tools and libraries used:  
   - [three.js](https://threejs.org/) — Rendering engine for 3D scenes  
   - [msgpack-lite](https://github.com/kawanet/msgpack-lite) — Parsing MessagePack streams from `.splinecode` files  
   - [Burp Suite](https://portswigger.net/burp) — Intercepting and analyzing network traffic to understand Spline's data exchange  
   - [Node.js](https://nodejs.org/) — Runtime for building our parsers and converters  

---

For detailed technical analysis, visit the `/docs` folder or join the discussion on [GitHub Issues](https://github.com/your-repo/spline-open-analysis/issues).
