---
slug: dot-and-cross-products
title: Dot, Cross & Normalize
outro: true
---

## scene: hook
{in}A slime guard watches the hall. {cone}It sees everything inside this cone. | {sneak}Inko sneaks past behind it, {front}then steps in front. {spotted}Spotted!
{question}But how does the guard's code know Inko is in front of it, and not behind? | {answer}One small operation: the dot product. {partner}Then we'll meet its 3D partner, the cross product.

## scene: multiply-add
{number}The dot product takes two vectors and gives back one number, not a vector. {pairs}Multiply the matching parts, then add.
{example}Take [(3, 1)](three, one) and [(2, 2)](two, two). {xs}Three times two is six, {ys}one times two is two, {sum}and six plus two is eight.
{threeD}In 3D, add one more term: z times z. {code}Three multiplies and two adds, that's the whole function. | {order}And the order doesn't matter: [a·b](a dot b) equals [b·a](b dot a).

## scene: angle
{meaning}So what does that eight mean? {formula}The same number has a second formula: | [|a| |b| cos θ](the length of a, times the length of b, times cosine theta), where theta is the angle between them.
{unit}Normalize both vectors first, and both lengths are one, | {cos}so the dot product is just the cosine of the angle.
{sweep}Now swing b around a. {front}Pointing the same way, the dot is positive. {side}At ninety degrees it's exactly zero: perpendicular. {behind}Past ninety, it turns negative.
{sign}Front, side or behind: just read the sign. {noTrig}No angle, and no inverse cosine needed.

## scene: vision
{back}Back to the guard. {facing}It faces along a direction, f. {toPlayer}The arrow to Inko is [player − guard](player minus guard), straight from lesson two.
{norm}Normalize both, {dot}and their dot is the cosine of the angle | between where the guard looks and where Inko stands.
{cone}The cone is sixty degrees wide, thirty on each side. | {compare}So Inko is seen when that dot is greater than [cos 30°](cosine of thirty degrees), about [0.87](zero point eight seven).
{trap}Now the trap: skip the normalize, {far}and a faraway Inko makes a huge dot, so it's seen even outside the cone, | {near}while a close Inko, right in front, doesn't count. {fix}Normalize first, and only the angle matters.

## scene: projection
{shadow}The dot has one more meaning. {drop}Drop a line from the tip of a straight onto b's direction. | {length}How far along it lands is a's shadow: [a·b̂](a dot b hat), with b normalized.
{speed}In the game, dot Inko's velocity with the direction toward the guard, {toward}and you get how fast Inko is closing in. {away}Negative means moving away.
{longer}Make b longer, and the shadow stays put: only its direction counts.

## scene: cross
{threeD}Now step into 3D. {cross}The cross product takes two vectors and gives back a vector, {perp}one that's perpendicular to both.
{two}But two directions are perpendicular to both: up and down. | {hand}The right-hand rule picks one: curl your right hand's fingers from a toward b, {thumb}and your thumb points along [a×b](a cross b).
{axes}A classic check: x cross y gives z. {swap}Swap the order, and the result flips: | [b×a](b cross a) is minus [a×b](a cross b). {unlike}Unlike the dot product, order matters here.

## scene: normal
{why}Where does graphics use it? Every triangle needs a normal: {out}the direction its face points.
{corners}Take its corners, A, B and C. {ab}Build two edges from A, [B − A](B minus A) {ac}and [C − A](C minus A). {crossEdges}Cross them, {normalize}then normalize: that's the normal.
{area}Bonus: the cross product's length is | the area of the parallelogram the two edges make, | {half}and the triangle is half of it. {zero}Parallel edges give zero, and normalizing zero is lesson two's [NaN](not a number) trap.
{winding}The corner order matters too. {ccw}In WebGL and three.js, corners going counter-clockwise, as the camera sees them, make the front face. | {flipped}Swap two corners, and the normal points into the mesh.

## scene: light
{both}Now both products work together. {sphere}Here's a ball and a light. {nl}At each point, take the normal, N, and the direction toward the light, L, both normalized.
{lambert}The brightness is [max(0, N·L)](max of zero and N dot L). {facing}Facing the light: one, fully lit. {edge}Edge-on: zero. {away}Turned away, the dot goes negative, | {clamp}and max clamps it to zero, because light can't be negative.
{cull}The same sign check, against the camera instead of the light, | {skip}lets the GPU skip triangles that face away. That's backface culling.

## scene: recap
{recap}So: {dot}the dot product multiplies and adds, giving one number. {sign}Its sign says front, side or behind, | {cos}and for unit vectors, it's the cosine of the angle.
{cross}The cross product gives a vector perpendicular to both, {order}and the order sets which way.
{normal}Edges, cross, normalize: a triangle's normal. {light}Normal dot light: a lit surface.
{demo}Now open the Dot Product and Projection demo in this lesson, stretch b, | and watch the shadow stay still while [a·b](a dot b) keeps growing.
