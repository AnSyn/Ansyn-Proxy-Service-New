{
    const swaggerUi = require('swagger-ui-express');
    const swaggerDocument = require('./swagger.json');
    const express = require('express');
    const app = express();
    const https = require('https');
    const fs = require('fs');
    const proxyMiddleware = require('http-proxy-middleware');
    const logger = require('./logger/logger-config.ts');
    const logStorageTransport = require('./logger/log-storage-transport.ts')
    const config = require('./config.json');

    function normalizeUrl(url, protocol) {
        if (url.startsWith("/")) {
            url = url.slice(1, url.length);
        }
        if (url.toLowerCase().startsWith("www")) {
            url = `${protocol}://${url}`;
        }
        return url;
    };

    const proxyOptions = {
        target: config.defaultRoute,
        router: function (req) {
            return normalizeUrl(req.url, req.protocol);
        },
        ws: true,
        ignorePath: true,
        changeOrigin: true,
        logLevel: config.logLevel,
        logProvider: function (provider) {
            return logger;
        },
        onProxyReq: function (proxyReq, req, res, options) {
            const url = normalizeUrl(req.url, req.protocol);
            logger.debug(`[HPM] ${req.method} ${url} [requested by: ${req.ip}]`);
            if (url === config.authService) {
                logger.info(`[HPM] ${req.method} ${req.url} detected as an authentication request.`);
                const authToken = req.headers[config.authTokenHeader];
                proxyReq.path += `?${config.authTokenHeader}=${authToken}`;
            }
        },
        onError: function onError(err, req, res) {
            logger.error(`[HPM] ${req.method} ${req.url} [requested by: ${req.ip}] caused an error. could not proxy the request.`);
            res.writeHead(500, {
                'Content-Type': 'text/plain'
            });
            res.end('Something went wrong. Could not proxy the request.');
        }
    }

    const httpProxy = proxyMiddleware(proxyOptions);
    app.get('/logs', (req, res) => {
        const transports = logger.transports;
        const logStorage = transports.find((item) => { return (item instanceof logStorageTransport) })
        res.send(logStorage.get());
    });

    const swaggerHost = { host: `localhost:${config.port}` };
    const swaggerDocumentWithActualHost = { ...swaggerDocument, ...swaggerHost };
    app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocumentWithActualHost));
    app.use(/\/((?!logs|swagger).)*/, httpProxy);
    app.use(function (err, req, res, next) {
        logger.error(`[HPM] ${req.method} ${req.url} [requested by: ${req.ip}] caused an error. could not proxy the request.`);
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