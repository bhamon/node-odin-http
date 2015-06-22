'use strict';

var lib = {
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

/**
	@class
	@classdesc												Session watcher.
	@alias													module:odin/http.SessionWatcher

	@desc													Constructs a new session watcher.
	@param {module:odin/http.SessionStore} p_store			Sessions store.
	@param {Object} p_config								Configuration set.
	@param {Number} [p_config.expireAfter=1000*3600*24]		Expiration interval.
	@param {Number} [p_config.interval=1000*60*5]			Session token size (used at session creation time).
*/
function SessionWatcher(p_store, p_config) {
	var args = lib.odin.util.validate({
		store:p_store,
		config:p_config
	}, {
		store:lib.deps.joi.object().required().type(lib.odin.http.SessionStore),
		config:lib.deps.joi.object().required().keys({
			expireAfter:lib.deps.joi.number().optional().default(1000*3600*24).min(1),
			interval:lib.deps.joi.number().optional().default(1000*60*5).min(1)
		})
	});

	/**
		@private
		@member		module:odin/http.SessionWatcher#_timer
		@desc		Watcher timer.
	*/
	Object.defineProperty(this, '_timer', {writable:true, value:setInterval(function() {
		var now = new Date();
		args.store.removeExpiredSessions(now, args.config.expireAfter);
	}, args.config.interval)});
};

/**
	@desc		Stops this watcher.
*/
SessionWatcher.prototype.stop = function() {
	clearInterval(this._timer);
};

module.exports = SessionWatcher;