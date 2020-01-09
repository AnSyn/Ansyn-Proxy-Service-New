{
    const axios = require('axios');
    const config = require('./config.json');
    const logger = require('./logger/logger.js');
    const logFormat = require('./logger/log-formatter.js')
    const requestLog = require('./log-request.js')

    module.exports = async (req, res, next) =>
    { 
        const url = req.originalUrl;
        let log = new requestLog(req.method, url, req.ip, "checking the need for authentication.");        
        logger.debug(logFormat(log));
        const authToken = req.headers[config.authTokenHeader];  
        if (authToken === undefined) {
            log = new requestLog(req.method, url, req.ip, "no authentication required.");
            logger.debug(logFormat(log));
            next();
            return;
        }

        log = new requestLog(req.method, url, req.ip, "authentication required.");
        logger.debug(logFormat(log));
        let authUrl = config.authService; 
        if (false == authUrl.endsWith('/')) {
            authUrl += '/';
        }
        const authReq = `${authUrl}?${config.authRequestTokenHeader}=${authToken}`;
        try {
            const response = await axios.get(authReq);
            log = new requestLog(req.method, url, req.ip, "authentication token received.");
            logger.debug(logFormat(log));
            const token = response.headers[config.authTokenHeader];
            let modifiedUrl = req.url;
            if (false === modifiedUrl.endsWith('/')) {
                modifiedUrl +='/';
            }
            modifiedUrl += `?${config.authTokenHeader}=${token}`;
            req.originalUrl = modifiedUrl;
            next();
        } catch (err) {    
            log = new requestLog(req.method, url, req.ip, "failed to get authentication token.");
            logger.error(logFormat(log));
            const errResponse = err.response;
            if (errResponse) {
                res._headers = errResponse.headers;
                res.statusMessage = errResponse.statusMessage;
                res.status(errResponse.status).send();
            }
            res.status(500).send({ error: err.message});
        }
    }
}
