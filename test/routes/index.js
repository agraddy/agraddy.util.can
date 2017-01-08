var luggage = require('agraddy.luggage');
var post = require('agraddy.luggage.parse.post');

var routes = {};
routes.get = {};
routes.post = {};

routes.get['/plain'] = function(req, res) {
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.write('one');
	res.end();
};

routes.get['/json'] = function(req, res) {
	res.writeHead(200, {"Content-Type": "application/json"});
	res.write('{"status": "success"}');
	res.end();
};

routes.post['/post'] = function(req, res) {
	luggage(req, res, [post], function(err, req, res, lug) {
		res.writeHead(200, {"Content-Type": "application/json"});
		res.write(JSON.stringify(lug.post));
		res.end();
	});
};

routes.post['/multipart'] = function(req, res) {
	luggage(req, res, [post], function(err, req, res, lug) {
		res.writeHead(200, {"Content-Type": "application/json"});
		res.write(JSON.stringify(lug.post));
		res.end();
	});
};

module.exports = routes;
