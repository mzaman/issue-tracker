const Router = require('koa-router');
const fs = require('fs');
const path = require('path');
const { apiPrefix = '/api' } = require('../../config');

const router = new Router();
const versionsPath = path.resolve(__dirname);

// Discover all version folders (e.g., v1, v2)
const versions = fs.readdirSync(versionsPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .sort(); // Ensures latest version is last alphabetically (v1 < v2 < v3, etc.)

if (versions.length === 0) {
    throw new Error('No version directories found in routes.');
}

const latestVersion = versions[versions.length - 1];

// Helper to mount router at both clean and trailing-slash path
const mountRouterAt = (basePath, versionRouter) => {
    const cleanedPath = basePath.replace(/\/{2,}/g, '/').replace(/\/$/, '');
    router.use(cleanedPath, versionRouter.routes(), versionRouter.allowedMethods());
    router.use(`${cleanedPath}/`, versionRouter.routes(), versionRouter.allowedMethods());
};

// Load all version routers
const versionRouters = {};

versions.forEach(version => {
    try {
        const versionRouter = require(path.join(versionsPath, version, 'index.js'));
        versionRouters[version] = versionRouter;

        const mountPoints = [
            `/${version}`,               // /v1
            `${apiPrefix}/${version}`,  // /api/v1
        ];

        mountPoints.forEach(mountPath => mountRouterAt(mountPath, versionRouter));

        console.log(`Mounted ${version} at: ${mountPoints.join(', ')}`);
    } catch (err) {
        console.error(`Failed to load router for ${version}:`, err.message);
    }
});

// Fallback to latest version under `/` and `/api`
const latestRouter = versionRouters[latestVersion];
if (latestRouter) {
    console.log(`Fallback mounted to latest version (${latestVersion}) at '/' and '${apiPrefix}'`);
    mountRouterAt('/', latestRouter);            // e.g., /auth/login
    mountRouterAt(apiPrefix, latestRouter);      // e.g., /api/auth/login
}

module.exports = router;