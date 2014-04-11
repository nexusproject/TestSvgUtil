Use cases and messages to a user:
---
* SVG contains parameters that can not be used as a glyph description (styles, shading etc)
    
>Processing result may not exactly match the original picture.<br/>
>This file contains some parameters that can not be used to describe a glyph and will be ignored.

* SVG contains elements that affecting the picture but can not be converted to the `path` sequence

>Processing result may not exactly match the original picture.<br/>
>Glyph should be described using the tag `path`. Other tags will be converted to a sequence of `path` values or be ignored.

* SVG can not be used to describe a glyph at all (`path` and other parameters that can be converted are missing)

>This file cannot be used to describe a glyph.<br/>
>Glyph should be described using the tag `path`. Other tags will be converted to a sequence of `path` values or be ignored.


    
