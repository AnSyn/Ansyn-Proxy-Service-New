{
    const Transport = require('winston-transport');
    module.exports = class LoggerCustomTransport extends Transport {
        constructor(opts) {
            super(opts);
        }

        log(info, callback) {
            // console.info(info);           
            callback();
        }
    }
}
