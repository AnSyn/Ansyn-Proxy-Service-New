const config = require('./config.json');
const proxy = require('./proxy.ts');
proxy.listen(config.port, () => console.info(`web proxy server listening on port: ${config.port}`));