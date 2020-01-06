
const Transport = require('winston-transport');

module.exports = class LogStorageTransport extends Transport {
	constructor(opts) {
		super(opts);
		this.items = [];
	}

	log(info, callback) {
		this.items.push(info);
		callback();
	}

	 get() {
	 	return this.items;
	 }
}
