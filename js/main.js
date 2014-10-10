function Polygon(id, coordinates, color, opacity, stroke, forceToBackground) {
    this.id = id;
    this.coordinates = coordinates;
    this.color = color;
    this.opacity = opacity;
    this.stroke = stroke;
    this.forceToBackground = forceToBackground || false;
}

/**
 * Generate a list of polygons - in this case from a building
 * @return {[Polygon]} Array of Polygon objects
 */

function createPolygonsFromBuilding(building) {
    var swcZ = -1 * building.width;
    var ewdX = building.length;
    var swaZ = 0;
    var ewbX = 0;
    var swaEaveY = building.swaEaveHeight;
    var swcEaveY = building.swcEaveHeight;
    var ridgeHeight = building.swaEaveHeight + building.swcEaveHeight;
    var maxDimension = building.width > building.length ? building.width : building.width;
    var swa = [
        [0, 0, 0],
        [ewdX, 0, 0],
        [ewdX, building.swaEaveHeight, 0],
        [0, building.swaEaveHeight, 0]
    ];
    var ewd = [
        [ewdX, 0, 0],
        [ewdX, 0, swcZ],
        [ewdX, swcEaveY, swcZ],
        [ewdX, ridgeHeight, swcZ / 2],
        [ewdX, swaEaveY, 0]
    ];
    var ewb = [
        [0, 0, 0],
        [0, 0, swcZ],
        [0, swcEaveY, swcZ],
        [0, ridgeHeight, swcZ / 2],
        [0, swaEaveY, 0]
    ]
    var swc = [
        [0, 0, swcZ],
        [ewdX, 0, swcZ],
        [ewdX, swaEaveY, swcZ],
        [0, swaEaveY, swcZ]
    ];
    var rpa = [
        [ewbX, swaEaveY, 0],
        [ewdX, swaEaveY, 0],
        [ewdX, ridgeHeight, swcZ / 2],
        [ewbX, ridgeHeight, swcZ / 2]
    ];
    var rpc = [
        [ewdX, swcEaveY, swcZ],
        [ewbX, swcEaveY, swcZ],
        [ewbX, ridgeHeight, swcZ / 2],
        [ewdX, ridgeHeight, swcZ / 2]
    ];

    var opacity = 1;

    return [
        new Polygon('swa', swa, randomColor(), opacity, 0),
        new Polygon('ewb', ewb, randomColor(), opacity, 0),
        new Polygon('swc', swc, randomColor(), opacity, 0),
        new Polygon('ewd', ewd, randomColor(), opacity, 0),
        new Polygon('rpa', rpa, randomColor(), opacity, 0),
        new Polygon('rpc', rpc, randomColor(), opacity, 0),
        createGround(-.5 * building.length, 1.5 * building.length, -1.5 * building.width, .5 * building.width)
    ]
}

function createGround(minX, maxX, minZ, maxZ) {
    var ground = [
        [minX, 0, minZ],
        [maxX, 0, minZ],
        [maxX, 0, maxZ],
        [minX, 0, maxZ]
    ];
    return new Polygon('ground', ground, randomColor(), 1, 0, true);
}

/**
 * Return a random RGB color
 * @return {[Number]} an RGB array e.g. [200, 30, 47] => [R, G, B]
 */

function randomColor() {
    var color = [];
    for (var j = 0; j < 3; j++) {
        color[j] = Math.floor(Math.random() * 255);
    }
    return color;
}

/**
 * Modifies an RGB array to be a randome grayscale color, of the same luminosity as one of the RGB values.
 */

function randomGrayScale(rgb_array) {
    var index = (Math.random() * 3).toFixed(0);
    for (var i = 0; i < 3; i++) {
        i !== index && (rgb_array[i] = rgb_array[index]);
    }
    return rgb_array;
}

/**
 * Calculates the central 3D point of this polygon
 * @return {Point3D} the central point of the polygon
 */

function getCenterOfPointArray(array_of_points) {
    var len = array_of_points.length;
    var x = 0;
    var y = 0;
    var z = 0;
    for (var i = 0; i < len; i++) {
        x += array_of_points[i][0];
        y += array_of_points[i][1];
        z += array_of_points[i][2];
    }

    x /= len;
    y /= len;
    z /= len;

    return [x, y, z];
}

/**
 * Updates the camera's location
 */

function setCameraPosition(x, y, z) {
    camera = [x, y, z];
}

/**
 * Gets the central point of a 3D object and centers it over the X and Y axes.
 * @param  {Polygon} shapes [description]
 */

function center3DObjectOnAxes(shapes) {
    var centers = [];
    var len = shapes.length || 0;
    for (var i = 0; i < len; i++) {
        centers[i] = getCenterOfPointArray(shapes[i].coordinates);
    }
    var center = getCenterOfPointArray(centers);
    center[1] = 0;
    for (i = 0; i < len; i++) {
        moveArrayOfPoints(shapes[i].coordinates, center)
    }
}

/**
 * Moves a list of Point3D objects by the delta of each point over a central Point3D
 * @param  {[Point3D]} points List of 3D Points
 * @param  {Point3D} center A central 3D Point
 */

function moveArrayOfPoints(points, center) {
    var len = points.length;
    for (var i = 0; i < len; i++) {
        points[i][0] -= center[0];
        points[i][2] -= center[2];
    }
}

/**
 * Rotates a list of Polygon objects by a specified degree on a specified dimension
 */

function rotateAllSurfaces(dimension, degree, shapes, camera) {
    for (var i = 0; i < shapes.length; i++) {
        rotate(degree, dimension, shapes[i].coordinates);
    }
}

/**
 * Rearranges the Polygons on the pages
 */

function rearrangePolygonsByCameraDistances(shapes, svgShapes, camera, svg) {
    var cameraDistances = {};
    for (var i = 0; i < shapes.length; i++) {
        cameraDistances[shapes[i].id] = distance(average(shapes[i].coordinates), camera);
    }

    var byCameraDistance = function(a, b) {
        return cameraDistances[a.id] - cameraDistances[b.id];
    }

    var byForcedToBackground = function(a, b) {
        if (a.forceToBackground && !b.forceToBackground) {
            return -1;
        } else if (!a.forceToBackground && b.forceToBackground) {
            return 1;
        }
        return 0;
    }

    shapes.sort(byCameraDistance);
    shapes.sort(byForcedToBackground);

    var length = shapes.length;
    for (var i = 0; i < length; i++) {
        svg.appendChild(svgShapes[shapes[i].id]);
    }
}

/**
 * "Paints" all Polygons provided by updating the projections of the Polygons from the 3D space onto the 2D space
 * @param {[Polygon]} shapes The list of Polygon Objects which need recalculated projections.
 * @param {[SVGPolygonElement]} svgShapes The list of SVGPolygonElements that exist in the SVG already
 */

function paint(shapes, svgShapes, camera, width, height, fov) {
    var len = shapes.length;

    for (var i = 0; i < len; i++) {
        var shape = shapes[i];
        var coords = shape.coordinates;
        var num_coords = coords.length;
        var point;
        var svgPoints = "";

        for (var j = 0; j < num_coords; j++) {
            point = project(coords[j], camera, width, height, fov);
            var s = svgShapes[shape.id].points.getItem(j);
            point && (s.x = point[0]) && (s.y = point[1]);
        }
    }
}

/**
 * Returns a Point2D object representing a projection from the 3D spaces onto the 2D screen
 */

function project(point, camera, width, height, fov) {
    var minDimension = Math.min(width, height),
        scale = minDimension / fov,
        z_weighting = point[2] + camera[2],
        x = width / 2 + scale * (point[0] + camera[0]) / z_weighting,
        y = height / 2 + scale * (point[1] + camera[1]) / z_weighting;

    // TODO: MAK
    // point[3] = 0;
    // console.log(point);
    var mPoint = new Matrix(point);
    var new_projection = projectionMatrix.multiply(mPoint.transpose(mPoint));
    // console.log(new_projection.col(0));

    return [x, y];

    /**
     * this.camera = {
            fov: 45,
            eye: [0,50,100],
            center:[0,0,0],
            up: [0,1,0],
        };
     */


    //from local to normalized screen coordinates
    // var tmp = [0,0,0];
    // mat4.multiplyVec3(transform, v, tmp);
    // projectionMatrix.multiply(point);
    // tmp[0] /= tmp[2];
    // tmp[1] = (1.0 - tmp[1]) / tmp[2];

    //from normalized to screen coordinates
    // tmp[0] = (tmp[0] + 1) * ( this.viewport[2] * 0.5 ) + this.viewport[0];
    // tmp[1] = (tmp[1] + 1) * ( this.viewport[3] * 0.5 ) + this.viewport[1];

    //tmp[0] = Math.round(tmp[0]+0.5); tmp[1] = Math.round(tmp[1]+0.5);
    // return tmp;
}

/**
 * Creates an SVG object, appends it to the HTML element provided (or the document body), and returns a reference
 */

function initSvg(el) {
    var svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("version", "1.1");
    (el || document.body).appendChild(svg);
    return svg;
}

/**
 * Creates SVGPolygonElements and adds them to the svgShapes {} and the svg SVGElement
 */

function addSVGsFromShapes(shapes, svgShapes, svg) {
    for (var i = 0; i < shapes.length; i++) {
        var shape = shapes[i];
        var poly = document.createElementNS(SVG_NS, "polygon");
        var rgb = "rgb(" + shape.color[0] + "," + shape.color[1] + "," + shape.color[2] + ")";
        if (shape.stroke > 0) {
            poly.setAttribute("style", "stroke:" + rgb + ";stroke-opacity:" + shape.opacity + ";stroke-width:" + shape.stroke);
        } else {
            poly.setAttribute("style", "fill:" + rgb + ";fill-opacity:" + shape.opacity);
        }
        svgShapes[shape.id] = poly;
        for (var j = 0, len = shape.coordinates.length; j < len; j++) {
            poly.points.appendItem(svg.createSVGPoint());
        }
        svg.appendChild(poly);
    }
}

function distance(p1, p2) {
    var sum = Math.pow((p1[0] - p2[0]), 2) + Math.pow((p1[1] - p2[1]), 2) + Math.pow((p1[2] - p2[2]), 2);
    return Math.sqrt(sum);
}

function average(coords) {
    var avg = [0, 0, 0],
        len = coords.length;
    for (var i = 0; i < len; i++) {
        avg[0] += coords[i][0];
        avg[1] += coords[i][1];
        avg[2] += coords[i][2];
    }
    avg[0] /= len;
    avg[1] /= len;
    avg[2] /= len;
    return avg;
}

function rotate(angle, axis, points) {
    if (angle == 0) return;
    var d1, d2;
    switch (axis) {
        case "x":
            d1 = 1;
            d2 = 2;
            break;
        case "y":
            d1 = 0;
            d2 = 2;
            break;
        case "z":
            d1 = 0;
            d2 = 1;
            break;
        default:
            return;
    }
    var sin = Math.sin(angle),
        cos = Math.cos(angle);
    for (var i = 0; i < points.length; i++) {
        var c1 = points[i][d1],
            c2 = points[i][d2];
        points[i][d1] = c1 * cos - c2 * sin;
        points[i][d2] = c1 * sin + c2 * cos;
    }
}

/**
 * -----------------
 */

var testBuilding = {
    width: 800,
    length: 800,
    rpa: 1,
    rpc: 1,
    swaEaveHeight: 240,
    swcEaveHeight: 240
};

var svg,
    svg_style,
    width,
    height,
    camera,
    shapes = createPolygonsFromBuilding(testBuilding),
    svgShapes = {},
    SVG_NS = "http://www.w3.org/2000/svg",
    window_width = parseInt(window.getComputedStyle(document.querySelector('html')).width, 10),
    window_height = parseInt(window.getComputedStyle(document.querySelector('html')).height, 10),
    mouseDownX,
    mouseDownY,
    mousedown,
    mouseMoveX,
    mouseMoveY,
    xfov = 50,
    fov = xfov * 0.0174532925; // 1 degree = 0.0174532925 radians,
dX = 0,
dY = 0,
maxDimension = testBuilding.width > testBuilding.length ? testBuilding.width : testBuilding.length,
last_camera_position = 0,
zoom = -1.5 * maxDimension,
body = document.querySelector('body'),
projectionMatrix = null;

window.addEventListener("load", function() {
    setCameraPosition(0, testBuilding.swaEaveHeight * -1, zoom);

    svg = initSvg();

    addSVGsFromShapes(shapes, svgShapes, svg);

    svg_style = window.getComputedStyle(svg);
    width = parseInt(svg_style.width, 10);
    height = parseInt(svg_style.height, 10);

    center3DObjectOnAxes(shapes);

    rotateAllSurfaces("y", .65, shapes, camera);
    rearrangePolygonsByCameraDistances(shapes, svgShapes, camera, svg);
    requestAnimationFrame(function() {
        paint(shapes, svgShapes, camera, width, height, fov);
    });

    // TODO: MAK
    projectionMatrix = new Matrix();
    projectionMatrix = projectionMatrix.perspective(fov, width / height, 10, 5000);

}, false);

window.addEventListener("resize", resize);
window.addEventListener("orientationchange", resize);

function resize(e) {
    svg_style = window.getComputedStyle(svg);
    width = parseInt(svg_style.width, 10);
    height = parseInt(svg_style.height, 10);

    // TODO: MAK
    projectionMatrix = projectionMatrix.perspective(fov, width / height, 10, 5000);

    requestAnimationFrame(function() {
        paint(shapes, svgShapes, camera, width, height, fov)
    });
}

window.addEventListener("mousedown", inputStart);
window.addEventListener("touchstart", inputStart);

function inputStart(e) {
    mousedown = 1;
    mouseDownX = e.pageX;
    mouseDownY = e.pageY;
}

window.addEventListener("mouseup", inputEnd);
window.addEventListener("touchend", inputEnd);

function inputEnd(e) {
    mousedown = 0;
    mouseMoveX = 0;
}

window.addEventListener("mousemove", inputMove);
window.addEventListener("touchmove", inputMove);

function inputMove(e) {
    e.preventDefault();
    if (!mousedown) return;

    var _dX = e.pageX - (mouseMoveX || mouseDownX);
    mouseMoveX = e.pageX;
    if ((dX > 0 && _dX < 0) || (dX < 0 && _dX > 0)) {
        mouseDownX = mouseMoveX;
    }
    dX = _dX;

    rotateAllSurfaces("y", (Math.PI * dX * 2 / window_width), shapes, camera);
    rearrangePolygonsByCameraDistances(shapes, svgShapes, camera, svg);
    requestAnimationFrame(function() {
        paint(shapes, svgShapes, camera, width, height, fov)
    });
}

var mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel" //FF doesn't recognize mousewheel as of FF3.x
document.addEventListener(mousewheelevt, function(e) {
    var _zoom = zoom + e.wheelDeltaY;
    if (_zoom < -1.5 * maxDimension && _zoom > -5 * maxDimension) {
        zoom = _zoom;
        setCameraPosition(0, testBuilding.swaEaveHeight * -1, zoom);
        requestAnimationFrame(function() {
            paint(shapes, svgShapes, camera, width, height, fov)
        });
    }
}, false);
