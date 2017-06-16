
class StateCastServer {
    
    constructor() {
        this.store = {};
        this.debug = null;
    }

    bindServer(http, app, debug) {
        if (debug) {
            this.debug = require('winston-color');
        }

        this.io = require('socket.io')(http);
        
        this.io.on('connection', (socket) => {
            this.debug && this.debug('a user connected');

            socket.on('subscribe', (key) => {
                socket.emit('data', this.data(key));
                socket.join(key);
            })
            socket.on('unsubscribe', (key) => {
                socket.leave(key);
            })
            socket.on('disconnect', function () {
                this.debug && this.debug('user disconnected');
            });
        });
    }

    undefinedToNull(value) {
        return value === undefined ? null : value;
    }

    nullToUndefined(value) {
        return value === null ? undefined: value;
    }

    data(key) {
        return {
            key,
            value: this.undefinedToNull(this.store[key])
        };
    }

    get(key) {
        this.debug && this.debug(`set [${key}] = ${JSON.stringify(value)}`);
        return this.undefinedToNull(this.store[key]);
    }

    updated(key) {
        this.io.sockets.adapter.rooms[key] &&
            this.io.sockets.in(key).emit('data', this.data(key));
    }

    set(key, value) {
        this.debug && this.debug(`set [${key}] = ${JSON.stringify(value)}`);
        try {
            if (value === null || value === undefined) {
                delete this.store[key];
            } else {
                this.store[key] = value;
            }
            this.updated(key);
            return true;
        } catch (e) {
            return false;
        }
    }
};

function bindServer(http, app) {
    var server = new StateCastServer();
    server.bindServer(http, app)

    return server;
}

module.exports = { StateCastServer, bindServer };
