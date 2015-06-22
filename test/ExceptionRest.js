'use strict';

var lib = {
	deps:{
		should:require('should')
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

			ex.should.be.instanceof(lib.odin.http.ExceptionHttp);
			ex.should.have.an.enumerable('name').String.which.equal('ExceptionRest');
			ex.should.have.an.enumerable('stack').String.which.is.not.empty;
			ex.should.have.an.enumerable('statusCode').Number.which.equal(200);
			ex.should.have.an.enumerable('type').String.which.equal('type');
			ex.should.have.an.enumerable('message').String.which.equal('');
			ex.should.have.an.enumerable('details').Object;
			ex.should.have.an.enumerable('cause');
		});

		it('should be correctly initialized', function() {
			var ex = new lib.odin.http.ExceptionRest(200, 'type', 'message', {foo:'bar'}, new Error());

			ex.should.be.instanceof(lib.odin.http.ExceptionHttp);
			ex.should.have.an.enumerable('name').String.which.equal('ExceptionRest');
			ex.should.have.an.enumerable('stack').String.which.is.not.empty;
			ex.should.have.an.enumerable('statusCode').Number.which.equal(200);
			ex.should.have.an.enumerable('type').String.which.equal('type');
			ex.should.have.an.enumerable('message').String.which.equal('message');
			ex.should.have.an.enumerable('details').which.eql({foo:'bar'});
			ex.should.have.an.enumerable('cause').which.is.instanceof(Error);
		});
	});
});