'use strict';

var lib = {
	deps:{
		expect:require('chai').expect
	},
	odin:{
		http:{
			ExceptionHttp:require('../lib/ExceptionHttp'),
			ExceptionRest:require('../lib/ExceptionRest')
		}
	}
};

describe('ExceptionRest', function() {
	describe('#constructor()', function() {
		it('should be correctly default initialized', function() {
			var ex = new lib.odin.http.ExceptionRest(200, 'type');

			lib.deps.expect(ex).to.be.an.instanceof(lib.odin.http.ExceptionHttp);
			lib.deps.expect(ex).to.have.a.property('name', 'ExceptionRest');
			lib.deps.expect(ex).to.have.a.property('stack').that.is.a('string');
			lib.deps.expect(ex).to.have.a.property('statusCode', 200);
			lib.deps.expect(ex).to.have.a.property('type', 'type');
			lib.deps.expect(ex).to.have.a.property('message', '');
			lib.deps.expect(ex).to.have.a.property('details').that.is.an('object');
			lib.deps.expect(ex).to.have.a.property('cause');
		});

		it('should be correctly initialized', function() {
			var ex = new lib.odin.http.ExceptionRest(404, 'type', 'message', {foo:'bar'}, new Error());

			lib.deps.expect(ex).to.be.an.instanceof(lib.odin.http.ExceptionHttp);
			lib.deps.expect(ex).to.have.a.property('name', 'ExceptionRest');
			lib.deps.expect(ex).to.have.a.property('stack').that.is.a('string');
			lib.deps.expect(ex).to.have.a.property('statusCode', 404);
			lib.deps.expect(ex).to.have.a.property('type', 'type');
			lib.deps.expect(ex).to.have.a.property('message', 'message');
			lib.deps.expect(ex).to.have.a.property('details').that.deep.equal({foo:'bar'});
			lib.deps.expect(ex).to.have.a.property('cause').that.is.an.instanceof(Error);
		});
	});
});