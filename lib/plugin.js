'use strict';

var packageName = require('../package.json').name;
var debug = require('debug')(packageName);

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

  var shortener = options.shortener;
  var shorten = shortener.shorten.bind(shortener);

  return function posthtmlShorten(tree) {
    var promises = [];

    tree.walk(function(node) {
      if (node.attrs) {
        if (tags.indexOf(node.tag) > -1) {
          attributes.forEach(function(key) {
            var value = node.attrs[key];
            if (value) {
              var promise = new Promise(function(resolve, reject) {
                shorten(value, function(err, newValue) {
                  if (err) {
                    reject(err);
                  } else {
                    node.attrs[key] = newValue;
                    debug('shortened', value, newValue);
                    resolve();
                  }
                })
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
