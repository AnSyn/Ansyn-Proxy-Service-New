const config = require('./config.json');
const proxy = require('./proxy.js');
proxy.listen(config.port, () => console.info(`proxy-service listening on port: ${config.port}`));
