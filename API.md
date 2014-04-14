##### Example:
```javascript
var svgUtil = require('svgutil').testSvgUtil;

/*
  data - XML SVG content
**/
var result = svgUtil( data );

/*
  result description:
  
  {
    path: string or null
    skippedTags: Array or null
    skippedAttributes: Array or null
    x: int
    y: int
    height: int
    width: int
  }
**/
```
