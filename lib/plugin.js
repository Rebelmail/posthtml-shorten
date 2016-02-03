'use strict';

var Promise = require('bluebird');

module.exports = function(options) {
  options = options || {};

  if (!options.shortener) {
    throw new Error('shortener must be defined');
  }

  if (typeof options.shortener.shorten !== 'function') {
    throw new Error('shortener must have a shorten function');
  }

  var tags = options.tags || ['a'];
  var attributes = options.attributes || ['href'];
  var shortenAsync = Promise.promisify(options.shortener.shorten);

  return function posthtmlShorten(tree) {
    var promises = [];

    tree.walk(function(node) {
      if (node.attrs) {
        if (tags.indexOf(node.tag) > -1) {
          attributes.forEach(function(key) {
            if (node.attrs[key]) {
              var promise = shortenAsync(node.attrs[key]).then(function(value) {
                node.attrs[key] = value;
              });

              promises.push(promise);
            }
          });
        }
      }

      return node;
    });

    return Promise.all(promises).then(function() {
      return tree;
    });
  };
};
