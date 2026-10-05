---
slug: vector-basics
title: Vector Basics
outro: true
---

## scene: hook
{in}Two Inkos, one game, one speed setting. | {straight}This one holds D and walks right. {diagonal}This one holds W and D and walks diagonally.
{gap}Same speed setting, so why has the diagonal one gone {pct}[41%](forty-one percent) farther? | {answer}The answer is vectors. Let's build them up, one piece at a time.

## scene: what
{arrow}A vector is a displacement: how far, and in which direction. {draw}Draw it as an arrow: {size}the length is its size, {head}the head shows the way.
{slide}Slide the same arrow anywhere, and it's still the same vector, because where it starts isn't part of it.
{tuple}In code, a vector is just numbers, x and y. | {origin}Put its tail at the origin, and the tip lands exactly on the point x, y.
{point}Same numbers, different meaning: a point is a fixed place, {move}and a vector is a move.
{zero}One special case: the zero vector has length zero, and no direction at all. {remember}Remember it.

## scene: add
{walk}Adding vectors means walking them one after another. | {a}Inko walks a, {then}then walks b from where a ended.
{sum}Placed tip to tail, the sum is the straight arrow from start to finish.
{swap}Walk b first, then a, and you land in the same place. | {para}The two paths make a parallelogram, and the sum is its diagonal.
{numbers}In numbers, add the parts. Here a is the vector {first}[(3, 1)](three, one). And b is the vector {second}[(−2, 4)](minus two, four). Together they give the vector {result}[(1, 5)](one, five).

## scene: subtract
{chase}Subtraction answers a game question: which way should the enemy move to reach the player?
{formula}Take [player − enemy](player minus enemy). | {arrow}It's the vector from the enemy to the player, tail at the enemy, tip on the player.
{follow}Move along it, and the slime closes in.
{flip}Swap the order, [enemy − player](enemy minus player), and the arrow points away. | {runs}The slime turns its back and runs.
{silent}The code still runs, so the bug is silent. {always}Always take the target minus your own position.

## scene: scale
{scale}Multiplying by a number scales a vector: every part gets multiplied.
{stretch}Times two stretches it along the same line. {shrink}Times a half shrinks it. {flip}A negative number flips it a full [180°](one hundred eighty degrees).
{example}Take the vector [(4, −2)](four, minus two). Multiply it by [−1.5](minus one point five), {gives}and you get the vector [(−6, 3)](minus six, three): | one and a half times as long, pointing the other way.
{engine}Add, subtract and scale: three tiny functions behind most simple game motion.

## scene: length
{triangle}How long is a vector? {legs}Its x and y are the legs of a right triangle, so Pythagoras answers: | {formula}[|v| = √(x² + y²)](length equals the square root of x squared plus y squared).
{example}For [(3, 4)](three, four), that's the root of nine plus sixteen, {five}root twenty-five: five. {threeD}In 3D, add z squared under the root.
{compare}A handy trick: to compare two lengths, compare the squared lengths instead. | {cheap}Same answer, with no square root, which costs more than a multiply on the CPU and the GPU.

## scene: normalize
{divide}Normalizing divides a vector by its own length. | {unit}What's left is a unit vector: same direction, length exactly one, {circle}its tip on the circle of radius one.
{replay}Back to the race. Holding W adds the vector {w}[(0, 1)](zero, one). Holding D adds the vector {d}[(1, 0)](one, zero). Together: the vector {sum}[(1, 1)](one, one), | {root}and its length is [√2](root two), about [1.41](one point four one). {fix}That's the forty-one percent. {norm}Normalize before multiplying by speed, and both cover the same distance.
{zero}One trap: the slime lands exactly on Inko, and {pz}[player − enemy](player minus enemy) is the zero vector.
{nan}A hand-written normalize divides zero by zero, giving [NaN](not a number). | {poof}That NaN spreads through every step, {vanish}and the slime just vanishes, {noError}with no error anywhere.
{check}So check the length before you divide, and the same goes for the input when no key is held.

## scene: roles
{roles}The same x, y, z can play three roles. {position}A position is a place, measured from the origin.
{direction}A direction only says which way, usually with length one, and it has no position: | {box}slide a box, and its top face's normal stays the same.
{velocity}A velocity is direction and speed together: {twice}twice as long means twice as fast.
{loop}And here's the heart of the simplest game loop: every frame, {code}[position += velocity * dt](position plus equals velocity times d t). | {names}Just addition and scaling, with new names.

## scene: recap
{recap}So: a vector is a move, an arrow or a tuple. {add}Add tip to tail, {sub}subtract to point from one place to another,
{scale}scale to stretch or flip, {length}Pythagoras for length, {unit}and normalize for pure direction.
{traps}Watch for the traps: {speed}diagonal speed, {order}subtraction order, {zeroTrap}and the zero vector.
{demo}Now open the Vector Addition demo in this lesson, and try to shrink the sum arrow to almost nothing. See you next time!
