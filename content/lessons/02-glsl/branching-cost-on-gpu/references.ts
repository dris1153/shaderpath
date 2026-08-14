import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "nvidia-cuda-simt-architecture",
    type: "spec",
    title: "CUDA C++ Programming Guide — SIMT Architecture",
    authors: ["NVIDIA"],
    url: "https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html#simt-architecture",
    note: {
      vi: "Nguồn chính thức định nghĩa warp = 32 thread và cơ chế execution mask khi các thread trong cùng warp phân kỳ — cùng khái niệm áp dụng cho fragment shader trên GPU NVIDIA.",
      en: "The official source defining a warp as 32 threads and the execution-mask mechanism when threads within a warp diverge — the same concept applies to fragment shaders on NVIDIA GPUs.",
    },
  },
  {
    id: "amd-rdna-whitepaper",
    type: "paper",
    title: "RDNA Architecture Whitepaper",
    authors: ["AMD"],
    url: "https://www.amd.com/system/files/documents/rdna-whitepaper.pdf",
    note: {
      vi: "Tài liệu chính thức của AMD giải thích wavefront, và vì sao RDNA chuyển từ wave64 cố định (GCN) sang hỗ trợ cả wave32 lẫn wave64.",
      en: "AMD's official document explaining wavefronts, and why RDNA moved from GCN's fixed wave64 to supporting both wave32 and wave64.",
    },
  },
  {
    id: "gpu-gems-2-flow-control",
    type: "article",
    title: "GPU Gems 2 — Chapter 34: GPU Flow-Control Idioms",
    authors: ["Mark Harris", "Ian Buck"],
    url: "https://developer.nvidia.com/gpugems/gpugems2/part-iv-general-purpose-computation-gpus-primer/chapter-34-gpu-flow-control-idioms",
    note: {
      vi: "Bài viết kinh điển về chi phí branching trên GPU và các kỹ thuật branchless idiom — nguồn gốc lịch sử của kỹ thuật step/mix mà track này dùng lại.",
      en: "The classic article on GPU branching cost and branchless idioms — the historical origin of the step/mix technique this track reuses.",
    },
  },
];
