{
    const winston = require('winston');
    const consoleTransport = require('./logger-console-transport.js');
    const customTransport = require('./logger-custom-transport.js');
    const config = require('../config.json');

    const logTime = winston.format.timestamp({format: "YY-MM-DD HH:mm:ss"});

    const logger = winston.createLogger({
        format: winston.format.json(),
        transports: [consoleTransport,
        new customTransport({
            level: config.logLevel,
            timestamp: true,
            json: true,
            format: logTime
        })
        ]
    });

    module.exports = logger;
}
