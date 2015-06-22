'use strict';

var lib = {
	node:{
		path:require('path')
	},
	deps:{
		q:require('q'),
		qIo:{
			fs:require('q-io/fs')
		},
		express:require('express')
	}
};

var HTTP_METHODS = ['get', 'post', 'put', 'delete', 'options'];

/**
	@class
	@classdesc								An HTTP router backed by express.
	@alias									module:odin/http.Router

	@desc									Constructs a new HTTP router.
	@param {express.Router} [p_router]		Express router instance.
*/
function Router(p_router) {
	p_router = p_router || new lib.deps.express.Router({caseSensitive:true});

	/**
		@private
		@readonly
		@member {express.Router}	module:odin/http.Router#_router
		@desc						Express router instance.
	*/
	Object.defineProperty(this, '_router', {value:p_router});
};

/**
	@desc									Dispatches the incomming HTTP request.
	@param {http.Request} p_request			HTTP request.
	@param {http.Response} p_response		HTTP response.
	@param {Function} p_next				Chaining callback.
*/
Router.prototype.handle = function(p_request, p_response, p_next) {
	this._router.apply(this._router, arguments);
};

/**
	@desc								Works the same as {@link module:odin/http.Router#METHOD} but matches all HTTP verbs.
	@param {String} p_path				Matching path.
	@param {...Function} p_callback		Callback function called for each matching request.
*/
Router.prototype.all = function(p_path, p_callback) {
	this._router.all.apply(this._router, arguments);
};

HTTP_METHODS.forEach(function(p_method) {
	/**
		@alias								module:odin/http.Router#METHOD
		@desc								Provides routing functionnality based on request method and URI.
											METHOD is one of the HTTP verbs (such as GET, POST, ...).
		@param {String} p_path				Matching path.
		@param {...Function} p_callback		Callback function called for each matching request.
	*/
	Router.prototype[p_method] = function(p_path) {
		this._router[p_method].apply(this._router, arguments);
	};
});

/**
	@desc							Allows asynchronous parameter resolution for this specific router.
	@param {String} [p_name]		Parameter name.
	@param {Function} p_callback	Callback function.
*/
Router.prototype.param = function(p_name, p_callback) {
	this._router.param.apply(this._router, arguments);
};

/**
	@desc									Returns a new sub router bound to the specified matching path.
	@param {String} p_path					Matching path.
	@returns {module:odin/http.Router}		The matching sub router.
*/
Router.prototype.route = function(p_path) {
	var route = new Router();
	this.use(p_path, route);
	return route;
};

/**
	@desc								Add the specified middlewares to this router.
	@param {String} [p_path]			Matching path.
	@param {...Function} p_middleware	Middleware called for each matching request.
*/
Router.prototype.use = function(p_path, p_middleware) {
	var args = Array.prototype.slice.call(arguments, 0);
	this._router.use.apply(this._router, args.map(function(p_arg) {
		if(p_arg instanceof Router) {
			return p_arg.handle.bind(p_arg);
		}

		return p_arg;
	}));
};

/**
	@desc						Load and attach all the middlewares from the specified directory.
								The middlewares are loaded in the natural alphanumeric order.
	@param {String} p_path		Middlewares path.
	@return {Promise}			A promise for the operation completion.
*/
Router.prototype.attachMiddlewares = function(p_path) {
	var self = this;
	return lib.deps.qIo.fs.list(p_path)
	.then(function(p_files) {
		return p_files
		.filter(function(p_file) { return lib.node.path.extname(p_file) == '.js'; })
		.map(function(p_file) {
			var middleware = require(lib.node.path.join(p_path, p_file));
			self.use(middleware);
		});
	});
};

/**
	@desc						Load and attach all the routers from the specified directory.
								A 404 fallback handler is appended at the end.
	@param {String} p_path		Routers path.
	@return {Promise}			A promise for the operation completion.
*/
Router.prototype.attachRouters = function(p_path) {
	var self = this;
	return lib.deps.qIo.fs.list(p_path)
	.then(function(p_files) {
		var api = new Router();
		return lib.deps.q.all(
			p_files
			.filter(function(p_file) { return lib.node.path.extname(p_file) == '.js'; })
			.map(function(p_file) {
				var router = require(lib.node.path.join(p_path, p_file));
				return router.init(api);
			})
		)
		.then(function() {
			self.use(api);
		});
	});
};

/**
	@desc						Attach the provided static resource path to the given URI.
	@param {String} p_path		Static resources path.
*/
Router.prototype.attachStatic = function(p_path) {
	this._router.use(lib.deps.express.static(p_path));
};

module.exports = Router;