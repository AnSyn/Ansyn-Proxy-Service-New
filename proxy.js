{
    const express = require('express');
    const app = express();
    const https = require('https');
    const fs = require('fs');
    const proxyMiddleware = require('http-proxy-middleware');
    const logger = require('./logger/logger.js');
    const proxyOptions = require('./proxy-options.js');
    const config = require('./config.json');
    const auth = require('./auth-service-middleware');

    const httpProxy = proxyMiddleware(proxyOptions);
    app.use(auth);
    app.use(httpProxy);
    app.use(function (err, req, res, next) {
        logger.error(`[proxy-service] ${req.method} ${req.url} [requested by: ${req.ip}] caused an error. could not proxy the request.`);
        res.status(500).send();
        res.writeHead(500, {
            'Content-Type': 'text/plain'
        });
        res.end('Something went wrong. Could not proxy the request.');
        next(err);
    });

    if (config.ssl !== undefined) {
        try {
            const privateKey = fs.readFileSync(config.ssl.key, 'utf8');
            const certificate = fs.readFileSync(config.ssl.certificate, 'utf8');
            const credentials = { key: privateKey, cert: certificate };
            const httpsServer = https.createServer(credentials, app);
            module.exports = httpsServer;
        }
        catch (err) {
            logger.error(`Could not initialize HTTPS server.\r\nerror: ${err}`);
            module.exports = null;
        }
    } else {
        module.exports = app;
    }
}