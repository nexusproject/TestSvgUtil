TEST
===

Objectives
---
1. Determine a possible cases and define the messages to a user.
2. Develop the API
3. Implement the code

Use cases and messages to a user:
---
* SVG contains parameters that can not be used as a glyph description (styles, shading etc)
    
>Processing result may not exactly match the original picture.<br/>
>This file contains some parameters that can not be used to describe a glyph and will be ignored.

* SVG contains elements affecting the image but that can not be converted to path sequence

>Processing result may not exactly match the original picture.<br/>
>Glyph should be described using the tag `path`. Other tags will be converted to a sequence of `path` values or be ignored.

* SVG can not be used to describe a glyph at all (`path` and other parameters that can be converted are missing)

>This file cannot be used to describe a glyph.<br/>
>Glyph should be described using the tag `path`. Other tags will be converted to a sequence of `path` values or be ignored.

API
---
```javascript
var testSvgUtil = require('svgutil').testSvgUtil;

// xmlDoc - XMLDOMParser result object after parsing the SVG 
var result = testSvgUtil( xmlDoc );
```

##### Result description:
```javascript
{
    path: string,  // The result path values sequence (d) or null 
    nonSuitableParameters: boolean,  // true if contains parameters that can not be used (styles, shading etc) 
    nonConvertibleTags: boolean  // true if svg contains a tags that cannot be converted to the path 
}
```
    
