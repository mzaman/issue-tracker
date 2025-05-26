const express = require('express');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const swaggerUi = require('swagger-ui-express');

const app = express();

// Load swagger YAML
const swaggerDocument = yaml.load(
    fs.readFileSync(path.resolve(__dirname, './swagger.yaml'), 'utf8')
);

app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Listen on different port
const PORT = process.env.SWAGGER_LOCAL_PORT || 5555;
app.listen(PORT, () => {
    console.log(`Swagger UI available at http://localhost:${PORT}`);
});