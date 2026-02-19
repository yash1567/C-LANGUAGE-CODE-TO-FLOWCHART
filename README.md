# C-LANGUAGE-CODE-TO-FLOWCHART
This project is a lightweight, web-based tool designed to bridge the gap between low-level C programming and algorithmic logic visualization. By automating the conversion of C code into clean, professional diagrams, it serves as an essential utility for students and educators to verify program flow instantly.

C to Flowchart Generator
A modern web application that transforms C source code into visual flowcharts instantly. This tool helps developers and students visualize complex logic, loops, and conditional statements without manual drawing.

🚀 Features
Automatic Code Parsing: Converts standard C syntax into a structured flowchart representation.

Smart Logic Detection: Recognizes if-else blocks, while loops, for loops, and return statements.

Dual Rendering Engine:

Online Mode: Uses Mermaid.js for high-quality, professional diagrams.

Offline Mode: Includes a custom internal SVG renderer as a fallback when internet access is unavailable.

Built-in Examples: Load pre-defined code for Armstrong Numbers, Multiplication Tables, or Number Comparisons to see the generator in action.

Export Functionality: Easily export your generated flowchart as a PNG image for use in documentation.

🛠️ Tech Stack
Structure: HTML5

Styling: CSS3 using Flexbox and Grid layouts for a responsive workspace

Logic: Vanilla JavaScript (ES6+) for tokenization and parsing

Diagramming: Mermaid.js

📂 File Structure
index.html: The main interface featuring a split-pane editor and preview window.

script.js: Contains the tokenizer, the Mermaid syntax generator, and the fallback SVG renderer.

style.css: Provides the professional "Inter" font-based UI and dark/light surface aesthetics.
