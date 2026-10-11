---
slug: homogeneous-coordinates-4x4
title: Homogeneous Coordinates
outro: true
---

## scene: hook
{in}Last time, a matrix could stretch, turn and shear the whole plane. | {try}Now try the simplest move in a game: slide this slime five steps to the right.
{push}The matrix pushes, {stuck}and the slime doesn't budge. | {why}Any matrix times the zero vector gives the zero vector, so the origin always stays put.
{needs}But sliding every point by a vector, t, would send the origin to t. | {none}So no [3x3](three by three) matrix can move a 3D object, wherever you put its numbers. {fix}The fix is one extra number.

## scene: extra
{add}Give every point a fourth number, w, and set it to one. | {tuple}So x, y, z becomes x, y, z, one. {name}That's homogeneous coordinates.
{grow}The matrix grows to [4x4](four by four). {block}Rotation and scale live in the top-left [3x3](three by three) block. | {column}The last column holds the move, t. {row}The bottom row is zero, zero, zero, one.
{mix}Multiply as in the last lesson: mix the columns, weighted by the point's numbers. | {weight}The last column is weighted by w, so with w equal to one, t gets added in.
{example}Say t is the vector [(5, −2, 0)](five, minus two, zero). {point}Take the point [(1, 1, 1)](one, one, one). {lands}It lands at [(6, −1, 1)](six, minus one, one).
{chain}Now moving, turning and scaling are all the same thing: matrix multiplication.

## scene: lift
{see}Why does one extra number work? We can't draw four dimensions, | {down}so let's watch the same trick one dimension down.
{plane}A flat 2D world gets a third number, w, and floats on the plane at height one.
{shear}A [3x3](three by three) matrix with t in its last column shears space: | {top}the plane at height one slides by t, {floor}while the floor at height zero doesn't move at all.
{moves}So inside the plane, the whole world moved. A plain matrix made a translation.

## scene: switch
{switch}That still floor is the second gift of w. {point}w equal to one marks a point, and it gets moved. | {direction}w equal to zero marks a direction: the move is multiplied by zero, so it vanishes.
{same}Try the same matrix on the vector [(1, 1, 1, 0)](one, one, one, zero). {unchanged}It comes out unchanged.
{game}The slime slides across the map, | {arrows}but its velocity and the way it faces stay exactly the same.
{bug}Forget the zero on a velocity, and it gets moved like a point. | {drift}The farther the slime goes, the more wrong it points, and nothing crashes.

## scene: normals
{catch}Normals are directions too, with one more catch. {stretch}Stretch a ball twice as wide, | {wrong}and move its normals with the same matrix: they lean with the stretch, and stop being perpendicular to the surface. {light}So the lighting comes out wrong.
{fix}For normals, use the inverse transpose of the [3x3](three by three) block instead. | {hide}With only rotation, or the same scale on every axis, you'd never notice.

## scene: trs
{build}To build an object's model matrix, | {blocks}put its rotation and scale in that corner, and multiply: [T * R * S](T times R times S).
{read}Read it right to left: {scale}scale in place, {rotate}rotate around its own center, {move}then move it out into the world.
{swap}Swap it to [R * T](R times T), and the move happens first. | {orbit}Then the turn swings the slime around the world origin: it orbits instead of spinning.

## scene: divide
{last}One last job hides in w. {never}Translate, rotate and scale never change it: points keep one, and directions keep zero.
{projection}The projection matrix, next lesson, writes a new w: the point's depth in front of the camera. | {divide}Then the GPU divides x, y and z by w.
{near}A point with x equal to two and w equal to five lands at [0.4](zero point four). | {far}Twice as far, w is ten, and it lands at [0.2](zero point two): half as far from the center.
{smaller}Far things look small, and it's just a division.

## scene: recap
{recap}So: a matrix always keeps the origin, so moving needs a fourth number, w. | {layout}A [4x4](four by four) matrix keeps rotation and scale in its corner, and the move in its last column.
{points}w equal to one is a point, and it moves. {dirs}w equal to zero is a direction, and it doesn't. {normals}Normals take the inverse transpose.
{order}Build models as [T * R * S](T times R times S), {div}and dividing by w makes far things small. {next}Next time: model, view and projection.
{demo}Now open the demo in this lesson, drag the move all the way, | and watch the blue arrows stay still.
