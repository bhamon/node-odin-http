'use strict';

let lib = {
	deps:{
		joi:require('joi')
	},
	odin:{
		util:require('odin').util,
		http:{
			RightsTree:require('./RightsTree')
		}
	}
};

/**
	@class													Session
	@classdesc												Session.
	@alias													module:odin/http.Session
*/
class Session {
	/**
		@desc													Constructs a new session.
		@param {Object} p_config								Configuration set.
		@param {String} p_config.token							Token.
		@param {Date} [p_config.creationDate=ne Date()]			Creation date.
		@param {Date} [p_config.lastAccessDate=new Date()]		Last access date.
		@param {String[]} [p_config.rights=[]]					Rights list.
		@param {Object} [p_config.data={}]						Extra data.
	*/
	constructor(p_config) {
		let config = lib.odin.util.validate(p_config, {
			token:lib.deps.joi.string().required().min(1),
			creationDate:lib.deps.joi.date().optional().default(new Date()),
			lastAccessDate:lib.deps.joi.date().optional().default(new Date()),
			rights:lib.deps.joi.array().optional().default([]).items(
				lib.deps.joi.string().min(1)
			),
			data:lib.deps.joi.object().optional().default({})
		});

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
			@member {module:odin/http.RightsTree}		module:odin/http.Session#rights
			@desc										Rights tree.
		*/
		Object.defineProperty(this, 'rights', {enumerable:true, value:new lib.odin.http.RightsTree()});
		for(let right of config.rights) {
			this.rights.add(right);
		}

		/**
			@member {Object}	module:odin/http.Session#data
			@desc				Extra data.
		*/
		Object.defineProperty(this, 'data', {enumerable:true, value:config.data});
	}

	/**
		@desc							Tells whether the session has expired or not based on the given reference time and expiration interval.
										The interval is computed with the "accessDate" field.
		@param {Date} p_ref				The reference time (should be [Date.now()]).
		@param {Number} p_interval		The number of milliseconds a session can stay alive.
		@returns {Boolean}				The expiration status.
	*/
	hasExpired(p_ref, p_interval) {
		return p_ref.getTime() - this.lastAccessDate.getTime() > p_interval;
	}
}

module.exports = Session;