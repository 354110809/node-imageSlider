var http = require('http');
var url = require('url');
var fs = require('fs');
var crypto = require('crypto');

var server = http.createServer(function(req, res) {
    var pathname = url.parse(req.url);
    var reg_js = /^\/lib\/\w+\.js$/i;
    var reg_img = /^\/(\w+)\/(.+\.(jpg|png|jpeg|gif))$/i;
    var reg_html = /^\/(\w+\.html)$/;
    var reg_download = /^\/icons\/(.*)$/;
	
	var ip = getClientIp(req);
    //console.log(req.headers);
    if (reg_html.test(pathname.pathname)) {
        var matchs = pathname.pathname.match(reg_html);
        var file = matchs && matchs[1] ? matchs[1] : 'index.html';
        res.writeHead(200, {'Content-Type': 'text/html'});
        var data = fs.createReadStream('./' + file);
        data.pipe(res);
    } else if (reg_img.test(pathname.pathname)) {
        var matchs = pathname.pathname.match(reg_img);
        var type = 'image/' + matchs[3];

        if (matchs[3].toLowerCase() == 'jpg') {
            type = 'image/JPEG';
        }

        var img = './' + matchs[1] + '/' + matchs[2];
		img = decodeURI(img);
        fs.exists(img, function(e) {
            if (e) {
                var ctime = new Date(fs.statSync(img).ctime);
                var modified_since = req.headers['if-modified-since'];
                modified_since = modified_since ? new Date(modified_since) : null;
                var time = new Date().toGMTString();

                // HTTP/1.1
                var header_etag = req.headers['if-none-match'];
                var content_etag = md5(img).substr(0, 6);

				/*
                if (!req.headers.referer || req.headers.referer.indexOf('http://raptor.so/') === -1) {
                    res.writeHead(404);
                    res.end();
                    return;
                }
				*/

                if (header_etag !== content_etag) {
                //if (modified_since && ctime > modified_since) {
                    res.writeHead(200, {'Content-Type': type, "Last-Modified": time, "ETag": content_etag});
                    //console.log(req.headers.referer);
                    var data = fs.createReadStream(img);
                    //console.log(data);
                    data.pipe(res);
                    //res.end();
                } else {
                    res.writeHead(304);
                    res.end();
                }
            } else {
                res.writeHead(404);
                res.end('Not Found!');
            }
        });
    } else if (pathname.pathname === '/get_list') {
        fs.readdir('./img/', function(err, files) {
            if (err) {
                files = [];
            }
			
            res.writeHead(200, {'Content-Type': 'application/json;charset=UTF-8'});
            res.end('load_images(' + JSON.stringify(files) + ')');
        });
    } else if (reg_js.test(pathname.pathname)) {
        var matchs = pathname.pathname.match(reg_js);
        var js_file = matchs[0].replace(/^\//, './');
        var data = fs.createReadStream(js_file);

        res.writeHead(200, {'Content-Type': 'text/javascript;charset=UTF-8'})
        data.pipe(res);
    } else {
        res.writeHead(404);
        res.end('Not Found!');
    }
});

function md5(text) {
    return crypto.createHash('md5').update(text).digest('hex');
}

function getClientIp(req) {
	return req.headers['x-forwarded-for'] ||
	req.connection.remoteAddress ||
	req.socket.remoteAddress ||
	req.connection.socket.remoteAddress;
};

var app = server.listen(80);

var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({server: app});

// 相关变量
var user_list = [];
var limit = 20;
var msg_list = [];

wss.on('connection', function(conn) {
    var key = conn.upgradeReq.headers['sec-websocket-key'];
    //console.log(key);
    //user_list.push(key);

    conn.on('message', function(str) {
        fs.writeFile('./zf.dat', new Date() + " " + str + "\n", {flag: 'a'}, function() {
        });

        msg_list.unshift(str);
        msg_list.length = Math.min(msg_list.length, limit);
        var i;
        for (i = wss.clients.length - 1; i >= 0; i--) {
            wss.clients[i].send(str);
        }
    });

    conn.on('error', function() {
        console.log('onError', key);
    });

    conn.on('close', function() {
        //console.log('onClose', key);
    });
});

var index = 0;
setTimeout(function() {
    index = Math.floor(Math.random() * msg_list.length);
    for (var i = wss.clients.length - 1; i >= 0; i--) {
        wss.clients[i].send(msg_list[index]);
    }
    setTimeout(arguments.callee, 5000);
}, 0);
