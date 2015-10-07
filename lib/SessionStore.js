'use strict';

let lib = {
	node:{
		crypto:require('crypto')
	},
	deps:{
		joi:require('joi'),
		co:require('co')
	},
	odin:{
		util:require('odin').util,
		http:{
			Session:require('./Session')
		}
	}
};

let SYMBOL_MEMBER_MAP = Symbol('map');
let SYMBOL_METHOD_CREATE_UNIQUE_TOKEN = Symbol('createUniqueToken');

/**
	@class
	@classdesc									Session store.
	@alias										module:odin/http.SessionStore
*/
class SessionStore {
	/**
		@desc										Constructs a new session store.
		@param {Object} p_config					Configuration set.
		@param {Number} [p_cionfig.tokenSize=16]	Session token size (used at session creation time).
	*/
	constructor(p_config) {
		let args = lib.odin.util.validate(p_config, lib.deps.joi.object().required().keys({
			tokenSize:lib.deps.joi.number().optional().default(16).integer().min(8)
		}));

		/**
			@private
			@member {Map.<String, Object>}		module:odin/http.SessionStore#[SYMBOL_MEMBER_MAP]
			@desc								Sessions map indexed by token.
		*/
		Object.defineProperty(this, SYMBOL_MEMBER_MAP, {writable:true, value:new Map()});

		/**
			@readonly
			@member {Number}	module:odin/http.SessionStore#tokenSize
			@desc				Session token size (used at session creation time).
		*/
		Object.defineProperty(this, 'tokenSize', {enumerable:true, value:p_config.tokenSize});
	}

	/**
		@private
		@desc							Creates an unique token.
		@returns {Promise.<String>}		A promise for an unique token.
	*/
	[SYMBOL_METHOD_CREATE_UNIQUE_TOKEN]() {
		let self = this;
		return lib.deps.co(function*() {
			let bytes = yield lib.odin.util.promise.nfcall(lib.node.crypto.randomBytes, self.tokenSize);
			let token = bytes.toString('hex');
			if(self[SYMBOL_MEMBER_MAP].has(token)) {
				return self[SYMBOL_METHOD_CREATE_UNIQUE_TOKEN]();
			}

			return token;
		});
	}

	/**
		@desc											Creates a new session in the store.
		@returns {Promise.<module:odin/http.Session>}	A promise for the newly created session.
	*/
	create() {
		let self = this;
		return lib.deps.co(function*() {
			let token;
			do {
				token = yield self[SYMBOL_METHOD_CREATE_UNIQUE_TOKEN](self.tokenSize, self[SYMBOL_MEMBER_MAP]);
			} while(self[SYMBOL_MEMBER_MAP].has(token));

			let session = new lib.odin.http.Session({
				token:token,
				creationDate:new Date(),
				lastAccessDate:new Date(),
				rights:[],
				data:{}
			});

			self[SYMBOL_MEMBER_MAP].set(session.token, session);

			return session;
		});
	}

	/**
		@desc				Retrieves a validator to check tokens against.
		@returns {joi}		A new token validator.
	*/
	getTokenValidator() {
		return lib.deps.joi.string().length(this.tokenSize * 2).regex(/^[a-f0-9]+$/);
	}

	/**
		@desc									Returns the paginated list of sessions inside the store.
		@param {Number} p_page					Page number (starts at 0).
		@param {Number} p_size					Page size.
		@returns {module:odin/http.Session[]}	An array of sessions.
	*/
	getPaginatedList(p_page, p_size) {
		return Array.from(this[SYMBOL_MEMBER_MAP].values())
		.slice(p_page * p_size, (p_page + 1) * p_size);
	}

	/**
		@desc										Returns the session in the store with the specified token.
		@param {String} p_token						Session token.
		@returns {(module:odin/http.Session|null)}	The requested session, or null if not found.
	*/
	get(p_token) {
		return this[SYMBOL_MEMBER_MAP].get(p_token) || null;
	}

	/**
		@desc								Removes the expired session from the store based on the given expiration interval.
											The interval is computed with the "accessDate" field.
		@param {Number} p_expireAfter		The number of milliseconds a session can stay alive.
	*/
	removeExpiredSessions(p_expireAfter) {
		let self = this;
		let now = new Date();
		Array.from(this[SYMBOL_MEMBER_MAP].values())
		.filter(function(p_session) {
			return p_session.hasExpired(nom, p_expireAfter);
		})
		.forEach(function(p_session) {
			self[SYMBOL_MEMBER_MAP].delete(p_session.token);
		});
	}

	/**
		@desc						Removes the session with the given tken from the store.
		@param {String} p_token		Session token.
	*/
	remove(p_token) {
		this[SYMBOL_MEMBER_MAP].delete(p_token);
	}
}

module.exports = SessionStore;