#version 300 es
precision highp float;

// Never rasterized: gl.RASTERIZER_DISCARD is enabled for every draw call
// that uses this program. A program still needs a valid fragment shader to
// link, even when its output is provably never read.
void main() {}
