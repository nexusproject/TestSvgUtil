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

var safeNodes = _.zipObject([
  'desc',
  'metadata',
  'title', 
  'a',
  'altGlyphDef',
  'cursor',
  'filter',
  'switch'
]);

var disallowedSvgAttributes = _.zipObject([
  'requiredFeatures', 
  'requiredExtensions',
  'systemLanguage',
//  'id', 
//  'xml:base',
//  'xml:lang',
//  'xml:space', 
  'onfocusin', 
  'onfocusout', 
  'onactivate', 
  'onclick', 
  'onmousedown', 
  'onmouseup', 
  'onmouseover', 
  'onmousemove', 
  'onmouseout', 
  'onload', 
  'alignment-baseline', 
  'baseline-shift', 
  'clip', 
  'clip-path', 
  'clip-rule', 
  'color', 
  'color-interpolation', 
  'color-interpolation-filters', 
  'color-profile', 
  'color-rendering', 
  'cursor', 
  'direction', 
  'display', 
  'dominant-baseline', 
  'enable-background', 
  'fill', 
  'fill-opacity', 
  'fill-rule', 
  'filter', 
  'flood-color', 
  'flood-opacity', 
  'font-family', 
  'font-size', 
  'font-size-adjust', 
  'font-stretch', 
  'font-style', 
  'font-variant', 
  'font-weight', 
//  'glyph-orientation-horizontal', 
//  'glyph-orientation-vertical', 
  'image-rendering', 
  'kerning', 
  'letter-spacing', 
  'lighting-color', 
  'marker-end', 
  'marker-mid', 
  'marker-start', 
  'mask', 
  'opacity', 
  'overflow', 
  'pointer-events', 
  'shape-rendering', 
  'stop-color', 
  'stop-opacity', 
  'stroke', 
  'stroke-dasharray', 
  'stroke-dashoffset', 
  'stroke-linecap', 
  'stroke-linejoin', 
  'stroke-miterlimit', 
  'stroke-opacity', 
  'stroke-width', 
  'text-anchor', 
  'text-decoration', 
  'text-rendering', 
  'unicode-bidi', 
  'visibility', 
  'word-spacing', 
  'writing-mode'   
]);


/*
  Recursive exploring XML DOM tree & translate to path sequence 
**/
function translateToPath(targetNode) {
  var path = '';
  var skippedAttributes = {};
  var skippedTags = {};

  var explorer = function(target, transform) {
    for (var node = target.firstChild; node; node = node.nextSibling) {
      if (node.data || node.name in safeNodes) {
        /* Safe skip */
        continue;
      }

      if (node.hasAttribute('transform')) {
        transform = node.getAttribute('transform') + ' ' + transform;
      }
       
      if (node.nodeName == 'path') {
        path += transform ? new SvgPath(node.getAttribute('d')).transform(transform).toString() : node.getAttribute('d');
      }
      else if (!_.contains(['g', 'defs'], node.nodeName)) {
        skippedTags[node.nodeName] = null;
      }      
     
      /* Looking for disallowed attributes */
      for (var attr in disallowedSvgAttributes) {
        if (node.hasAttribute(attr)) {
          skippedAttributes[attr] = null;  
        }
      }

      if (node.firstChild) {
        explorer(node, transform);
      }
    }
  };

  explorer(targetNode, '');
  return { path: path, skippedAttributes: Object.keys(skippedAttributes), skippedTags: Object.keys(skippedTags) }; 
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
  if (!svgTag) {
    return {error: 1};
  }

  var result = translateToPath(svgTag);

  /* Calculating x,y,height,width */
  if (svgTag.hasAttribute('viewBox')) {
    var viewBox = _.map(svgTag.getAttribute('viewBox').split(' '), 
      function(val) { return parseInt(val, 10); }
    );
 
    result.x = viewBox[0];
    result.y = viewBox[1];
    result.height = viewBox[2];
    result.width = viewBox[3];
  }
  else {
    _.forEach(['x', 'y', 'width', 'height'], function(key) {
      result[key] = parseInt(svgTag.getAttribute(key), 10);
    });
  }

  result.ok = !(result.skippedTags.length || result.skippedAttributes.length); 
  result.error = 0;
  return result;
};

module.exports.svgFontify = svgFontify;
