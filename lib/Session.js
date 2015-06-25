'use strict';

var lib = {
	deps:{
		joi:require('joi')
	},
	odin:{
		util:require('odin').util
	}
};

/**
	@class													Session
	@classdesc												Session.
	@alias													module:odin/http.Session

	@desc													Constructs a new session.
	@param {Object} p_config								Configuration set.
	@param {String} p_config.token							Token.
	@param {Date} [p_config.creationDate=ne Date()]			Creation date.
	@param {Date} [p_config.lastAccessDate=new Date()]		Last access date.
	@param {String[]} [p_config.rights=[]]					Rights list.
	@param {Object} [p_config.data={}]						Extra data.
*/
function Session(p_config) {
	var config = lib.odin.util.validate(p_config, {
		token:lib.deps.joi.string().required().min(1),
		creationDate:lib.deps.joi.date().optional().default(new Date()),
		lastAccessDate:lib.deps.joi.date().optional().default(new Date()),
		rights:lib.deps.joi.array().optional().default([]).items(
			lib.deps.joi.string().min(1)
		),
		data:lib.deps.joi.object().optional().default({})
	});

	/**
		@private
		@member {Object}	module:odin/http.Session#_rights
		@desc				Rights map.
	*/
	Object.defineProperty(this, '_rights', {enumerable:true, value:{}});

	/**
		@readonly
		@member {String}	module:odin/http.Session#token
		@desc				Unique token.
	*/
	Object.defineProperty(this, 'token', {enumerable:true, value:config.token});

	/**
		@readonly
		@member {Date}		module:odin/http.Session#creationDate
		@desc				Creation date.
	*/
	Object.defineProperty(this, 'creationDate', {enumerable:true, value:config.creationDate});

	/**
		@member {Date}		module:odin/http.Session#lastAccessDate
		@desc				Last access date.
	*/
	Object.defineProperty(this, 'lastAccessDate', {enumerable:true, writable:true, value:config.lastAccessDate});

	/**
		@member {Object}	module:odin/http.Session#data
		@desc				Extra data.
	*/
	Object.defineProperty(this, 'data', {enumerable:true, value:config.data});

	this.addRights(config.rights);
};

/**
	@desc							Tells whether the session has expired or not based on the given reference time and expiration interval.
									The interval is computed with the "accessDate" field.
	@param {Date} p_ref				The reference time (should be [Date.now()]).
	@param {Number} p_interval		The number of milliseconds a session can stay alive.
	@returns {Boolean}				The expiration status.
*/
Session.prototype.hasExpired = function(p_ref, p_interval) {
	return p_ref.getTime() - this.lastAccessDate.getTime() > p_interval;
};

/**
	@desc						Tells whether the session has the requested right or not.
	@param {String} p_right		The right to test against the session.
	@returns {Boolean}			The check result.
*/
Session.prototype.hasRight = function(p_right) {
	return p_right in this._rights;
};

/**
	@desc					Returns this session array of rights.
	@returns {String[]}		The array of rights.
*/
Session.prototype.getRights = function() {
	return Object.keys(this._rights);
};

/**
	@desc						Adds the given right to the session.
	@param {String} p_right		The right to add.
*/
Session.prototype.addRight = function(p_right) {
	this.addRights([p_right]);
};

/**
	@desc							Adds the given rights array to the session.
	@param {String[]} p_rights		An array of rights to add.
*/
Session.prototype.addRights = function(p_rights) {
	var self = this;
	p_rights.forEach(function(p_right) {
		self._rights[p_right] = true;
	});
};

/**
	@desc						Removes the given right from the session.
	@param {String} p_right		The right to remove.
*/
Session.prototype.removeRight = function(p_right) {
	this.removeRights([p_right]);
};

/**
	@desc							Removes the given rights from the session.
	@param {String[]} p_rights		An array of rights to remove.
*/
Session.prototype.removeRights = function(p_rights) {
	var self = this;
	p_rights.forEach(function(p_right) {
		delete self._rigths[p_right];
	});
};

module.exports = Session;