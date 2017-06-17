var _ = require('lodash');

class StateCastServer {
    
    constructor() {
        this.store = {};
        this.debug = null;
    }

    bindServer(http, app, debug) {
        if (debug) {
            this.debug = require('winston-color').debug;
        }

        this.io = require('socket.io')(http);
        
        this.io.on('connection', (socket) => {
            console.log('connected', debug)
            this.debug && this.debug('a user connected');

            socket.on('set', (data) => {
                this.debug && this.debug('set-x')
                this.set(data.key, data.value);
            })

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
        this.debug && this.debug(`get [${key}] = ${JSON.stringify(this.store[key])}`);
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
                if (this.store[key] !== undefined) {
                    delete this.store[key];
                    this.updated(key);
                }
            } else {
                if (!_.isEqual(this.store[key], value)) {
                    this.store[key] = value;
                    this.updated(key);
                }
            }
            return true;
        } catch (e) {
            return false;
        }
    }
};

function bindServer(http, app, debug) {
    var server = new StateCastServer();
    server.bindServer(http, app, debug)

    return server;
}

module.exports = { StateCastServer, bindServer };
