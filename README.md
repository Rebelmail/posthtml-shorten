# posthtml-shorten

[![Build Status](https://travis-ci.org/Rebelmail/posthtml-shorten.svg?branch=master)](https://travis-ci.org/Rebelmail/posthtml-shorten)
[![Coverage Status](https://coveralls.io/repos/github/Rebelmail/posthtml-shorten/badge.svg?branch=master)](https://coveralls.io/github/Rebelmail/posthtml-shorten?branch=master)

A [PostHTML][1] plugin to shorten URLs in HTML elements.

## Usage

```js
var posthtml = require('posthtml');
var shorten = require('posthtml-shorten');

var shortener = {
  shorten: function(url, callback) {
    callback(null, url.replace('goog', 'gog'));
  }
};

var options = {
  shortener: shortener, // Must contain a `shorten` function
  tag: ['a', 'img', 'body'] // Allowed tags for URL shortening
  attribute: ['href', 'src'], // Attributes to replace on the elements
};

posthtml()
  .use(shorten(options))
  .process('<a href="google.com">Google</a>')
  .then(function(result) {
    console.log(result.html); //=> '<a href="gogle.com">Google</a>'
  });
```

[1]: https://github.com/posthtml/posthtml
