#!/usr/bin/node
/**
 * svgPrune console test
 *
 * Copyright (c) 2013 Dmitry Sergeev <realnexusway@gmail.com>
 *
 * Licensed under MIT license. See LICENSE.
 */

var fs = require('fs');
var svgPrune = require('svgprune').svgPrune;

var svgFile = process.argv[2];
var svgOutFile = process.argv[3];

if (! svgFile) {
  console.log("Usage: test-util.js <in.svg> <out.svg>");
  process.exit();
}

if (! fs.existsSync(svgFile)) {
  console.log("File not found.");
  process.exit();
}

var t = fs.readFileSync(svgFile).toString();
var res = svgPrune(t);

console.log(res);

if (svgOutFile) {
  var svgdata = '<?xml version="1.0" standalone="no"?>\n<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" ';
  svgdata += '"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n';
  svgdata += '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" ';
  svgdata += 'height="'+res.height+'" ' + 'width="' + res.width + '">\n';
  svgdata += '<path d="'+res.path+'" />\n'
  svgdata += '</svg>'

  fs.writeFileSync(svgOutFile, svgdata)
}

