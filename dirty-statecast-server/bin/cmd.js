#!/usr/bin/env node

var logger = require('winston-color');
var program = require('commander');
function myParseInt(string, defaultValue) {
  var int = parseInt(string, 10);

  if (typeof int == 'number') {
    return int;
  } else {
    return defaultValue;
  }
}

program
    .version('0.0.1')
    .usage('[options]')
    .option('-p, --port <number>', 'http port', myParseInt, 8998)
    .option('-d, --debug', 'debug')
    .option('--username <username>', 'username')
    .option('--password <password>', 'password')
    .parse(process.argv);

const listen = ({ port, debug, username, password }) => {
    var app = require('express')();
    var http = require('http').Server(app);
    var state = require('../lib/statecast-server').bindServer(http, app, debug);
    var basicAuth = require('basic-auth-connect');
    var bodyParser = require('body-parser');
    var logger = debug && require('winston-color').debug;

    app.use(bodyParser.text({type: '*/*'}))
    if (username && password) {
        app.use(basicAuth(username, password));
    }

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
        console.log(`listening on *:${port}`);

        state.set('/alive', Date.now());
        setInterval(() => {
            state.set('/alive', Date.now());
        }, 60*1000);
    });
}

listen(program);
