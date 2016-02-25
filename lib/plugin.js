'use strict';

var packageName = require('../package.json').name;
var debug = require('debug')(packageName);

module.exports = function(options) {
  options = options || {};

  if (!options.shortener) {
    throw new Error('shortener must be defined');
  }

  if (typeof options.shortener.process !== 'function') {
    throw new Error('shortener must have a process function');
  }

  var tags = options.tags || ['a'];
  var attributes = options.attributes || ['href'];

  var shorten = options.shortener.process.bind(options.shortener);

  return function posthtmlShorten(tree) {
    var promises = [];

    tree.walk(function(node) {
      if (node.attrs) {
        if (tags.indexOf(node.tag) > -1) {
          attributes.forEach(function(key) {
            var value = node.attrs[key];
            if (value) {
              var promise = shorten(value).then(function(newValue) {
                debug('%s -> %s', value, newValue);
                node.attrs[key] = newValue;
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
