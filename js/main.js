/**
 * RequestAnimationFrame - for animating and syncing to 60fps
 */
(function() {
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame =
            window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() {
                callback(currTime + timeToCall);
            },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
    };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
    };
}());

/**
 * Point3D class that represents a point in 3-Dimensional space
 */
function Point3D(x, y, z) {
    this.x = parseFloat(x || 0);
    this.y = parseFloat(y || 0);
    this.z = parseFloat(z || 0);
}

/**
 * Point2D class that represents a point in 2-Dimensional space
 */
function Point2D(x, y){
    this.x = x;
    this.y = y;
}

Point3D.prototype.set = function(x, y, z){
    this.x = parseFloat(x || 0);
    this.y = parseFloat(y || 0);
    this.z = parseFloat(z || 0);
    return this;
}

function Polygon(id, coordinates, color, opacity, stroke, forceToBackground){
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
    var ridgeHeight = building.swaEaveHeight+building.swcEaveHeight;
    var maxDimension = building.width > building.length ? building.width : building.width;
    var swa = [
        new Point3D(0, 0, 0),
        new Point3D(ewdX, 0, 0),
        new Point3D(ewdX, building.swaEaveHeight, 0),
        new Point3D(0, building.swaEaveHeight, 0)
    ];
    var ewd = [
        new Point3D(ewdX, 0, 0),
        new Point3D(ewdX, 0, swcZ),
        new Point3D(ewdX, swcEaveY, swcZ),
        new Point3D(ewdX, ridgeHeight, swcZ/2),
        new Point3D(ewdX, swaEaveY, 0)
    ];
    var ewb = [new Point3D(0, 0, 0), new Point3D(0, 0, swcZ), new Point3D(0, swcEaveY, swcZ), new Point3D(0, ridgeHeight, swcZ/2), new Point3D(0, swaEaveY, 0)];
    var swc = [new Point3D(0, 0, swcZ), new Point3D(ewdX, 0, swcZ), new Point3D(ewdX, swaEaveY, swcZ), new Point3D(0, swaEaveY, swcZ)];
    var rpa = [
        new Point3D(ewbX, swaEaveY, 0),
        new Point3D(ewdX, swaEaveY, 0),
        new Point3D(ewdX, ridgeHeight, swcZ/2),
        new Point3D(ewbX, ridgeHeight, swcZ/2)
    ];
    var rpc = [
        new Point3D(ewdX, swcEaveY, swcZ),
        new Point3D(ewbX, swcEaveY, swcZ),
        new Point3D(ewbX, ridgeHeight, swcZ/2),
        new Point3D(ewdX, ridgeHeight, swcZ/2)
    ];

    var opacity = 1;

    return [
        new Polygon('swa', swa, randomColor(), opacity, 0),
        new Polygon('ewb', ewb, randomColor(), opacity, 0),
        new Polygon('swc', swc, randomColor(), opacity, 0),
        new Polygon('ewd', ewd, randomColor(), opacity, 0),
        new Polygon('rpa', rpa, randomColor(), opacity, 0),
        new Polygon('rpc', rpc, randomColor(), opacity, 0),
        createGround(-.5*building.length, 1.5*building.length, -1.5*building.width, .5*building.width)
    ]
}

function createGround(minX, maxX, minZ, maxZ){
    var ground = [
        new Point3D(minX, 0, minZ),
        new Point3D(maxX, 0, minZ),
        new Point3D(maxX, 0, maxZ),
        new Point3D(minX, 0, maxZ)
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
function randomGrayScale(rgb_array){
    var index = (Math.random()*3).toFixed(0);
    for(var i = 0; i < 3; i++){
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
        x += array_of_points[i].x;
        y += array_of_points[i].y;
        z += array_of_points[i].z;
    }

    x /= len;
    y /= len;
    z /= len;

    return new Point3D(x, y, z);
}

/**
 * Updates the camera's location
 */
function setCameraPosition(x, y, z) {
    camera = new Point3D(x, y, z);
}

/**
 * Gets the central point of a 3D object and centers it over the X and Y axes.
 * @param  {Polygon} shapes [description]
 */
function center3DObjectOnAxes(shapes){
    var centers = [];
    var len = shapes.length || 0;
    for(var i = 0; i<len; i++){
        centers[i] = getCenterOfPointArray(shapes[i].coordinates);
    }
    var center = getCenterOfPointArray(centers);
    center.y = 0;
    for(i = 0; i < len; i++){
        moveArrayOfPoints(shapes[i].coordinates, center)
    }
}

/**
 * Moves a list of Point3D objects by the delta of each point over a central Point3D
 * @param  {[Point3D]} points List of 3D Points
 * @param  {Point3D} center A central 3D Point
 */
function moveArrayOfPoints(points, center){
    var len = points.length;
    for(var i = 0; i < len; i++){
        points[i].x -= center.x;
        points[i].z -= center.z;
    }
}

/**
 * Rotates a list of Polygon objects by a specified degree on a specified dimension
 */
function rotateAllSurfaces(dimension, degree, shapes, camera){
    for (var i = 0; i < shapes.length; i++) {
        rotate(degree, dimension, shapes[i].coordinates, camera.z);
    }
}

/**
 * Rearranges the Polygons on the pages
 */
function rearrangePolygonsByCameraDistances(shapes, svgShapes, camera, svg){
    var cameraDistances = {};
    for (var i = 0; i < shapes.length; i++) {
        cameraDistances[shapes[i].id] = distance(average(shapes[i].coordinates), camera);
    }

    var byCameraDistance = function(a, b) {
        return cameraDistances[a.id] - cameraDistances[b.id];
    }

    var byForcedToBackground = function(a, b) {
        if(a.forceToBackground&&!b.forceToBackground){
            return -1;
        } else if(!a.forceToBackground&&b.forceToBackground){
            return 1;
        }
        return 0;
    }

    shapes.sort(byCameraDistance);
    shapes.sort(byForcedToBackground);

    var length = shapes.length;
    for(var i = 0; i < length; i++){
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
        var containsReverseProjection = false;
        for (var j = 0; j < num_coords; j++) {
            if(coords[j].z < camera.z){
                containsReverseProjection = true;
                break;
            }
        }

        var point3d = coords[coords.length - 1];
        var point = project(point3d, camera, width, height, fov); // close the polygon
        var svgPoints = point ? point.x + "," + point.y : "";

        for (var j = 0; j < num_coords; j++) {
            point = project(coords[j], camera, width, height, fov, containsReverseProjection);
            point && (svgPoints += " " + point.x + "," + point.y);
        }

        svgShapes[shape.id].setAttribute("points", svgPoints);
        // var rgba = "rgba(" + shape.color[0] + "," + shape.color[1] + "," + shape.color[2] + "," + shape.opacity + ")";
        // svgShapes[shape.id].setAttribute("color", rgba);
    }
}

/**
 * Returns a Point2D object representing a projection from the 3D spaces onto the 2D screen
 */
function project(point, camera, width, height, fov, containsReverseProjection) {
    var minDimension = width - height < 0 ? width : height;
    var scale = minDimension / fov;
    var z_weighting = point.z + camera.z;
    var x = (width/2 + scale * (point.x + camera.x) / z_weighting);
    var y = (height/2 + scale * (point.y + camera.y) / z_weighting);
    return new Point2D(x, y);
}

/**
 * Creates an SVG object, appends it to the HTML container provided, and returns a reference
 */
function initSvg(container) {
    var svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("version", "1.1");
    container.appendChild(svg);
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
        svg.appendChild(poly);
    }
}

function distance(p1, p2) {
    var sum = Math.pow((p1.x - p2.x), 2) + Math.pow((p1.y - p2.y), 2) + Math.pow((p1.z - p2.z), 2);
    return Math.sqrt(sum);
}

function average(coords) {
    var avg = new Point3D(0, 0, 0),
        len = coords.length;
    for (var i = 0; i < len; i++) {
        avg.x += coords[i].x;
        avg.y += coords[i].y;
        avg.z += coords[i].z;
    }
    avg.x /= len;
    avg.y /= len;
    avg.z /= len;
    return avg;
}

function rotate(angle, axis, points) {
    if (angle == 0) return;
    var d1, d2;
    switch (axis) {
        case "x":
            d1 = 'y';
            d2 = 'z';
            break;
        case "y":
            d1 = 'x';
            d2 = 'z';
            break;
        case "z":
            d1 = 'x';
            d2 = 'y';
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

var testBuilding = {
    width: 800,
    length: 800,
    rpa: 1,
    rpc: 1,
    swaEaveHeight: 240,
    swcEaveHeight: 240
};

var svg;
var svg_style;
var width;
var height;
var camera;
var shapes = createPolygonsFromBuilding(testBuilding);
var svgShapes = {};
var SVG_NS = "http://www.w3.org/2000/svg";
var window_width = parseInt(window.getComputedStyle(document.querySelector('html')).width, 10);
var window_height = parseInt(window.getComputedStyle(document.querySelector('html')).height, 10);
var mouseDownX;
var mouseDownY;
var mousedown;
var mouseMoveX;
var mouseMoveY;
var xfov = 70;
var fov = xfov*0.0174532925; // 1 degree = 0.0174532925 radians;
var dX = 0;
var dY = 0;
var maxDimension = testBuilding.width > testBuilding.length ? testBuilding.width : testBuilding.length;
var last_camera_position = 0;
var zoom = -1.5 * maxDimension;

window.addEventListener("load", function() {
    setCameraPosition(0, testBuilding.swaEaveHeight * -1, zoom);

    svg = initSvg(document.querySelector("#svg-div"));

    addSVGsFromShapes(shapes, svgShapes, svg);

    svg_style = window.getComputedStyle(svg);
    width = parseInt(svg_style.width, 10);
    height = parseInt(svg_style.height, 10);

    center3DObjectOnAxes(shapes);

    rotateAllSurfaces("y", .65, shapes, camera);
    rearrangePolygonsByCameraDistances(shapes, svgShapes, camera, svg);
    requestAnimationFrame(function(){ paint(shapes, svgShapes, camera, width, height, fov); });
}, false);

window.addEventListener("resize", resize);
window.addEventListener("orientationchange", resize);
function resize(e){
    svg_style = window.getComputedStyle(svg);
    width = parseInt(svg_style.width, 10);
    height = parseInt(svg_style.height, 10);
    requestAnimationFrame(function(){ paint(shapes, svgShapes, camera, width, height, fov) });
}

window.addEventListener("mousedown", inputStart);
window.addEventListener("touchstart", inputStart);
function inputStart(e){
    mousedown = 1;
    mouseDownX = e.pageX;
    mouseDownY = e.pageY;
}

window.addEventListener("mouseup", inputEnd);
window.addEventListener("touchend", inputEnd);
function inputEnd(e){
    mousedown = 0;
    mouseMoveX = 0;
}

window.addEventListener("mousemove", inputMove);
window.addEventListener("touchmove", inputMove);
function inputMove(e){
    if(!mousedown) return;
    var _dX = e.pageX - (mouseMoveX || mouseDownX);
    mouseMoveX = e.pageX;
    if((dX > 0 && _dX < 0) || (dX < 0 && _dX > 0)){
        mouseDownX = mouseMoveX;
    }
    dX = _dX;

    rotateAllSurfaces("y", (Math.PI * dX * 2 / window_width), shapes, camera);
    rearrangePolygonsByCameraDistances(shapes, svgShapes, camera, svg);
    requestAnimationFrame(function(){ paint(shapes, svgShapes, camera, width, height, fov) });
}

var mousewheelevt=(/Firefox/i.test(navigator.userAgent))? "DOMMouseScroll" : "mousewheel" //FF doesn't recognize mousewheel as of FF3.x
document.addEventListener(mousewheelevt, function(e){
    var _zoom = zoom + e.wheelDeltaY;
    if(_zoom < -1.5 * maxDimension && _zoom > -5 * maxDimension){
        zoom = _zoom;
        setCameraPosition(0, testBuilding.swaEaveHeight * -1, zoom);
        requestAnimationFrame(function(){ paint(shapes, svgShapes, camera, width, height, fov) });
    }
}, false);