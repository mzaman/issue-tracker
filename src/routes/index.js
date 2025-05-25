// src/routes/index.js

const Router = require('koa-router');
const fs = require('fs');
const path = require('path');
const { apiPrefix } = require('../../config');
const discoveryRoutes = require('./v1/discovery');
const healthRoutes = require('./v1/health');

const router = new Router();

const versionsPath = path.resolve(__dirname);
const versions = fs.readdirSync(versionsPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

router.use('/', discoveryRoutes.routes(), discoveryRoutes.allowedMethods());
router.use('/health', healthRoutes.routes(), healthRoutes.allowedMethods());

versions.forEach(version => {
    try {
        // Dynamically require the version route index file
        const versionRouter = require(path.join(versionsPath, version, 'index.js'));
        // Mount with prefix /api/v1 or /api/v2 etc.
        router.use(`${apiPrefix}/${version}`, versionRouter.routes(), versionRouter.allowedMethods());

        console.log(`Mounted routes for ${version} at ${apiPrefix}/${version}`);

    } catch (err) {
        console.error(`Failed to load routes for version ${version}:`, err);
    }
});

// Function to list all routes
// function listRoutes(router) {
//     const routes = [];
//     router.stack.forEach(layer => {
//         if (layer.path) {
//             routes.push({
//                 path: layer.path,
//                 methods: layer.methods.filter(m => m !== 'HEAD')
//             });
//         }
//     });
//     return routes;
// }

// Log all routes
// const allRoutes = listRoutes(router);
// console.log('Registered Routes:');
// allRoutes.forEach(r => console.log(`${r.methods.join(', ')}\t${r.path}`));

module.exports = router;