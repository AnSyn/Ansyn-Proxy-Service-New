{
    const winston = require('winston');
    const config = require('../config.json');

    const logColorsAndTime = winston.format.combine(
        winston.format.colorize({
            all: true
        }),
        winston.format.label({
            label: '[proxy-service]'
        }),
        winston.format.timestamp({
            format: "YY-MM-DD HH:mm:ss"
        }),
        winston.format.printf(
            info => `${info.timestamp}  ${info.level} : ${info.message}`
        )
    );

    module.exports = new winston.transports.Console({
        level: config.logLevel,
        colorize: true,
        timestamp: true,
        json: true,
        format: winston.format.combine(winston.format.colorize(), logColorsAndTime)
    });
}
