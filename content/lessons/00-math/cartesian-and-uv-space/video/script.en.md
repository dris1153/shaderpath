---
slug: cartesian-and-uv-space
title: Cartesian and UV Space
---

## scene: hook
{in}Hi, I'm Inko! Look closely at any screen and you'll find a {grid}grid of tiny squares: pixels.
To paint a picture, a shader has to know {where}where each one sits. So every pixel needs an {address}address.
Today we'll meet the three ways graphics writes that address down: | {pixels}pixel coordinates, {uv}[UV](U V), and {ndc}[NDC](N D C).

## scene: axes
{line}Start with a number line: one axis, one number.
{plane}Add a second axis at a right angle, pick an origin where they cross, and any point becomes a pair, x and y. | {walk}Walk x steps across, then y steps up.
{space}Add a third axis, z, at right angles to both, and you're in 3D.
{assume}Nothing forces the axes to be perpendicular and evenly spaced, | but every graphics tool quietly assumes they are.

## scene: conventions
{in}Which axis points up? {yup}In [three.js](three J S), and in the [glTF](G L T F) format, y points up.
{zup}Blender uses z-up instead. | Bring a Blender character into [three.js](three J S) without converting, and it {lies}lies along z, head toward you.
{hand}The second question is handedness. In a right-handed system, {curl}curl your right hand's fingers from x toward y, and your {thumb}thumb points along z.
[Three.js](Three J S) is right-handed; {left}DirectX and Unity are traditionally left-handed. | Mix them up, and your model comes out mirrored, or even inside out.
{canvas}Even flat screens disagree: math puts y up, but a 2D canvas starts at the top left and counts y downward.

## scene: uv
{square}Now, textures. A texture might be sixteen pixels wide, or over eight thousand. [UV](U V) space ignores that.
{corners}One corner is [(0, 0)](zero, zero), the opposite corner is [(1, 1)](one, one), whatever the image size. | u runs across, v runs up or down.
{why}So a shader samples by [UV](U V) and never needs the pixel count. | {swap}Swap in a bigger texture, and not one line of shader code changes.
{origin}One catch: images put v equals zero at the top, but classic WebGL textures put it at the bottom. | Only v differs, so a wrongly flipped texture comes out {flipped}flipped top to bottom, never left to right.

## scene: pixel-to-uv
{grid}So how does a pixel find its [UV](U V)? Take a tiny screen, four pixels wide and two tall.
{square}A pixel isn't a point. It's a little square, and its index marks the square's edge, not its center.
{center}The center sits half a pixel further in. So: add a half, then divide by the width.
{formula}[u = (x + 0.5) / W](u equals x plus a half, over W). | v works the same way, with the height.
{paint}Inko has eight tentacles, so each one takes a pixel, and they all run the same little formula at once.
That's how a GPU works: one tiny program, run for every pixel, in parallel.
{shader}Inside a shader, [gl_FragCoord](G L frag coord) already sits at the pixel center and starts at the bottom left, | so there you simply divide by the resolution.

## scene: ndc
{range}[UV](U V) runs from [0](zero) to [1](one). That's perfect for textures, but for directions we want a range centered on zero: | {wide}[−1](minus one) to [1](one). WebGL calls it [NDC](N D C), normalized device coordinates.
{sign}Now the sign alone tells you left or right.
{stretch}To get there, stretch by two, then shift by one: [x = 2u − 1](x equals two u minus one).
{wrong}Just subtracting a half isn't enough. Your drawing would fill only the middle half of the screen.
{flip}And [y = 1 − 2v](y equals one minus two v), because v grows downward in images, while [NDC](N D C) grows upward.

## scene: recap
{recap}So: pixel coordinates count squares from the top left. | {uv}[UV](U V) squeezes any size into [0](zero) to [1](one), measured at pixel centers. | {ndc}[NDC](N D C) stretches that to [−1](minus one) to [1](one), centered on the screen.
Watch for the two classic slips: forgetting the {half}half pixel, and forgetting to {flipy}flip y.
{demo}Now open the [UV](U V) explorer in this lesson, and see which corner turns yellow. See you in the next lesson!
