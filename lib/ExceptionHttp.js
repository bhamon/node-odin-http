'use strict';

let lib = {
	odin:{
		Exception:require('odin').Exception
	}
};

/**
	@class
	@classdesc							HTTP exception.
	@extends							module:odin.Exception
	@alias								module:odin/http.ExceptionHttp
*/
class ExceptionHttp extends lib.odin.Exception {
	/**
		@desc								Constructs a new HTTP Exception.
		@param {Number} p_statusCode		HTTP status code.
		@param {String} [p_message='']		Exception message.
		@param {Object} [p_details={}]		Exception details.
		@param {Error} [p_cause]			Exception cause.
	*/
	constructor(p_statusCode, p_message, p_details, p_cause) {
		super(p_message, p_details, p_cause);

		/**
			@member {Number}	module:odin/http.ExceptionHttp#statusCode
			@desc				Exception status code.
		*/
		Object.defineProperty(this, 'statusCode', {enumerable:true, writable:true, value:p_statusCode});
	}
}

module.exports = ExceptionHttp;