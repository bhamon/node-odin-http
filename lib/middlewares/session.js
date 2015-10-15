'use strict';

/**
	@module		odin/http/middlewares/session
	@desc		Session setup middleware.
*/

let lib = {
	odin:{
		util:require('odin').util,
		http:{
			ExceptionRest:require('../ExceptionRest')
		}
	}
};

/**
	@desc														Initializes the session based on the authorization token.
	@param {http.Request} p_request								HTTP request.
	@param {module:odin/http.SessionStore} p_sessionStore		Session store.
	@throws {module:odin/http.ExceptionRest}					[401 :: auth.missingToken] If there is no parsed auth info (requires the {@link module:odin/http/middlewares/authParser} middleware).
	@throws {module:odin/http.ExceptionRest}					[409 :: auth.validation] If the auth type isn't [Bearer].
	@throws {module:odin/http.ExceptionRest}					[409 :: auth.validation] If the token is malformed (requires the {@link module:odin/http/middlewares/validators} middleware).
	@throws {module:odin/http.ExceptionRest}					[403 :: auth.forbidden] If there is no matching session for the provided token.
	@see														module:odin/http/middlewares/authParser
*/
function initSession(p_request, p_sessionStore) {
	if(!p_request.auth) {
		throw new lib.odin.http.ExceptionRest(401, 'auth.missingToken', 'Missing authorization header');
	} else if(p_request.auth.type != 'bearer') {
		throw new lib.odin.http.ExceptionRest(409, 'auth.validation', 'Invalid authorization type');
	}

	lib.odin.util.validate(p_request.auth.token, p_sessionStore.getTokenValidator().required());

	p_request.session = p_sessionStore.get(p_request.auth.token);
	if(!p_request.session) {
		throw new lib.odin.http.ExceptionRest(403, 'auth.forbidden', 'Forbidden');
	}

	p_request.session.lastAccessDate = new Date();
}

/**
	@desc										Checks the provided right against the request session.
												Requires an initialized session ({@link module:odin/http/middlewares/session~initSession} call).
	@param {http.Request} p_request				HTTP request.
	@param {String} p_right						Right to check against the request session.
	@throws {module:odin/http.ExceptionRest}	[409 :: auth.missingSession] If the session has not been initialized.
	@throws {module:odin/http.ExceptionRest}	[403 :: auth.insufficientRights] If the provided right isn't present in the request session.
*/
function checkSessionRight(p_request, p_right) {
	if(!p_request.session) {
		throw new lib.odin.http.ExceptionRest(409, 'auth.missingSession', 'Missing session');
	} else if(!p_request.session.rights.has(p_right)) {
		throw new lib.odin.http.ExceptionRest(403, 'auth.insufficientRights', 'Insufficient rights');
	}
}

/**
	@desc									Adds helper functions to the HTTP request object to handle session parsing and rights management.
	@param {http.Request} p_request			HTTP request.
	@param {http.Response} p_response		HTTP response.
	@param {Function} p_next				Chaining callback.
*/
module.exports = function(p_request, p_response, p_next) {
	p_request.initSession = initSession.bind(null, p_request);
	p_request.checkSessionRight = checkSessionRight.bind(null, p_request);

	return p_next();
};