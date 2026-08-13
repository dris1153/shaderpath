import type { Monaco } from "@monaco-editor/react";
import type { Position, editor } from "monaco-editor";

// D4: Monaco ships no GLSL — register a Monarch tokenizer, language config and
// completions for built-ins + the platform's default uniforms.

const KEYWORDS = [
  "attribute", "varying", "uniform", "in", "out", "inout", "layout",
  "const", "precision", "highp", "mediump", "lowp", "invariant", "flat",
  "smooth", "centroid", "if", "else", "for", "while", "do", "break",
  "continue", "return", "discard", "struct", "true", "false",
];

const TYPES = [
  "void", "bool", "int", "uint", "float", "double",
  "vec2", "vec3", "vec4", "ivec2", "ivec3", "ivec4",
  "uvec2", "uvec3", "uvec4", "bvec2", "bvec3", "bvec4",
  "mat2", "mat3", "mat4", "mat2x2", "mat3x3", "mat4x4",
  "sampler2D", "sampler3D", "samplerCube", "sampler2DShadow",
];

const BUILTINS = [
  "radians", "degrees", "sin", "cos", "tan", "asin", "acos", "atan",
  "pow", "exp", "log", "exp2", "log2", "sqrt", "inversesqrt",
  "abs", "sign", "floor", "ceil", "fract", "mod", "min", "max",
  "clamp", "mix", "step", "smoothstep", "length", "distance", "dot",
  "cross", "normalize", "reflect", "refract", "faceforward",
  "texture", "textureLod", "texelFetch", "dFdx", "dFdy", "fwidth",
  "matrixCompMult", "transpose", "inverse", "determinant",
];

const DEFAULT_UNIFORMS = [
  { name: "uTime", type: "float", doc: "Seconds since the preview started" },
  { name: "uResolution", type: "vec2", doc: "Drawing buffer size in pixels" },
  { name: "uMouse", type: "vec2", doc: "Pointer position, normalized 0..1 (y up)" },
  { name: "fragColor", type: "vec4", doc: "Output color (out variable)" },
  { name: "gl_FragCoord", type: "vec4", doc: "Window-space fragment coordinate" },
];

/** Idempotent — safe under HMR and repeated mounts. */
export function registerGlslLanguage(monaco: Monaco) {
  if (
    monaco.languages.getLanguages().some((l: { id: string }) => l.id === "glsl")
  ) {
    return;
  }

  monaco.languages.register({ id: "glsl" });

  monaco.languages.setMonarchTokensProvider("glsl", {
    keywords: KEYWORDS,
    types: TYPES,
    builtins: BUILTINS,
    tokenizer: {
      root: [
        [/^\s*#\s*\w+/, "keyword.directive"],
        [/\/\/.*$/, "comment"],
        [/\/\*/, "comment", "@comment"],
        [/[a-zA-Z_]\w*/, {
          cases: {
            "@types": "type",
            "@keywords": "keyword",
            "@builtins": "predefined",
            "@default": "identifier",
          },
        }],
        [/\d+\.\d*([eE][-+]?\d+)?[fF]?/, "number.float"],
        [/\.\d+([eE][-+]?\d+)?[fF]?/, "number.float"],
        [/\d+[uU]?/, "number"],
        [/[{}()[\]]/, "@brackets"],
        [/[;,.]/, "delimiter"],
        [/[<>=!+\-*/&|^%?:]+/, "operator"],
      ],
      comment: [
        [/[^/*]+/, "comment"],
        [/\*\//, "comment", "@pop"],
        [/[/*]/, "comment"],
      ],
    },
  });

  monaco.languages.setLanguageConfiguration("glsl", {
    comments: { lineComment: "//", blockComment: ["/*", "*/"] },
    brackets: [["{", "}"], ["[", "]"], ["(", ")"]],
    autoClosingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: "(", close: ")" },
    ],
  });

  monaco.languages.registerCompletionItemProvider("glsl", {
    provideCompletionItems(model: editor.ITextModel, position: Position) {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };
      const kinds = monaco.languages.CompletionItemKind;
      return {
        suggestions: [
          ...BUILTINS.map((name) => ({
            label: name,
            kind: kinds.Function,
            insertText: name,
            range,
          })),
          ...TYPES.map((name) => ({
            label: name,
            kind: kinds.TypeParameter,
            insertText: name,
            range,
          })),
          ...DEFAULT_UNIFORMS.map((u) => ({
            label: u.name,
            kind: kinds.Variable,
            insertText: u.name,
            detail: u.type,
            documentation: u.doc,
            range,
          })),
        ],
      };
    },
  });
}
