{
    const express = require('express');
    const app = express();
    const https = require('https');
    const fs = require('fs');
    const proxyMiddleware = require('http-proxy-middleware');
    const logger = require('./logger/logger.js');
    const proxyOptions = require('./proxy-options.js');
    const config = require('./config.json');
    const urlNormailize = require('./url-normalize-middleware');
    const auth = require('./auth-service-middleware');

    const httpProxy = proxyMiddleware(proxyOptions);
    app.use(urlNormailize); 
    app.use(auth);
    app.use(httpProxy);

    if (config.ssl !== undefined) {
        try {
            const privateKey = fs.readFileSync(config.ssl.key, 'utf8');
            const certificate = fs.readFileSync(config.ssl.certificate, 'utf8');
            const credentials = { key: privateKey, cert: certificate };
            const httpsServer = https.createServer(credentials, app);
            module.exports = httpsServer;
        }
        catch (err) {
            logger.error(`could not initialize HTTPS server.\r\nerror: ${err}`);
            module.exports = null;
        }
    } else {
        module.exports = app;
    }
}
