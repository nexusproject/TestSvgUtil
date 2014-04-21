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

var disallowedSvgAttributes = ['fill', 'stroke', 'stroke-width', 'style', 'linearGradient', 'radialGradient'];

/*
  Recursive exploring XML DOM tree & translate to path sequence 
**/
function translateToPath(targetNode) {
  var path = '';
  var skippedAttributes = [];
  var skippedTags = [];

  var explorer = function(target, stack) {
    for (var node = target.firstChild; node; node = node.nextSibling) {
      var transformStack;
      if (! node.data) {
        transformStack = node.hasAttribute('transform') ? stack.concat(node.getAttribute('transform')) : stack;

        /* Tags processing */
        var p;
        switch(node.nodeName) {
          case 'path':
            p = node.getAttribute('d');
            break;
          case 'g':
              // nop
            break;
          default:
            skippedTags.push(node.nodeName);
        };

        if (p) {
          /* Applying transformations if any */
          transformStack.reverse().forEach(function(t) {
            p = new SvgPath(p).transform(t).toString();
            console.log(path);
          });

          path = path.concat(p);

          /* Looking for disallowed attributes */
          var skipAttrs = _.intersection(disallowedSvgAttributes, 
            _.map( node.attributes, function(attr) { 
              return attr.nodeName.toLowerCase(); 
            })
          );
;
          if (skipAttrs) {
            skippedAttributes = skippedAttributes.concat(skipAttrs);
          }
        }
      }

      if (node.firstChild) {
        explorer(node, transformStack.slice(0));
      }
    }
  };

  explorer(targetNode, []);
  return { path: path, skippedAttributes: _.uniq(skippedAttributes), skippedTags: _.uniq(skippedTags) }; 
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

  try {
    xmlDoc = new XMLDOMParser({ errorHandler:{} }).parseFromString(data, 'application/xml');
  }
  catch(e) {
    return {error: 1};
  }

  var svgTag = xmlDoc.getElementsByTagName('svg')[0];

  /* Check svg */
  if (! svgTag) {
    return {error: 1};
  }

  var result = translateToPath(svgTag);

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
  /*
    TODO:
    var bounds = calculatePathBounds(result.path);
    result.height = bounds.height;
    result.width = bounds.width;
  */
  }

  result.ok = ! (result.skippedTags.length || result.skippedAttributes.length); 
  return result;
};

module.exports.svgFontify = svgFontify;
