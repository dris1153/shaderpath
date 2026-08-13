"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { Demo } from "@/components/viz/demo";
import { Badge } from "@/components/ui/badge";

const LABELS = {
  vi: {
    title: "Máy dò khả năng WebGL / WebGPU",
    feature: "Khả năng",
    status: "Trạng thái",
    detail: "Chi tiết",
    yes: "Có",
    no: "Không",
    partial: "Một phần (extension)",
    checking: "Đang kiểm tra…",
  },
  en: {
    title: "WebGL / WebGPU Capability Detector",
    feature: "Feature",
    status: "Status",
    detail: "Detail",
    yes: "Yes",
    no: "No",
    partial: "Partial (extension)",
    checking: "Checking…",
  },
} as const;

type Loc = keyof typeof LABELS;
type Status = "yes" | "no" | "partial" | "checking";

interface Row {
  id: string;
  label: Record<Loc, string>;
  status: Status;
  detail: string;
}

// navigator.gpu has no stable typings here (no @webgpu/types dependency) —
// narrow the minimal shape we use through `unknown`, never `any`.
interface MinimalGPUAdapterInfo {
  vendor?: string;
  architecture?: string;
  description?: string;
}
interface MinimalGPUAdapter {
  info?: MinimalGPUAdapterInfo;
  requestAdapterInfo?: () => Promise<MinimalGPUAdapterInfo>;
}
interface MinimalGPU {
  requestAdapter: () => Promise<MinimalGPUAdapter | null>;
}

// Two throwaway canvases, never attached to the DOM and never reused across
// renders — nothing here needs registering with useDisposable (§8.2).
function probeWebGL(): Row[] {
  const rows: Row[] = [];

  const c1 = document.createElement("canvas");
  const gl1 = (c1.getContext("webgl") ??
    c1.getContext("experimental-webgl")) as WebGLRenderingContext | null;
  rows.push({
    id: "webgl1",
    label: { vi: "Context WebGL1", en: "WebGL1 context" },
    status: gl1 ? "yes" : "no",
    detail: gl1 ? String(gl1.getParameter(gl1.VERSION)) : "—",
  });

  const c2 = document.createElement("canvas");
  const gl2 = c2.getContext("webgl2");
  rows.push({
    id: "webgl2",
    label: { vi: "Context WebGL2", en: "WebGL2 context" },
    status: gl2 ? "yes" : "no",
    detail: gl2 ? String(gl2.getParameter(gl2.VERSION)) : "—",
  });

  const vaoExt = gl1?.getExtension("OES_vertex_array_object");
  rows.push({
    id: "vao",
    label: { vi: "Vertex Array Object", en: "Vertex Array Object" },
    status: gl2 ? "yes" : vaoExt ? "partial" : "no",
    detail: gl2
      ? "native: gl.createVertexArray"
      : vaoExt
        ? "OES_vertex_array_object"
        : "—",
  });

  const instancingExt = gl1?.getExtension("ANGLE_instanced_arrays");
  rows.push({
    id: "instancing",
    label: { vi: "Instanced rendering", en: "Instanced rendering" },
    status: gl2 ? "yes" : instancingExt ? "partial" : "no",
    detail: gl2
      ? "native: drawArraysInstanced"
      : instancingExt
        ? "ANGLE_instanced_arrays"
        : "—",
  });

  rows.push({
    id: "transform-feedback",
    label: { vi: "Transform feedback", en: "Transform feedback" },
    status: gl2 ? "yes" : "no",
    detail: gl2 ? "native: createTransformFeedback" : "WebGL2 only",
  });

  const drawBuffersExt = gl1?.getExtension("WEBGL_draw_buffers");
  const maxAttachments = gl2
    ? Number(gl2.getParameter(gl2.MAX_COLOR_ATTACHMENTS))
    : null;
  rows.push({
    id: "mrt",
    label: { vi: "Multiple render targets", en: "Multiple render targets" },
    status: gl2 ? "yes" : drawBuffersExt ? "partial" : "no",
    detail: gl2
      ? `MAX_COLOR_ATTACHMENTS = ${maxAttachments}`
      : drawBuffersExt
        ? "WEBGL_draw_buffers"
        : "—",
  });

  rows.push({
    id: "texture-3d",
    label: { vi: "3D texture", en: "3D texture" },
    status: gl2 ? "yes" : "no",
    detail: gl2
      ? `MAX_3D_TEXTURE_SIZE = ${Number(gl2.getParameter(gl2.MAX_3D_TEXTURE_SIZE))}`
      : "WebGL2 only",
  });

  const shadingCtx = gl2 ?? gl1;
  rows.push({
    id: "glsl-version",
    label: { vi: "Phiên bản GLSL ES", en: "GLSL ES version" },
    status: gl2 ? "yes" : gl1 ? "partial" : "no",
    detail: shadingCtx
      ? String(shadingCtx.getParameter(shadingCtx.SHADING_LANGUAGE_VERSION))
      : "—",
  });

  return rows;
}

function badgeVariant(status: Status): "default" | "secondary" | "outline" | "destructive" {
  if (status === "yes") return "default";
  if (status === "partial") return "secondary";
  if (status === "checking") return "outline";
  return "destructive";
}

function CapabilityTable() {
  const locale = useLocale();
  const L = LABELS[locale as Loc] ?? LABELS.vi;
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    let cancelled = false;
    const webglRows = probeWebGL();

    // No @webgpu/types dependency in this project — cast through `unknown`.
    const gpu = (navigator as unknown as { gpu?: MinimalGPU }).gpu;
    const gpuRows: Row[] = [
      {
        id: "webgpu-presence",
        label: { vi: "navigator.gpu", en: "navigator.gpu" },
        status: gpu ? "yes" : "no",
        detail: gpu ? "present" : "undefined",
      },
      {
        id: "webgpu-adapter",
        label: { vi: "GPU adapter", en: "GPU adapter" },
        status: gpu ? "checking" : "no",
        detail: gpu ? "" : "navigator.gpu missing",
      },
    ];
    // Browser-only probe (document/navigator.gpu) — cannot run during SSR or
    // render, so this necessarily lands in an effect rather than useState's
    // lazy initializer, which Next.js also executes on the server.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRows([...webglRows, ...gpuRows]);
    if (!gpu) return;

    gpu
      .requestAdapter()
      .then(async (adapter) => {
        if (cancelled) return;
        if (!adapter) {
          setRows((prev) =>
            prev.map((r) =>
              r.id === "webgpu-adapter"
                ? { ...r, status: "no", detail: "requestAdapter() -> null" }
                : r,
            ),
          );
          return;
        }
        const info = adapter.info ?? (await adapter.requestAdapterInfo?.());
        const detail =
          [info?.vendor, info?.architecture, info?.description]
            .filter(Boolean)
            .join(" / ") || "adapter acquired";
        setRows((prev) =>
          prev.map((r) =>
            r.id === "webgpu-adapter" ? { ...r, status: "yes", detail } : r,
          ),
        );
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "requestAdapter() threw";
        setRows((prev) =>
          prev.map((r) =>
            r.id === "webgpu-adapter" ? { ...r, status: "no", detail: message } : r,
          ),
        );
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="size-full overflow-auto p-3">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-muted-foreground border-b text-left">
            <th className="py-1.5 pr-2 font-medium">{L.feature}</th>
            <th className="py-1.5 pr-2 font-medium">{L.status}</th>
            <th className="py-1.5 font-medium">{L.detail}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b last:border-0">
              <td className="py-1.5 pr-2">{row.label[locale as Loc] ?? row.label.vi}</td>
              <td className="py-1.5 pr-2">
                <Badge variant={badgeVariant(row.status)}>
                  {row.status === "yes"
                    ? L.yes
                    : row.status === "partial"
                      ? L.partial
                      : row.status === "checking"
                        ? L.checking
                        : L.no}
                </Badge>
              </td>
              <td className="text-muted-foreground py-1.5 font-mono text-xs">
                {row.detail}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function WebglVsWebgpuDemo() {
  const locale = useLocale();
  const L = LABELS[locale as Loc] ?? LABELS.vi;

  return (
    <Demo title={L.title} ratio={16 / 9}>
      <CapabilityTable />
    </Demo>
  );
}
