'use strict';

let lib = {
	node:{
		path:require('path')
	},
	deps:{
		express:require('express'),
		co:require('co'),
		coFs:require('co-fs')
	}
};

let SYMBOL_MEMBER_ROUTER = Symbol('router');

/**
	@class
	@classdesc								An HTTP router backed by express.
	@alias									module:odin/http.Router
*/
class Router {
	/**
		@desc									Constructs a new HTTP router.
		@param {express.Router} [p_router]		Express router instance.
	*/
	constructor(p_router) {
		p_router = p_router || new lib.deps.express.Router({caseSensitive:true});

		/**
			@private
			@readonly
			@member {express.Router}	module:odin/http.Router#[SYMBOL_MEMBER_ROUTER]
			@desc						Express router instance.
		*/
		Object.defineProperty(this, SYMBOL_MEMBER_ROUTER, {value:p_router});
	}

	/**
		@desc									Dispatches the incomming HTTP request.
		@param {http.Request} p_request			HTTP request.
		@param {http.Response} p_response		HTTP response.
		@param {Function} p_next				Chaining callback.
	*/
	handle(p_request, p_response, p_next) {
		this[SYMBOL_MEMBER_ROUTER].apply(this[SYMBOL_MEMBER_ROUTER], arguments);
	}

	/**
		@desc								Register a route handler for all HTTP verbs.
		@param {String} p_path				Matching path.
		@param {...Function} p_callback		Callback function called for each matching request.
	*/
	all(p_path, p_callback) {
		this[SYMBOL_MEMBER_ROUTER].all.apply(this[SYMBOL_MEMBER_ROUTER], arguments);
	}

	/**
		@alias								module:odin/http.Router#get
		@desc								Provides routing functionnality based on request method and URI.
		@param {String} p_path				Matching path.
		@param {...Function} p_callback		Callback function called for each matching request.
	*/
	get(p_path) {
		this[SYMBOL_MEMBER_ROUTER].get.apply(this[SYMBOL_MEMBER_ROUTER], arguments);
	}
	/**
		@alias								module:odin/http.Router#get
		@desc								Provides routing functionnality based on request method and URI.
		@param {String} p_path				Matching path.
		@param {...Function} p_callback		Callback function called for each matching request.
	*/
	post(p_path) {
		this[SYMBOL_MEMBER_ROUTER].post.apply(this[SYMBOL_MEMBER_ROUTER], arguments);
	}
	/**
		@alias								module:odin/http.Router#get
		@desc								Provides routing functionnality based on request method and URI.
		@param {String} p_path				Matching path.
		@param {...Function} p_callback		Callback function called for each matching request.
	*/
	put(p_path) {
		this[SYMBOL_MEMBER_ROUTER].put.apply(this[SYMBOL_MEMBER_ROUTER], arguments);
	}
	/**
		@alias								module:odin/http.Router#get
		@desc								Provides routing functionnality based on request method and URI.
		@param {String} p_path				Matching path.
		@param {...Function} p_callback		Callback function called for each matching request.
	*/
	delete(p_path) {
		this[SYMBOL_MEMBER_ROUTER].delete.apply(this[SYMBOL_MEMBER_ROUTER], arguments);
	}
	/**
		@alias								module:odin/http.Router#get
		@desc								Provides routing functionnality based on request method and URI.
		@param {String} p_path				Matching path.
		@param {...Function} p_callback		Callback function called for each matching request.
	*/
	options(p_path) {
		this[SYMBOL_MEMBER_ROUTER].options.apply(this[SYMBOL_MEMBER_ROUTER], arguments);
	}

	/**
		@desc							Allows asynchronous parameter resolution for this specific router.
		@param {String} [p_name]		Parameter name.
		@param {Function} p_callback	Callback function.
	*/
	param(p_name, p_callback) {
		this[SYMBOL_MEMBER_ROUTER].param.apply(this[SYMBOL_MEMBER_ROUTER], arguments);
	}

	/**
		@desc									Returns a new sub router bound to the specified matching path.
		@param {String} p_path					Matching path.
		@returns {module:odin/http.Router}		The matching sub router.
	*/
	route(p_path) {
		let route = new Router();
		this.use(p_path, route);
		return route;
	}

	/**
		@desc								Add the specified middlewares to this router.
		@param {String} [p_path]			Matching path.
		@param {...Function} p_middleware	Middleware called for each matching request.
	*/
	use(p_path, p_middleware) {
		let args = Array.from(arguments);
		this[SYMBOL_MEMBER_ROUTER].use.apply(this[SYMBOL_MEMBER_ROUTER], args.map(function(p_arg) {
			if(p_arg instanceof Router) {
				return p_arg.handle.bind(p_arg);
			}

			return p_arg;
		}));
	}

	/**
		@desc						Load and attach all the middlewares from the specified directory.
									The middlewares are loaded in the natural alphanumeric order.
		@param {String} p_path		Middlewares path.
		@return {Promise}			A promise for the operation completion.
	*/
	attachMiddlewares(p_path) {
		let self = this;
		return lib.deps.co(function*() {
			let files = yield lib.deps.coFs.readdir(p_path);
			for(let file of files) {
				if(lib.node.path.extname(file) != '.js') {
					continue;
				}

				let middleware = require(lib.node.path.join(p_path, file));
				self.use(middleware);
			}
		});
	}

	/**
		@desc						Load and attach all the routers from the specified directory.
									A 404 fallback handler is appended at the end.
		@param {String} p_path		Routers path.
		@return {Promise}			A promise for the operation completion.
	*/
	attachRouters(p_path) {
		let self = this;
		return lib.deps.co(function*() {
			let api = new Router();
			let files = yield lib.deps.coFs.readdir(p_path);
			for(let file of files) {
				if(lib.node.path.extname(file) != '.js') {
					continue;
				}

				let router = require(lib.node.path.join(p_path, file));
				yield Promise.resolve(router.init(api));
			}

			self.use(api);
		});
	}

	/**
		@desc						Attach the provided static resource path to the given URI.
		@param {String} p_path		Static resources path.
	*/
	attachStatic(p_path) {
		this[SYMBOL_MEMBER_ROUTER].use(lib.deps.express.static(p_path));
	}
}


module.exports = Router;