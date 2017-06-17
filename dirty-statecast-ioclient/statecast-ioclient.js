var io = require('socket.io-client');

class StateCastIoClient {
    constructor(uri) {
        this.io = io(uri);
    }

    set(key, value) {
        this.io.emit('set', { key, value })
    }
}

module.exports = StateCastIoClient;
