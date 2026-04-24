// PLESK Startup file for Production
// This file acts as a CJS wrapper for the ES Module server.js
// iisnode will 'require' this file.

(async () => {
    try {
        await import('./server.js');
    } catch (err) {
        console.error('Failed to start server via ESM import:', err);
        process.exit(1);
    }
})();
