import { describe, expect, it } from "vitest";
import { lintPredict } from "@/lib/predict-lint";

const block = (opts: string[], answer: number) =>
  `<Predict
  question="Q"
  options={[${opts.map((o) => JSON.stringify(o)).join(", ")}]}
  answer={${answer}}
  reveal="R"
/>`;

const good = block(["a", "b", "c"], 1);
const lint = (vi: string, en: string) =>
  lintPredict({ at: "00-math/x", vi, en }).errors;

describe("lintPredict", () => {
  it("accepts matching blocks", () => {
    expect(lint(good, good)).toEqual([]);
  });

  it("accepts lessons with no Predict at all", () => {
    expect(lint("# Bài", "# Lesson")).toEqual([]);
  });

  it("catches a block present in one locale only", () => {
    const errors = lint(good, "# Lesson");
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("count differs (vi: 1, en: 0)");
  });

  it("catches differing option counts", () => {
    const errors = lint(good, block(["a", "b"], 1));
    expect(errors.some((e) => e.includes("option count differs"))).toBe(true);
  });

  it("catches an answer outside the option range", () => {
    const errors = lint(block(["a", "b", "c"], 3), good);
    expect(errors).toEqual([
      "00-math/x: <Predict> #1: vi answer=3 is outside 0..2",
    ]);
  });

  it("catches a negative answer", () => {
    expect(lint(block(["a", "b"], -1), block(["a", "b"], 0))[0]).toContain(
      "vi answer=-1 is outside 0..1",
    );
  });

  it("catches a missing answer prop", () => {
    const noAnswer = `<Predict question="Q" options={["a", "b"]} reveal="R" />`;
    expect(lint(noAnswer, block(["a", "b"], 0))[0]).toContain(
      "vi has no answer={n}",
    );
  });

  it("catches a missing options array", () => {
    const noOptions = `<Predict question="Q" answer={0} reveal="R" />`;
    const errors = lint(noOptions, block(["a", "b"], 0));
    expect(errors[0]).toContain("vi has no options={[...]} array");
  });

  it("reports each block by index", () => {
    const errors = lint(good + good, good + block(["a", "b"], 1));
    expect(errors[0]).toContain("<Predict> #2");
  });

  it("counts an option containing an escaped quote as one option", () => {
    const quoted = `<Predict question="Q" options={["say \\"hi\\"", "b"]} answer={0} reveal="R" />`;
    expect(lint(quoted, block(["a", "b"], 0))).toEqual([]);
  });

  it("counts options split across lines", () => {
    const multiline = `<Predict
  question="Q"
  options={[
    "a",
    "b",
  ]}
  answer={1}
  reveal="R"
/>`;
    expect(lint(multiline, block(["a", "b"], 1))).toEqual([]);
  });
});
