---
slug: matrix-basics
title: Matrix Basics
outro: true
---

## scene: hook
{in}Inko is making a game, and this slime needs two changes. | {stretch}Stretch it twice as wide, {turn}and give it a quarter turn.
{left}Stretch first, then turn, and the slime stands tall. {right}Turn first, then stretch, and it lies wide.
{same}Same two steps, two different slimes. | {question}Each step is a matrix. Today we'll open one up, {answer}and see why the order changes everything.

## scene: machine
{machine}A matrix is a machine for space. {feed}Feed it a vector, and it hands back another vector.
{grid}One rule moves every point of the plane at once, | {strict}and that rule is strict: {straight}straight lines stay straight, {parallel}parallel lines stay parallel, {origin}and the origin never moves. | {linear}That's what linear means.
{bend}Bend the lines, the way a fisheye lens does, {bendx}and it's no longer linear: no matrix can do that. | {slide}Slide the whole plane, and the origin moves: {slidex}a [2x2](two by two) matrix can't do that, not until the next lesson.

## scene: columns
{even}Because the grid stays evenly spaced, two arrows decide everything. {i}[î](i hat) is the vector [(1, 0)](one, zero). {j}And [ĵ](j hat) is the vector [(0, 1)](zero, one).
{land}Know where those two land, and you know the whole transform.
{columns}A [2x2](two by two) matrix stores exactly that, in its columns. | {col1}The first column is where [î](i hat) lands. {col2}The second is where [ĵ](j hat) lands.
{example}Here, the first column is the vector [(2, 0)](two, zero). {double}So [î](i hat) doubles along x. | {second}The second is the vector [(0, 1)](zero, one). {stay}So [ĵ](j hat) stays put.
{read}That's a horizontal stretch, read without multiplying anything. {rows}Columns, not rows: that's the rule people get wrong.

## scene: multiply
{how}So how does it move any other vector? {mix}Every vector is already a mix of [î](i hat) and [ĵ](j hat). | {v}The vector [(3, 4)](three, four) is three [î](i hats) plus four [ĵ](j hats).
{keep}The matrix keeps those weights, and swaps in the new arrows. {c1}The first column is the vector [(2, 0)](two, zero). Take three of it. {c2}The second column is the vector [(0, 1)](zero, one). Take four of it.
{result}Together they give the vector [(6, 4)](six, four). | {recipe}The row-by-column recipe agrees, {why}but columns show you why.

## scene: rotate
{build}Now let's build a rotation from scratch. {turn}Turn the plane by an angle, [θ](theta), counter-clockwise.
{i}[î](i hat) starts on the circle of radius one, at angle zero. | {iturn}Turned by [θ](theta), it lands on the vector [(cos θ, sin θ)](cosine theta, sine theta). {col1}That's column one.
{j}[ĵ](j hat) starts at [90°](ninety degrees), {jends}so it ends at [90° + θ](ninety plus theta). | {jlands}That's the vector [(−sin θ, cos θ)](minus sine theta, cosine theta). {col2}That's column two.
{check}Check at [90°](ninety degrees). {iup}[î](i hat) swings up to the vector [(0, 1)](zero, one). {jleft}[ĵ](j hat) swings left to the vector [(−1, 0)](minus one, zero).
{trap}Drop that minus sign, and the two axes just swap places. | {mirror}The shape comes out mirrored, and no rotation can do that.

## scene: scale-shear
{scale}A scale matrix is even simpler. {sx}The x scale sits in the first column, {sy}the y scale in the second, | {own}and each axis stretches on its own.
{shear}A shear is different. {istay}[î](i hat) stays put, {jslide}but [ĵ](j hat) slides over to the vector [(k, 1)](k, one). | {lean}The square leans, and its base never moves.
{looks}That looks like a small rotation, but it isn't. {keeps}A rotation keeps every edge the same length. | {grows}The sheared edge grows, to [√(k² + 1)](the root of k squared plus one).

## scene: order
{back}Back to the two slimes. {chain}A chain of matrices runs from right to left: | {closest}the matrix next to the vector runs first. {code}So stretch first, then turn, {written}is written [R * S * v](R times S times v).
{trap}Read it left to right like a sentence, and you get the order backwards.
{watch}Watch [î](i hat). {rs}[R * S](R times S) stretches it first, to the vector [(2, 0)](two, zero). {rs2}Then it turns it, to the vector [(0, 2)](zero, two).
{sr}[S * R](S times R) turns it first, to the vector [(0, 1)](zero, one). {cant}Then the stretch along x can't touch it.
{bug}Same two matrices, different answers, and no error anywhere. | {fix}Stretched along the wrong axis? Check the order first.

## scene: recap
{recap}So: a matrix moves the whole plane, {linear}keeping lines straight and the origin still.
{cols}Its columns are where [î](i hat) and [ĵ](j hat) land, {mul}and times a vector, it mixes those columns.
{kinds}Rotate, scale and shear are just different columns, | {order}and in a chain, the matrix next to the vector runs first.
{bigger}[3x3](Three by three) and [4x4](four by four) matrices follow the same rules. {next}Next time, one extra dimension lets them slide things, too.
{demo}Now open the [2x2](two by two) matrix demo in this lesson, drag only b, | and see which arrow moves.
