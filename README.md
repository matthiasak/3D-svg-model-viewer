3D-svg-model-viewer
===================

Render objects and polygons in a 3D space with SVG.

## Requirements

This [demo]() uses the SVG spec 1.1, thus you will need Internet Explorer 9+ to see it.

## About the demo / technology

Out of interest in learning about how 3D projections work, I set out to build a 3D scene renderer. I thought to use SVG because:

1. It is a widely supported and very efficient technology
2. 3D vector rendering seemed simpler when I wanted to allow for DOM events on 3D surfaces/objects.

## How it works, a bird's eye view

1. Create standard environment events (click, drag, scroll) and some variables
2. Initialize a "Building" as an example 3D object
	- Read in some geometric variables, create a list of 3D polygons
	- Generate random colors for each wall, since I don't care about color
3. Setup the "camera" (focal point) with some variables built from the Building's 3D object
4. Setup the `<SVGPolygonElement>`s inside the `<SVG>` element
5. Calculate distances between each surface and the camera
	- Distances are calculated with a single 3D point at the center of each 3D Polygon
6. Rearrange each `<SVGPolygonElement>` in the HTML by distance from the camera
	- Sets the rendering order of each surface, e.g. the back wall of the building gets rendered behind the front wall
7. Calculate projections from each 3D point in each `<SVGPolygonElement>` onto the 2D screen.
8. Handle dragging, scrolling, and zooming events and manipulate the rotation and zoom of the scene.

See the [demo]().

## Screenshot

![](https://github.com/matthiasak/3D-svg-model-viewer/blob/master/Screen%20Shot%202013-06-07%20at%2011.07.23.png)

## Screen Capture

In case you can't view this demo, check out this [video](https://github.com/matthiasak/3D-svg-model-viewer/blob/master/3dBuilding.mov).