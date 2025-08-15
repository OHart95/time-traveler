// Import the Express web framework
import express from "express";

// Node’s built-in "path" module helps us work with file and directory paths
import path from "path";

// "fileURLToPath" converts the special "import.meta.url" (used in ES modules)
// into a normal file path string we can work with.
import { fileURLToPath } from "url";

// Get the current file’s absolute path (e.g., /Users/you/project/server.js)
const __filename = fileURLToPath(import.meta.url);

// Get the directory that this file lives in (e.g., /Users/you/project)
const __dirname = path.dirname(__filename);

// Create an Express application
const app = express();

// Choose which port to run the server on:
// - Use the one provided by the hosting environment (process.env.PORT)
// - Or fall back to 3000 when running locally
const PORT = process.env.PORT || 3000;

// Serve static files (CSS, JS, images, etc.) from the "assets" folder
// Example: /assets/rocket.png can be requested directly in the browser
app.use(express.static(path.join(__dirname, "assets")));

// Catch-all route: if no other route matches, send back index.html
// This is typical for single-page apps where the frontend handles routing
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start the server and begin listening on the chosen port
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    console.log("Press Ctrl+C to stop the server.");
});
