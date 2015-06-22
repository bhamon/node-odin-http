'use strict';

var lib = {
	node:{
		path:require('path'),
		http:require('http')
	},
	deps:{
		q:require('q'),
		qIo:{
			fs:require('q-io/fs')
		},
		joi:require('joi'),
		express:require('express')
	},
	odin:{
		Exception:require('odin').Exception,
		util:require('odin').util,
		http:{
			ExceptionHttp:require('./ExceptionHttp'),
			ExceptionRest:require('./ExceptionRest'),
			Router:require('./Router')
		}
	}
};

/**
	@class
	@classdesc		An HTTP server backed by express.
	@alias			module:odin/http.Server

	@desc			Constructs a new HTTP server.
*/
function Server() {
	var app = lib.deps.express();
	app.enable('case sensitive routing');

	/**
		@readonly
		@member {module:odin/http.Router}	module:odin/http.Server#router
		@desc								Main server router.
	*/
	Object.defineProperty(this, 'router', {value:new lib.odin.http.Router(app)});

	/**
		@private
		@readonly
		@member {http.Server}		module:odin/http.Server#_server
		@desc						HTTP server.
	*/
	Object.defineProperty(this, '_server', {value:lib.node.http.createServer(app)});

	/**
		@private
		@readonly
		@member {Object}	module:odin/http.Server#_sockets
		@desc				Pending sockets.
	*/
	Object.defineProperty(this, '_sockets', {value:{}});

	var self = this;
	this._server.on('connection', function(p_socket) {
		var key = p_socket.remoteAddress + ':' + p_socket.remotePort;
		self._sockets[key] = p_socket;

		p_socket.on('close', function() {
			delete self._sockets[key];
		});
	});
};

/**
	@desc						Binds the HTTPserver to a port/[host].
	@param {Number} p_port		Binding port.
	@param {String} [p_host]	Binding host.
	@returns {Promise}			A promise for the operation completion.
*/
Server.prototype.listen = function(p_port, p_host) {
	var args = lib.odin.util.validate({
		port:p_port,
		host:p_host
	}, {
		port:lib.deps.joi.number().required().integer().positive().max(65535),
		host:lib.deps.joi.string().optional().hostname()
	});

	var defer = lib.deps.q.defer();

	this._server.on('listening', defer.resolve.bind(defer));
	this._server.on('error', defer.reject.bind(defer));

	this._server.listen(args.port, args.host);

	return defer.promise;
};

/**
	@desc					Shutdown this server. All the pending connections are destroyed.
	@returns {Promise}		A promise for the operation completion.
*/
Server.prototype.shutdown = function() {
	var defer = lib.deps.q.defer();
	this._server.close(function() {
		defer.resolve();
	});

	var self = this;
	Object.keys(this._sockets).forEach(function(p_key) {
		self._sockets[p_key].destroy();
		delete self._sockets[p_key];
	});

	return defer.promise;
};

module.exports = Server;