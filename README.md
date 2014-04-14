Use cases and messages to a user:
---
* Everything is okay

> -/-

* SVG have a tags/attributes that will be ignored.

> If image looks not as expected [convert image to compound path](https://github.com/fontello/fontello/wiki/How-to-use-custom-images#importing-svg-images) in editor.<br/>
> Ignored tags/attributes: n, n, ..

* Broken xml or no svg tag found.

> Invalid file format. <br/>

* Nothing left after skipping.

> Can't find data to import. Please [convert image to compound path](https://github.com/fontello/fontello/wiki/How-to-use-custom-images#importing-svg-images) in editor.<br/>
> Ignored tags/attributes: n, n, ..

* Joined path exists.

> Please [convert image to compound path](https://github.com/fontello/fontello/wiki/How-to-use-custom-images#importing-svg-images) in editor.<br/>
> Multiple paths exists. 

API
---
##### Example:
```javascript
var svgUtil = require('svgutil').testSvgUtil;

// data - XML SVG content
// scaleHeight - height value, default 1000
var result = svgUtil( data, scaleHeight );

```

##### result:
```javascript
{
  path: string or null // Result path d
  status: int // Status code
  height: int 
  width: int
}
```

##### Status codes description and path value:
| status | Description                             | path  |
| ------ | --------------------------------------- | ------------- |
| 0      | Broken xml or no svg tag found.         | null
| 1      | Nothing left after skipping.            | null
| 2      | SVG have a tags/attributes that will be ignored. | result path
| 3      | Joined path exists.                              | result path
| 4      | Everything is okay.                              | result path

