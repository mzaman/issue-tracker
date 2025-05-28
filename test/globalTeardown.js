const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

module.exports = async () => {
    try {
        // TODO: Stop a test container (adjust the container name)
        // await execAsync('docker stop my_test_container && docker rm my_test_container'); TODO: Fix test service first
        // await execAsync(' docker stop dev-trial-day-app && docker up -d && docker-compose exec app bash');

        console.log('🛑 Docker container stopped and removed');
    } catch (error) {
        console.warn('⚠️ Docker teardown failed:', error.message);
    }

    console.log('🧹 Global teardown completed');
};