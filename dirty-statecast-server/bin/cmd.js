#!/usr/bin/env node

var logger = require('winston-color');
const meow = require('meow');
const cli = meow(`
Usage
    $ statecast-server

Options
    --port      change http port (default is 8998)
    --debug     prints debug logs
    -h, --help  this screen

Examples
    $ statecast-server
    $ statecast-server --port 80

`);

const listen = ({ port, debug }) => {
    var logger = debug && require('winston-color').debug;
    port = port || 8998;

    var app = require('express')();
    var http = require('http').Server(app);
    var state = require('../lib/statecast-server').bindServer(http, app, debug);
    var bodyParser = require('body-parser');

    app.use(bodyParser.text({type: '*/*'}))
    app.get('/index.html', (req, res) => {
        res.sendFile(__dirname + '/www/index.html');
    });

    app.route(/(.*)/)
        .get((req, res) => {
            logger && logger(`get|${req.params[0]}`)
            if (req.query.set !== undefined) {
                res.json(state.set(req.params[0], JSON.parse(req.query.set)));
            } else if (req.query.delete !== undefined) {
                res.json(state.set(req.params[0], null));
            } else {
                res.json(state.get(req.params[0]));
            }
        })
        .put((req, res) => {
            logger && logger(`set|${req.params[0]}|${req.body}`)
            res.json(state.set(req.params[0], JSON.parse(req.body)));
        })
        .post((req, res) => {
            res.json(state.set(req.params[0], JSON.parse(req.body)));
        });

    http.listen(port, () => {
        logger && logger(`listening on *:${port}`);

        state.set('/alive', Date.now());
        setInterval(() => {
            state.set('/alive', Date.now());
        }, 60*1000);
    });
}

listen(cli.flags);
