const yaml = require('yamljs');
const path = require('path');

const yamlPath = path.join(__dirname, 'swagger.yaml');
const specs = yaml.load(yamlPath);

module.exports = specs;