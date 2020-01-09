{
    module.exports = class LogRequest {
        constructor(method, url, originIp, message) {
            this.method = method;
            this.url = url;
            this.originIp = originIp;
            this.message = message;
        }
    }
}