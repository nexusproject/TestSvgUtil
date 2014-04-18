/**
 * svgPrune
 * Simple JavaScript library to simplify SVG files.
 *
 * Copyright (c) 2013 Dmitry Sergeev <realnexusway@gmail.com>
 *
 * Licensed under MIT license. See LICENSE.
 */

'use strict';

var _       = require('lodash');
var XMLDOMParser = require('xmldom').DOMParser;
var SvgPath = require('svgpath');

var disallowedSvgAttributes = ['fill', 'stroke', 'stroke-width'];

var translator = {
  path: function(node) {
    return node.getAttribute('d');
  },
  rect: null,
  line: null,
  arc: null,
  text: null,
  image: null
};

function getDisallowedAttributes(node) {
  return _.intersection(disallowedSvgAttributes, _.map( node.attributes, function(attr) { return attr.nodeName.toLowerCase(); }));
}

/*
  Recursive exploring XML DOM tree 
**/
function nodeExplorer(targetNode, callback) {
  var explorer = function(target, stack) {
    for (var node = target.firstChild; node; node = node.nextSibling) {
      var transformStack;
      if (! node.data) {
        transformStack = node.hasAttribute('transform') ? stack.concat(node.getAttribute('transform')) : stack;
        callback(node, transformStack);
      }

      if (node.firstChild) {
        explorer(node, transformStack.slice(0));
      }
    }
  };

  explorer(targetNode, []);
}

/*
  Determining height & width from path
**/
function calculatePathBounds(path) { 
  var bounds = {
    height: 0,
    width: 0
  };

  new SvgPath(path).iterate(function(segment) {
    var command = segment[0];
    if (! _.contains(['V', 'A'], command)) {
      segment.forEach(function(val, i) {
        if (!i) { return; } // skip command
        if (i % 2) {
          bounds.width = bounds.width<val ? val : bounds.width;
        }
        else {
          bounds.height = bounds.height<val ? val : bounds.height;
        }
      });
    }
  });

  return bounds;
}

/*
  data - XML SVG text content

  result structure:
  ---
  error: Number
  path: String
  ok: Boolean
  skippedTags: Array
  skippedAttributes: Array
  x: Number
  y: Number
  height: Number
  width: Number
**/
var svgFontify = function(data) {
  var xmlDoc;

  /* the result */
  var result = {
    error: 0,
    path: '',
    ok: false,
    skippedTags: [],
    skippedAttributes: [],
    x: 0,
    y: 0,
    height: 0,
    width: 0
  };

  try {
    xmlDoc = new XMLDOMParser({ errorHandler:{} }).parseFromString(data, 'application/xml');
  }
  catch(e) {
    result.error = 1;
  }

  var svgTag = xmlDoc.getElementsByTagName('svg')[0];

  /* Check svg */
  if (! svgTag) {
    result.error = 1;
  }

  if (result.error) {
    return result;
  }

  nodeExplorer(svgTag, function(node, transform) {
    var tag = node.nodeName;
    if (_.has(translator, tag)) {
      if (_.isFunction(translator[tag])) {
        var p = translator[tag](node);

        /* Applying transformations if any */
        transform.reverse().forEach(function(t) {
          p = new SvgPath(p).transform(t).toString();
        });                

        result.path = result.path.concat(p);
  
        var skipAttrs = getDisallowedAttributes(node);
        if (skipAttrs) {
          result.skippedAttributes.concat(skipAttrs);
        }
      }
      else {
        result.skippedTags.push(tag);
      }
    }
  });

  /* Calculating x,y,height,width */
  var viewBox;
  var svgAttrs = {};
  var viewBoxAttr = svgTag.getAttribute('viewBox');
  if (viewBoxAttr) {
    viewBox = _.map(viewBoxAttr.split(' '), 
      function(val) { return parseInt(val, 10); }
    );
  } 

  _.forEach(['x', 'y', 'width', 'height'], function(key) {
    svgAttrs[key] = parseInt(svgTag.getAttribute(key), 10);
  });

  if (viewBox) {
    result.x = viewBox[0];
    result.y = viewBox[1];
    result.height = viewBox[2];
    result.width = viewBox[3];
  }
  else if (svgAttrs.height && svgAttrs.width) {
    result.height = svgAttrs.height;
    result.width = svgAttrs.width;
  }
  else {
    var bounds = calculatePathBounds(result.path);
    result.height = bounds.height;
    result.width = bounds.width;
  }

  result.ok = ! (result.skippedTags.length || result.skippedAttributes.length); 
  return result;
};

module.exports.svgFontify = svgFontify;
