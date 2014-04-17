SVG Prune
--
Simple JavaScript library to simplify [SVG](http://en.wikipedia.org/wiki/SVG) files.

Dependencies
---
```
npm install svgpath
npm install lodash
npm install xmldom
```
Example
---
```javascript
var svgPrune = require('svgprune').svgPrune;

/*
  svgData - XML SVG text content
  
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

var result = svgPrune(svgData);
```
Testing
---

####How to test from console, example:
  test/runtest.sh test/svg/testpic1.svg ../result.svg

