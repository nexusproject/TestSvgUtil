/*
    svgPrune

**/

var _       = require('lodash');
var XMLDOMParser = require('xmldom').DOMParser;
var SvgPath = require('svgpath');

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
var svgPrune = function(data) {
    var xmlDoc;

    /* the result */
    var result = {
        error: 0,
        path: new String(),
        ok: false,
        skippedTags: new Array(),
        skippedAttributes: new Array(),
        x: 0,
        y: 0,
        height: 0,
        width: 0
    };

    try {
        xmlDoc = new XMLDOMParser({ errorHandler:{} }).parseFromString(data, 'application/xml');
    }
    catch(e) {
        result.error = 1;
        return result;
    }

    var svgTag = xmlDoc.getElementsByTagName('svg')[0];

    /* Check svg */
    if (! svgTag) {
        result.error = 1;
        return result;
    }

    /* Recursive collect all tags */
    var tags = new Array();
    (function(targetNode) {
        for (var node = targetNode.firstChild; node; node = node.nextSibling) {
            if (! node.data) {
                tags.push(node.nodeName);
            }

            if (node.firstChild) {
                arguments.callee(node);
            }
        }
    })(svgTag);

    result.skippedTags = _.without(tags, 'g', 'path');
    var pathTags = xmlDoc.getElementsByTagName('path');
    var resultPath = new String();

    /* Going over all paths and applying all group transformations */
    for (var i=0; i<pathTags.length; i++) {
        var node = pathTags.item(i);
        var path = node.getAttribute('d');
        var pathAttrsSkip = _.without(_.map(node.attributes, function(attr) { return attr.nodeName }), 'transform', 'd');
        result.skippedAttributes = _.union(result.skippedAttributes, pathAttrsSkip);

        /* Applying path transform if any */
        var pathTransform = node.getAttribute('transform');
        if (pathTransform) {
            path = new SvgPath(path).transform(pathTransform).toString();
        }

        for (var group = node.parentNode; group.nodeName == 'g'; group = group.parentNode) {
            var groupAttrsSkip = _.without(_.map(group.attributes, function(attr) { return attr.nodeName }), 'transform');
            result.skippedAttributes = _.union(result.skippedAttributes, groupAttrsSkip);

            /* Applyin group transformation if any */
            var groupTransform = group.getAttribute('transform');
            if (groupTransform) {
                path = new SvgPath(path)
                    .transform(groupTransform)
                    .toString();
            }
        }

        result.path = result.path.concat(path); 
    }

    /* Calculating x,y,height,width */
    var viewBox;
    var svgAttrs = {};
    var viewBoxAttr = svgTag.getAttribute('viewBox');
    if (viewBoxAttr) {
        viewBox = _.map(viewBoxAttr.split(' '), 
            function(val) { return parseInt(val, 10); }
        );
    } 

    _.forEach(['x', 'y', 'width', 'height'], function(key) {
        svgAttrs[key] = parseInt(svgTag.getAttribute(key), 10);
    });

    if (viewBox) {
        result.x = viewBox[0];
        result.y = viewBox[1];
        result.height = viewBox[2];
        result.width = viewBox[3];
    }
    else if (svgAttrs.height && svgAttrs.width) {
        result.height = svgAttrs.height;
        result.width = svgAttrs.width;
    }
    else {
        /* Detrmining height & width from path */
        new SvgPath(result.path).iterate(function(segment) {
            var command = segment[0];
            if (! _.contains(['V', 'A'], command)) {
                segment.forEach(function(val, i) {
                    if (!i) { return; } // skip command
                    if (i % 2) {
                        result.width = result.width<val ? val : result.width;
                    } 
                    else {
                        result.height = result.height<val ? val : result.height;
                    }
                });        
            }
        });
    }

    result.ok = ! (result.skippedTags.length || result.skippedAttributes.length); 
    return result;
}

module.exports.svgPrune = svgPrune;
