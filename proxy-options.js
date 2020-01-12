{
    const logger = require('./logger/logger.js');
    const logFormat = require('./logger/log-formatter.js')
    const requestLog = require('./log-request.js')
    const config = require('./config.json');

    const proxyOptions = {
            target: config.defaultRoute,
            router: function (req) {
                let url = req.url;
                if (url.startsWith("/")) {
                    url = url.slice(1, url.length);
                }
                return url;
        },
            ws: true,
            ignorePath: true,
            changeOrigin: true,
            logLevel: config.logLevel,
            logProvider: function (provider) {
                return logger;
            },
            onError: function onError(err, req, res) {
                const url = req.originalUrl;
                let log = new requestLog(req.method, url, req.ip, `could not proxy the request. error: ${err}`);        
                logger.error(logFormat(log));
                res.writeHead(500, {
                    'Content-Type': 'text/plain'
                });
                res.end('something went wrong. could not proxy the request.');
            }
        }
    module.exports = proxyOptions;
}
