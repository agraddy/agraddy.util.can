process.chdir('test');
var tap = require('agraddy.test.tap')(__filename);

var mod = require('../');

tap.assert.equal(typeof mod, 'function', 'Should be a function.');
tap.assert.equal(typeof mod.get, 'function', 'Should be a function.');
tap.assert.equal(typeof mod.post, 'function', 'Should be a function.');


mod.get('/plain', function(err, res) {
	tap.assert.equal(res, 'one', 'Should return the contents as a string.');
});

mod.get('/json', function(err, res) {
	tap.assert.equal(res.status, 'success', 'Should return the contents as json if the content-type is json.');
});

mod.post('/post', {one: 1, two: 2, three: 3}, function(err, content, res) {
	tap.assert.deepEqual(content, {one: 1, two: 2, three: 3}, 'Should return the contents as json if the content-type is json.');
    // Probably need to figure out a better way so that statusCode can be read. 
    // Need to compare with bottle resposne.
	tap.assert.equal(res._statusCode, 200, 'Should return response too.');
});

mod.post('/multipart', {four: 4, five: 5, six: 6}, {type: 'multipart'}, function(err, res) {
	tap.assert.deepEqual(res, {four: 4, five: 5, six: 6}, 'Should return the contents as json if the content-type is json.');
});

// PLAIN
mod(require('./fixtures/plain.req'), function(err, res) {
	tap.assert.equal(res, 'one', 'Should return the contents as a string.');
});

// JSON
mod(require('./fixtures/json.req'), function(err, res) {
	tap.assert.equal(res.status, 'success', 'Should return the contents as json if the content-type is json.');
});

// POST
mod(require('./fixtures/post.req'), function(err, res) {
	tap.assert.deepEqual(res, {one: 1, two: 2, three: 3}, 'Should return the contents as json if the content-type is json.');
});

// MULTIPART
mod(require('./fixtures/multipart.req'), function(err, res) {
	tap.assert.deepEqual(res, {four: 4, five: 5, six: 6}, 'Should return the contents as json if the content-type is json.');
});

// Handle string to request file
mod('./fixtures/plain.req', function(err, res) {
	tap.assert.equal(res, 'one', 'Should return the contents as a string.');
});

