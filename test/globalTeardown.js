const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

module.exports = async () => {
    try {
        // Example: Stop a test container (adjust the container name)
        // await execAsync('docker stop my_test_container && docker rm my_test_container');
        console.log('🛑 Docker container stopped and removed');
    } catch (error) {
        console.warn('⚠️ Docker teardown failed:', error.message);
    }

    console.log('🧹 Global teardown completed');
};