'use strict';

var sinon = require('sinon');
var posthtml = require('posthtml');

var expect = require('chai').expect;

var shorten = require('..');

var shortener = {
  process: sinon.spy(function(url) {
    expect(url).to.exist;
    return Promise.resolve('SHORTENED');
  })
};

describe('posthtml-shorten', function() {
  afterEach(function() {
    shortener.process.reset();
  });

  it('should throw if no shortener is provided', function() {
    expect((function() { shorten(); })).to.throw('shortener must be defined');
    expect((function() { shorten({ shortener: {} }); })).to.throw('shortener must have a process function');
  });

  it('should shorten the default tags and attributes', function(done) {
    posthtml()
      .use(shorten({ shortener: shortener }))
      .process('<a href="google.com">Google</a>')
      .then(function(result) {
        expect(shortener.process.calledOnce).to.be.true;
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
        expect(shortener.process.calledThrice).to.be.true;
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
        expect(shortener.process.called).to.be.false;
        expect(result.html).to.equal('<link href="google.com">');
        done();
      })
      .catch(function(err) {
        done(err);
      });
  });

  it('should surface rejeted promises', function(done) {
    var rejectingShortener = {
      process: sinon.spy(function() {
        return Promise.reject(new Error());
      })
    };

    posthtml()
      .use(shorten({ shortener: rejectingShortener }))
      .process('<a href="google.com">Google</a>')
      .catch(function(err) {
        expect(err).to.exist;
        done();
      });
  });
});
