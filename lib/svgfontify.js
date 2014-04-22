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

/*
  Tags that can be safely skipped
**/
var safeNodes = _.transform([
  'desc',
  'metadata',
  'title', 
/*  
  TODO: tags below need to be checked
**/
  'altGlyphDef',
  'cursor',
  'filter',
  'switch'
], function(result, key) { result[key]=true; });

/* 
  List of inappropriated attributes that cannot be used
*/
var disallowedSvgAttributes = _.transform([
  'requiredFeatures', 
  'requiredExtensions',
  'systemLanguage',
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
/*
  TODO: i'm not sure about these tags
  'glyph-orientation-horizontal',
  'glyph-orientation-vertical'
*/
], function(result, key) { result[key]=true; });


/*
  Recursive exploring XML DOM tree & translate to path sequence 
**/
function translateToPath(targetNode) {
  var path = '';
  var skippedAttributes = {};
  var skippedTags = {};

  var explore = function(target, transform) {
    var p; 
    for (var node = target.firstChild; node; node = node.nextSibling) {
      if (node.data || safeNodes[node.nodeName]) {
        /* Safe skip */
        continue;
      }

      if (node.hasAttribute('transform')) {
        transform = node.getAttribute('transform') + ' ' + transform;
      }

      p=null;
      switch(node.nodeName) {
        case 'path':
          p = node.getAttribute('d');
          break;
        /* 
          TODO: Here may be implemented the code for translation other tags
        **/
      };

      if (p) {
        if (transform) {
          p = new SvgPath(p).transform(transform).toString();
        }

        path += p;
      } 

      /* Looking for disallowed attributes & tags */
      if (p || _.contains(['g', 'defs'], node.nodeName)) {
        for (var i=0; i<node.attributes.length; i++) {
          if (disallowedSvgAttributes[node.attributes[i].name]) {
            skippedAttributes[node.attributes[i].name] = true;  
          }
        }
      }
      else {
        skippedTags[node.nodeName] = true;
      }

      if (node.firstChild) {
        explore(node, transform);
      }
    }
  };

  explore(targetNode, '');
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
