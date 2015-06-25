'use strict';

var lib = {
	node:{
		crypto:require('crypto')
	},
	deps:{
		q:require('q'),
		joi:require('joi')
	},
	odin:{
		util:require('odin').util,
		http:{
			Session:require('./Session')
		}
	}
};

/**
	@class
	@classdesc									Session store.
	@alias										module:odin/http.SessionStore

	@desc										Constructs a new session store.
	@param {Object} p_config					Configuration set.
	@param {Number} [p_cionfig.tokenSize=16]	Session token size (used at session creation time).
*/
function SessionStore(p_config) {
	var args = lib.odin.util.validate(p_config, lib.deps.joi.object().required().keys({
		tokenSize:lib.deps.joi.number().optional().default(16).integer().min(8)
	}));

	/**
		@private
		@member {Object}	module:odin/http.SessionStore#_map
		@desc				Sessions map indexed by token.
	*/
	Object.defineProperty(this, '_map', {writable:true, value:{}});

	/**
		@readonly
		@member {Number}	module:odin/http.SessionStore#tokenSize
		@desc				Session token size (used at session creation time).
	*/
	Object.defineProperty(this, 'tokenSize', {enumerable:true, value:p_config.tokenSize});
};

/**
	@private
	@desc		Creates an unique token.
	@returns	{Promise.<String>} A promise for an unique token.
*/
SessionStore.prototype._createUniqueToken = function() {
	var self = this;
	return lib.deps.q.nfcall(lib.node.crypto.randomBytes, this.tokenSize)
	.then(function(p_bytes) {
		var token = p_bytes.toString('hex');
		if(token in self._map) {
			return self._createUniqueToken();
		}

		return token;
	});
};

/**
	@desc											Creates a new session in the store.
	@returns {Promise.<module:odin/http.Session>}	A promise for the newly created session.
*/
SessionStore.prototype.create = function() {
	var self = this;
	return this._createUniqueToken(self.tokenSize, self._map)
	.then(function(p_token) {
		var session = new lib.odin.http.Session({
			token:p_token,
			creationDate:new Date(),
			lastAccessDate:new Date(),
			rights:[],
			data:{}
		});

		self._map[session.token] = session;

		return session;
	});
};

/**
	@desc				Retrieves a validator to check tokens against.
	@returns {joi}		A new token validator.
*/
SessionStore.prototype.getTokenValidator = function() {
	return lib.deps.joi.string().length(this.tokenSize * 2).regex(/^[a-f0-9]+$/);
};

/**
	@desc									Returns the paginated list of sessions inside the store.
	@param {Number} p_page					Page number (starts at 0).
	@param {Number} p_size					Page size.
	@returns {module:odin/http.Session[]}	An array of sessions.
*/
SessionStore.prototype.getPaginatedList = function(p_page, p_size) {
	var self = this;
	return Object.keys(this._map)
	.slice(p_page * p_size, (p_page + 1) * p_size)
	.map(function(p_token) {
		return self._map[p_token];
	});
};

/**
	@desc										Returns the session in the store with the specified token.
	@param {String} p_token						Session token.
	@returns {(module:odin/http.Session|null)}	The requested session, or null if not found.
*/
SessionStore.prototype.get = function(p_token) {
	return this._map[p_token] || null;
};

/**
	@desc								Removes the expired session from the store based on the given expiration interval.
										The interval is computed with the "accessDate" field.
	@param {Number} p_expireAfter		The number of milliseconds a session can stay alive.
*/
SessionStore.prototype.removeExpiredSessions = function(p_expireAfter) {
	var self = this;
	var now = new Date();
	Object.keys(self._map).forEach(function(p_token) {
		var session = self._map[p_token];
		if(session.hasExpired(now, p_expireAfter)) {
			delete self._map[session.token];
		}
	});
};

/**
	@desc						Removes the session with the given tken from the store.
	@param {String} p_token		Session token.
*/
SessionStore.prototype.remove = function(p_token) {
	delete this._map[p_token];
};

module.exports = SessionStore;