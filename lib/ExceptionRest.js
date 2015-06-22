'use strict';

var lib = {
	node:{
		util:require('util')
	},
	odin:{
		http:{
			ExceptionHttp:require('./ExceptionHttp')
		}
	}
};

/**
	@class
	@classdesc							REST exception.
	@extends							module:odin/http.ExceptionHttp
	@alias								module:odin/http.ExceptionRest

	@desc								Constructs a new REST Exception.
	@param {Number} p_statusCode		HTTP status code.
	@param {String} p_type				REST message type.
	@param {String} [p_message='']		Exception message.
	@param {Object} [p_details={}]		Exception details.
	@param {Error} [p_cause]			Exception cause.
*/
function ExceptionRest(p_statusCode, p_type, p_message, p_details, p_cause) {
	lib.odin.http.ExceptionHttp.call(this, p_statusCode, p_message, p_details, p_cause);

	/**
		@member {String}	module:odin/http.ExceptionHttp#type
		@desc				Exception type.
	*/
	Object.defineProperty(this, 'type', {enumerable:true, writable:true, value:p_type});
};

lib.node.util.inherits(ExceptionRest, lib.odin.http.ExceptionHttp);

module.exports = ExceptionRest;