'use strict';

var sinon = require('sinon');
var posthtml = require('posthtml');

var expect = require('chai').expect;

var shorten = require('..');

var shortener = {
  shorten: sinon.spy(function(url, cb) {
    cb(null, 'SHORTENED');
  })
};

describe('posthtml-shorten', function() {
  afterEach(function() {
    shortener.shorten.reset();
  });

  it('should throw if no shortener is provided', function() {
    expect((function() { shorten(); })).to.throw('shortener must be defined');
    expect((function() { shorten({ shortener: {} }); })).to.throw('shortener must have a shorten function');
  });

  it('should shorten the default tags and attributes', function(done) {
    posthtml()
      .use(shorten({ shortener: shortener }))
      .process('<a href="google.com">Google</a>')
      .then(function(result) {
        expect(shortener.shorten.calledOnce).to.be.true;
        expect(result.html).to.equal('<a href="SHORTENED">Google</a>');
        done();
      })
      .catch(function(err) {
        done(err);
      });
  });

  it('should shorten multiple tags and attributes', function(done) {
    posthtml()
      .use(shorten({
        shortener: shortener,
        tags: ['a', 'img', 'body'],
        attributes: ['href', 'src', 'background']
      }))
      .process('<a href="google.com">Google</a><img src="google.com"><body background="google.com"></body>')
      .then(function(result) {
        expect(shortener.shorten.calledThrice).to.be.true;
        expect(result.html).to.equal('<a href="SHORTENED">Google</a><img src="SHORTENED"><body background="SHORTENED"></body>');
        done();
      })
      .catch(function(err) {
        done(err);
      });
  });

  it('should not shorten tags when not defined', function(done) {
    posthtml()
      .use(shorten({ shortener: shortener }))
      .process('<link href="google.com">')
      .then(function(result) {
        expect(shortener.shorten.called).to.be.false;
        expect(result.html).to.equal('<link href="google.com">');
        done();
      })
      .catch(function(err) {
        done(err);
      });
  });
});
