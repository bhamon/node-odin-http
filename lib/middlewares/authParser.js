'use strict';

/**
	@module		odin/http/middlewares/authParser
	@desc		Auth parsing middleware.
*/

/**
	@desc									Parses the HTTP "Authorization" header for the following schemes:
												- [Bearer <token>]: token-based authntication (OAuth).
												- [Basic <credentials>]: credentials-based authentication.
	@param {http.Request} p_request			HTTP request.
	@param {http.Response} p_response		HTTP response.
	@param {Function} p_next				Chaining callback.
*/
module.exports = function(p_request, p_response, p_next) {
	var auth = p_request.get('Authorization');
	if(!auth) {
		return p_next();
	}

	var parts = auth.split(' ');
	if(parts.length != 2) {
		return p_next();
	}

	switch(parts[0].toLowerCase()) {
		case 'bearer':
			p_request.auth = {
				type:'bearer',
				token:parts[1]
			};
		break;
		case 'basic':
			var credentials = new Buffer(parts[1], 'base64').toString('ascii').split(':');
			if(credentials.length != 2) {
				return p_next();
			}

			p_request.auth = {
				type:'basic',
				user:credentials[0],
				password:credentials[1]
			};
		break;
	}

	return p_next();
};