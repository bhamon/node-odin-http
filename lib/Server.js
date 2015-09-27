'use strict';

let lib = {
	node:{
		path:require('path'),
		fs:require('fs'),
		http:require('http')
	},
	deps:{
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

let SYMBOL_MEMBER_SERVER = Symbol('server');
let SYMBOL_MEMBER_SOCKETS = Symbol('sockets');

/**
	@class
	@classdesc		An HTTP server backed by express.
	@alias			module:odin/http.Server
*/
class Server {
	/*
		@desc			Constructs a new HTTP server.
	*/
	constructor() {
		let app = lib.deps.express();
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
			@member {http.Server}		module:odin/http.Server#[SYMBOL_MEMBER_SERVER]
			@desc						HTTP server.
		*/
		Object.defineProperty(this, SYMBOL_MEMBER_SERVER, {value:lib.node.http.createServer(app)});

		/**
			@private
			@readonly
			@member {Set.<Socket>}		module:odin/http.Server#[SYMBOL_MEMBER_SOCKETS]
			@desc						Pending sockets.
		*/
		Object.defineProperty(this, SYMBOL_MEMBER_SOCKETS, {value:new Set()});

		let self = this;
		this[SYMBOL_MEMBER_SERVER].on('connection', function(p_socket) {
			self[SYMBOL_MEMBER_SOCKETS].add(p_socket);

			p_socket.on('close', function() {
				self[SYMBOL_MEMBER_SOCKETS].delete(p_socket);
			});
		});
	}

	/**
		@desc						Binds the HTTPserver to a port/[host].
		@param {Number} p_port		Binding port.
		@param {String} [p_host]	Binding host.
		@returns {Promise}			A promise for the operation completion.
	*/
	listen(p_port, p_host) {
		let args = lib.odin.util.validate({
			port:p_port,
			host:p_host
		}, {
			port:lib.deps.joi.number().required().integer().positive().max(65535),
			host:lib.deps.joi.string().optional().hostname()
		});

		return new Promise(function(p_resolve, p_reject) {
			this[SYMBOL_MEMBER_SERVER].on('listening', p_resolve);
			this[SYMBOL_MEMBER_SERVER].on('error', p_reject);

			this[SYMBOL_MEMBER_SERVER].listen(args.port, args.host);
		});
	}

	/**
		@desc					Shutdown this server. All the pending connections are destroyed.
		@returns {Promise}		A promise for the operation completion.
	*/
	shutdown() {
		let promise = new Promise(function(p_resolve) {
			this[SYMBOL_MEMBER_SERVER].close(p_resolve);
		});

		for(let socket of this[SYMBOL_MEMBER_SOCKETS]) {
			socket.destroy();
		}

		this[SYMBOL_MEMBER_SOCKETS].clear();

		return promise;
	}
}


module.exports = Server;