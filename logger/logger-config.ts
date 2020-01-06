{
    const winston = require('winston');
    const config = require('../config.json');
    const logStorageTransport = require('./log-storage-transport.ts')
    const consoleLogColorsAndTime = winston.format.combine(
        winston.format.colorize({
            all: true
        }),
        winston.format.label({
            label: '[Proxy-Service]'
        }),
        winston.format.timestamp({
            format: "YY-MM-DD HH:mm:ss"
        }),
        winston.format.printf(
            info => `${info.timestamp}  ${info.level} : ${info.message}`
        )
    );

    const logTime = winston.format.timestamp({format: "YY-MM-DD HH:mm:ss"});

    const logger = winston.createLogger({
        format: winston.format.json(),
        transports: [new winston.transports.Console({
            level: config.logLevel,
            colorize: true,
            timestamp: true,
            json: true,
            format: winston.format.combine(winston.format.colorize(), consoleLogColorsAndTime)
        }),
        new logStorageTransport({
            level: config.logLevel,
            timestamp: true,
            json: true,
            format: logTime
        })
        ]
    });

    module.exports = logger;
}