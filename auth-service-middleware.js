{
    const axios = require('axios');
    const config = require('./config.json');
    const logger = require('./logger/logger.js');

    module.exports = async (req, res, next) =>
    { 
        const url = req.originalUrl;
        logger.info(`[proxy-service]: ${req.method} ${url} [requested by: ${req.ip}]`);
        const authToken = req.headers[config.authTokenHeader];  
        if (authToken === undefined) {
            logger.debug(`[proxy-service]: ${req.method} ${url} [no authentication required]`);
            next();
            return;
        }

        logger.debug(`[proxy-service]: ${req.method} ${url} [authentication required]`);
        let authUrl = config.authService; 
        if (false == authUrl.endsWith('/')) {
            authUrl += '/';
        }
        const authReq = `${authUrl}?${config.authRequestTokenHeader}=${authToken}`;
        try {
            const response = await axios.get(authReq);
            logger.debug(`[proxy-service]: ${req.method} ${url} [authentication token received]`);
            const token = response.headers[config.authTokenHeader];
            let modifiedUrl = req.url;
            if (false === modifiedUrl.endsWith('/')) {
                modifiedUrl +='/';
            }
            modifiedUrl += `?${config.authTokenHeader}=${token}`;
            req.originalUrl = modifiedUrl;
            next();
        } catch (err) {            
            logger.error(`[proxy-service]: ${req.method} ${url} [failed to get authentication token]`);
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