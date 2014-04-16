#!/usr/bin/node

var fs = require('fs');
var svgPrune = require('../svgPrune').svgPrune;

var svgFile = process.argv[2];
if (! svgFile) {
    console.log("Usage: test-util.js <somefile.svg>");
    process.exit();
}

if (! fs.existsSync(svgFile)) {
    console.log("File not found.");
    process.exit();
}

var t = fs.readFileSync(svgFile).toString();
console.log( svgPrune( t ) );

