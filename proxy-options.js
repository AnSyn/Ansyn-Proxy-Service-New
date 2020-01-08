{
    const logger = require('./logger/logger.js');
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
            onError: function onError(err, req, res) {
                logger.error(`[proxy-service] ${req.method} ${req.url} [requested by: ${req.ip}] caused an error. could not proxy the request.`);
                res.writeHead(500, {
                    'Content-Type': 'text/plain'
                });
                res.end('Something went wrong. Could not proxy the request.');
            }
        }
    module.exports = proxyOptions;
}