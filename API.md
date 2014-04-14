```javascript
/*
  data - XML SVG text content
**/
var svgUtil = function(data) {
  /* 
    Implementation 
  */
  
  var result = {
    parsedOkay: Boolean,
    path: String,
    exactMatch: Boolean,
    skippedTags: Array,
    skippedAttributes: Array,
    x: Number,
    y: Number,
    height: Number,
    width: Number
  };

  return result;
}


```
