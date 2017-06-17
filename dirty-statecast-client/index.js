#! /usr/bin/env node
const http = require('http');

const help = () => {
    console.log(`
Usage
    $ statecast --help
    $ statecast [ host:port ] key get
    $ statecast [ host:port ] key set json
`);
}

const parse = (argv) => {
    var cur = 0;
    var server = argv[cur][0] != '/'
        ? argv[cur++]
        : "localhost:8998";
    var key = argv[cur++];
    var command = argv[cur++];
    var json = command == 'set' ? argv[cur++] : undefined;
    return { server, key, command, json };
}

const get = (host, port, path) => {
    http.get({host, port, path }, function(response) {
        var body = '';
        response.on('data', function(d) {
            body += d;
        });
        response.on('end', function() {
            var parsed = JSON.parse(body);
            console.log(JSON.stringify(parsed, null, 4));
        });
    });
}

const set = (host, port, path, json) => {
    http.request({
            host,
            port,
            path,
            method: "PUT",
            headers: { 
                "Content-Type" : "application/json",
            }
        }, function(response) {
            var body = '';
            response.on('data', function(d) {
                body += d;
            });
            response.on('end', function() {
                var parsed = JSON.parse(body);
                console.log(JSON.stringify(parsed, null, 4));
            });
    }).end(json);
}

const command = (argv) => {
    if (argv.indexOf("--help") != -1) {
        help();
        return;
    }
    var args = parse(argv);

    var host_port = args.server.split(':');
    var host = host_port[0];
    var port = host_port[1] || 8998;
    
    if (args.command == 'get') {
        get(host, port, args.key);
    } else if (args.command == 'set') {
        set(host, port, args.key, args.json);
    } else {
        help();
    }
}

try {
    command(process.argv.splice(2))
} catch (e) {
    help();
}
