'use strict';

let lib = {
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
*/
class ExceptionRest extends lib.odin.http.ExceptionHttp {
	/**
		@desc								Constructs a new REST Exception.
		@param {Number} p_statusCode		HTTP status code.
		@param {String} p_type				REST message type.
		@param {String} [p_message='']		Exception message.
		@param {Object} [p_details={}]		Exception details.
		@param {Error} [p_cause]			Exception cause.
	*/
	constructor(p_statusCode, p_type, p_message, p_details, p_cause) {
		super(p_statusCode, p_message, p_details, p_cause);

		/**
			@member {String}	module:odin/http.ExceptionHttp#type
			@desc				Exception type.
		*/
		Object.defineProperty(this, 'type', {enumerable:true, writable:true, value:p_type});
	}
}

module.exports = ExceptionRest;