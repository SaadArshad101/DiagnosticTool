const assert = require('assert');
const request = require('request');
const uri = 'http://localhost:3000/api/swot/'

request.get(uri, {json: true}, (err, res, body))

describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal([1,2,3].indexOf(4), -1);
    });
  });
});