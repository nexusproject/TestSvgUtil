##### Example:
```javascript
var svgUtil = require('svgutil').testSvgUtil;

/*
  data - XML SVG content
**/
var result = svgUtil( data );

/*
  If data was parsed succesfuely - returns result object, otherwise null
  result description:
  
  {
    path: string or null
    joinedPath: boolean
    skippedTags: Array or null
    skippedAttributes: Array or null
    svgAttributes: {
      viewBox: { viewbox values
        minX: int,
        minY: int,
        width: int,
        height: int
      },
      x: int
      y: int
      height: int
      width: int
    }  
  }
**/
```
