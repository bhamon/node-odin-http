'use strict';

var lib = {
	deps:{
		expect:require('chai').expect
	},
	odin:{
		Exception:require('odin').Exception,
		http:{
			ExceptionHttp:require('../lib/ExceptionHttp')
		}
	}
};

describe('ExceptionHttp', function() {
	describe('#constructor()', function() {
		it('should be correctly default initialized', function() {
			var ex = new lib.odin.http.ExceptionHttp(200);

			lib.deps.expect(ex).to.be.an.instanceof(lib.odin.Exception);
			lib.deps.expect(ex).to.have.a.property('name', 'ExceptionHttp');
			lib.deps.expect(ex).to.have.a.property('stack').that.is.a('string');
			lib.deps.expect(ex).to.have.a.property('statusCode', 200);
			lib.deps.expect(ex).to.have.a.property('message', '');
			lib.deps.expect(ex).to.have.a.property('details').that.is.an('object');
			lib.deps.expect(ex).to.have.a.property('cause');
		});

		it('should be correctly initialized', function() {
			var ex = new lib.odin.http.ExceptionHttp(404, 'message', {foo:'bar'}, new Error());

			lib.deps.expect(ex).to.be.an.instanceof(lib.odin.Exception);
			lib.deps.expect(ex).to.have.an.property('name', 'ExceptionHttp');
			lib.deps.expect(ex).to.have.an.property('stack').that.is.a('string');
			lib.deps.expect(ex).to.have.an.property('statusCode', 404);
			lib.deps.expect(ex).to.have.an.property('message', 'message');
			lib.deps.expect(ex).to.have.an.property('details').that.deep.equal({foo:'bar'});
			lib.deps.expect(ex).to.have.an.property('cause').that.is.an.instanceof(Error);
		});
	});
});