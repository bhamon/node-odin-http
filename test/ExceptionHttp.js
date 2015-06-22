'use strict';

var lib = {
	deps:{
		should:require('should')
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

			ex.should.be.instanceof(lib.odin.Exception);
			ex.should.have.an.enumerable('name').String.which.equal('ExceptionHttp');
			ex.should.have.an.enumerable('stack').String.which.is.not.empty;
			ex.should.have.an.enumerable('statusCode').Number.which.equal(200);
			ex.should.have.an.enumerable('message').String.which.equal('');
			ex.should.have.an.enumerable('details').Object;
			ex.should.have.an.enumerable('cause');
		});

		it('should be correctly initialized', function() {
			var ex = new lib.odin.http.ExceptionHttp(200, 'message', {foo:'bar'}, new Error());

			ex.should.be.instanceof(lib.odin.Exception);
			ex.should.have.an.enumerable('name').String.which.equal('ExceptionHttp');
			ex.should.have.an.enumerable('stack').String.which.is.not.empty;
			ex.should.have.an.enumerable('statusCode').Number.which.equal(200);
			ex.should.have.an.enumerable('message').String.which.equal('message');
			ex.should.have.an.enumerable('details').which.eql({foo:'bar'});
			ex.should.have.an.enumerable('cause').which.is.instanceof(Error);
		});
	});
});