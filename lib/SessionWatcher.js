'use strict';

let lib = {
	deps:{
		joi:require('joi')
	},
	odin:{
		util:require('odin').util,
		http:{
			SessionStore:require('./SessionStore')
		}
	}
};

let SYMBOL_MEMBER_TIMER = Symbol('timer');

/**
	@class
	@classdesc												Session watcher.
	@alias													module:odin/http.SessionWatcher
*/
class SessionWatcher {
	/**
		@desc													Constructs a new session watcher.
		@param {module:odin/http.SessionStore} p_store			Sessions store.
		@param {Object} p_config								Configuration set.
		@param {Number} [p_config.expireAfter=1000*3600*24]		Expiration interval.
		@param {Number} [p_config.interval=1000*60*5]			Session token size (used at session creation time).
	*/
	constructor(p_store, p_config) {
		let args = lib.odin.util.validate({
			store:p_store,
			config:p_config
		}, {
			store:lib.deps.joi.object().required().type(lib.odin.http.SessionStore),
			config:lib.deps.joi.object().required().keys({
				expireAfter:lib.deps.joi.number().optional().default(1000 * 3600 * 24).min(1),
				interval:lib.deps.joi.number().optional().default(1000 * 60 * 5).min(1)
			})
		});

		/**
			@private
			@member		module:odin/http.SessionWatcher#[SYMBOL_MEMBER_TIMER]
			@desc		Watcher timer.
		*/
		Object.defineProperty(this, SYMBOL_MEMBER_TIMER, {writable:true, value:setInterval(function() {
			let now = new Date();
			args.store.removeExpiredSessions(now, args.config.expireAfter);
		}, args.config.interval)});
	}

	/**
		@desc		Stops this watcher.
	*/
	stop() {
		clearInterval(this[SYMBOL_MEMBER_TIMER]);
	}
}

module.exports = SessionWatcher;