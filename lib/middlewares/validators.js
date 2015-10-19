'use strict';

/**
	@module		odin/http/middlewares/validators
	@desc		Validators middleware.
*/

let lib = {
	deps:{
		joi:require('joi')
	},
	odin:{
		util:require('odin').util
	}
};

/**
	@desc										Performs a partial validation of the request properties against the provided schema.
												Overrides the validated fields in the request object with the validated values.
	@param {http.Request} p_request				HTTP request.
	@param {joi} p_schema						Joi validation schema.
	@throws {module:odin/http.ExceptionRest}	If the validation fails.
*/
function validate(p_request, p_schema) {
	let schema = lib.odin.util.validate(p_schema, lib.deps.joi.object().required().keys({
		headers:lib.deps.joi.object().optional(),
		params:lib.deps.joi.object().optional(),
		query:lib.deps.joi.object().optional(),
		body:lib.deps.joi.object().optional()
	}));

	let data = lib.odin.util.validate(p_request, schema, {
		abortEarly:false,
		allowUnknown:true
	});

	for(let category of ['headers', 'params', 'query', 'body']) {
		for(let key in data[category]) {
			p_request[category][key] = data[category][key];
		}
	}
}

/**
	@desc										Performs a validation of the request properties against the pagination schema:
													- page: Page number. An integer starting at 0.
													- size: Page size. An integer between p_minSize and p_maxSize.
	@param {http.Request} p_request				HTTP request.
	@param {Number} [p_minSize=10]				Minimum allowed page size.
	@param {Number} [p_maxSize=50]				Maximum allowed page size.
	@throws {module:odin.Exception}				If the provided page size boundaries are invalid.
	@throws {module:odin/http.ExceptionRest}	If the validation fails.
*/
function validatePagination(p_request, p_minSize, p_maxSize) {
	let args = lib.odin.util.validate({
		minSize:p_minSize,
		maxSize:p_maxSize
	}, {
		minSize:lib.deps.joi.number().optional().default(10).integer().positive(),
		maxSize:lib.deps.joi.number().optional().default(50).integer().positive()
	});

	p_request.validate({
		query:{
			page:lib.deps.joi.number().optional().default(0).integer().min(0),
			size:lib.deps.joi.number().optional().default(args.minSize).min(args.minSize).max(args.maxSize)
		}
	});
}

/**
	@desc									Adds helper functions to the HTTP request object to handle validation.
	@param {http.Request} p_request			HTTP request.
	@param {http.Response} p_response		HTTP response.
	@param {Function} p_next				Chaining callback.
*/
module.exports = function(p_request, p_response, p_next) {
	p_request.validate = validate.bind(null, p_request);
	p_request.validatePagination = validatePagination.bind(null, p_request);

	return p_next();
};