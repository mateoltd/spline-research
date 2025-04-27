# Intercepting Spline Data using Burp Suite

## Introduction
This document explains how we captured and extracted `.splinecode` data directly from Spline's network traffic using **Burp Suite**. This method allows developers and researchers to obtain raw Spline project data for reverse engineering and offline use.

## Step 1: Setting Up Burp Suite
1. Launch **Burp Suite** and configure your browser to route traffic through Burp's proxy.
2. Ensure HTTPS traffic is properly intercepted by installing Burp's SSL certificate in your browser.
3. Open the Spline web app and load your project.

## Step 2: Monitoring Network Traffic
1. In Burp Suite, navigate to the **Proxy > HTTP history** tab.
2. Interact with the Spline editor—modifying the scene triggers network requests.
3. Look for **PUT** requests targeting endpoints like:
   ```
   https://api.spline.design/projects/{project-id}/bundles
   ```
4. These PUT requests contain the updated project data.

## Step 3: Intercepting the Bundle
1. Click on the relevant PUT request.
2. In the **Request** tab, locate the raw payload—this is typically the `.splinecode` bundle.
3. Right-click and select **"Save body"** or copy the payload to a file.
4. Save it as `scene.splinecode` for further analysis.

## Step 4: Validating the Capture
- Open the saved file in a hex editor or text editor.
- Confirm that it starts with binary data consistent with MessagePack streams.
- This file can now be used as input for reverse engineering tools.

## What Spline Does Internally
Spline operates as a cloud-based 3D design platform where most of the project data is managed server-side. Here’s a breakdown of its internal workflow:

1. **Real-Time Scene Serialization**
   - As users interact with the editor, Spline continuously serializes the scene into a compact binary format (`.splinecode`).
   - This format leverages **MessagePack streams** for efficient data transmission and storage.

2. **PUT Requests for State Syncing**
   - Every significant change (e.g., moving an object, updating materials) triggers a **PUT** request to Spline’s backend API.
   - The payload contains the entire project state, ensuring the server always holds the latest version.

3. **Bundle Structure**
   - The bundle includes:
     - Scene graph definitions (nodes, materials, cameras, lights).
     - Compressed geometry data.
     - Embedded textures or references to CDN-hosted assets.
     - Animation states and behaviors.

4. **CDN Dependency**
   - When exporting for web use, Spline-hosted projects rely on their **CDN** to fetch geometry, textures, and behaviors dynamically.
   - This limits offline usage and customization, which is why intercepting the raw `.splinecode` is crucial for self-hosting.

5. **Proprietary Compression & Encoding**
   - Geometry and other heavy assets are stored using proprietary binary formats within `ExtType` blocks.
   - References across the scene are handled via UUIDs and schema-driven definitions to reduce payload size.

By understanding this internal mechanism, developers can better approach reverse engineering efforts and build tools that bypass CDN reliance, offering full control over their 3D assets.

## Conclusion
Using Burp Suite to intercept Spline's PUT requests provides a reliable method to capture raw `.splinecode` data. This technique is essential for developers aiming to understand Spline's internal formats, build converters, or self-host their 3D scenes without relying on Spline's CDN.

---
