{
    const logger = require('./logger/logger.js');
    const logFormat = require('./logger/log-formatter.js')
    const requestLog = require('./log-request.js')

    module.exports = (req, res, next) =>
    { 
        req = handleRequestReferer(req);
        let url = req.originalUrl;
        let log = new requestLog(req.method, url, req.ip, "new request.");        
        logger.info(logFormat(log));

        if (url.startsWith("/")) {
            url = url.slice(1, url.length);
        }
        if (url.toLowerCase().startsWith("www")) {
            url = `${protocol}://${url}`;
        } else if (false === url.toLowerCase()
                                .startsWith(req.protocol)) {            
            log = new requestLog(req.method, url, req.ip, "request missing original host. unable to process.");        
            logger.error(logFormat(log));
            const errMsg = `request missing original host. unable to process url: '${url}.`;
            res.status(500).send({ error: errMsg});
            return;
        }

        req.originalUrl = url;
        next();
    }

    function handleRequestReferer(req) {
        let referer = req.headers.referer;
        if (referer === undefined) {
            return req;
        }

        const url = req.originalUrl;
        let log = new requestLog(req.method, url, req.ip, `contains the 'referer' header: '${referer}'.`);        
        logger.debug(logFormat(log));

        const protocol = req.protocol;
        const host = req.headers["host"];
        referer = referer.slice(protocol.length + "://".length + host.length + 1);
        req.originalUrl = referer + req.originalUrl;
        log = new requestLog(req.method, url, req.ip, `updated request url (using the referer header) to: '${req.originalUrl}'.`);        
        logger.debug(logFormat(log));

        return req;
    }
}
