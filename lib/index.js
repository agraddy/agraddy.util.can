var events = require('events');
var router = require('agraddy.http.router');
var response = require('agraddy.test.res');
var stream = require('stream');
var qs = require('querystring');
var path = require('path');

var loaded = false;

var boundary = '---------------------------NODECLIENT';

multipart = {};

multipart.chunk = function(req, data) {
	var keys = Object.keys(data);
	var i;
	var output = '';

	each(keys, function(item, cb) {
		var output = '';
		if(typeof data[item]._read == 'function') {
			output += '--';
			output += boundary;
			output += '\r\n';
			output += 'Content-Disposition: form-data; name="' + item + '"';
			output += '\r\n';
			output += '\r\n';
			req.write(output);

			data[item].on('data', function(chunk) {
				req.write(chunk);
			});

			data[item].on('end', function() {
				req.write('\r\n');
				cb();
			});
		} else {
			req.write(multipart.partify(item, data[item]));
			cb();
		}
	}, function(err) {
		var output = '';
		output += '--';
		output += boundary;
		output += '--';
		output += '\r\n';

		req.write(output);
		req.end();
	});
}

multipart.partify = function(name, value) {
	var output = '';
	output += '--';
	output += boundary;
	output += '\r\n';
	output += 'Content-Disposition: form-data; name="' + name + '"';
	output += '\r\n';
	output += '\r\n';
	output += value;
	output += '\r\n';

	return output;
}

multipart.stringify = function(data) {
	var keys = Object.keys(data);
	var i;
	var output = '';

	for(i = 0; i < keys.length; i++) {
		output += multipart.partify(keys[i], data[keys[i]]);
	}

	if(keys.length) {
		output += '--';
		output += boundary;
		output += '--';
		output += '\r\n';
	}

	return output;
}


// If the routes have already been loaded
if(router.loaded) {
	loaded = true;
} else {
	router.on('loaded', function() {
		loaded = true;
	});
}


var mod = function(req, cb) {
	if(typeof req == 'string') {
		req = require(path.join(process.cwd(), path.normalize(req)));
	}
	if(loaded) {
		handle(req, cb);
	} else {
		router.on('loaded', function() {
			handle(req, cb);
		});
	}
};

mod.get = function(url, cb) {
	if(loaded) {
		mod({method: 'GET', url: url}, cb);
	} else {
		router.on('loaded', function() {
			mod({method: 'GET', url: url}, cb);
		});
	}
}

mod.post = function(url, data, options, cb) {
	var req = new stream.Readable();

	if(typeof options == 'function') {
		cb = options;
		options = {};
	}

	req.method = 'POST';
	req.url = url;

	req.headers = {};
	if(options.type && options.type == 'multipart') {
		req.headers['content-type'] = 'multipart/form-data; boundary=' + boundary;
		req._read = function(size) {
			this.push(multipart.stringify(data));
			this.push(null);
		};
	} else {
		req.headers['content-type'] = 'application/x-www-form-urlencoded';
		req._read = function(size) {
			this.push(qs.stringify(data));
			this.push(null);
		};
	}

	if(loaded) {
		mod(req, cb);
	} else {
		router.on('loaded', function() {
			mod(req, cb);
		});
	}
}

function handle(req, cb) {
	var res = response();
	res.on('finish', function() {
		if(res._headers['content-type'] && res._headers['content-type'] == 'application/json') {
			cb(null, JSON.parse(res._body));
		} else {
			cb(null, res._body);
		}
	});

	router.handler(req, res);
}

module.exports = mod;
