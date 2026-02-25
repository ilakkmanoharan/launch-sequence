"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type ShapeType =
  | "circle"
  | "rounded-square"
  | "square"
  | "arrow-right"
  | "arrow-left"
  | "post-it"
  | "arrow-up"
  | "arrow-down"
  | "arrow-block-left"
  | "arrow-block-right"
  | "line"
  | "dotted-line";

type DashboardShape = {
  id: string;
  type: ShapeType;
  label: string;
  href: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

const STORAGE_KEY = "custom-dashboard-shapes-v1";

const SHAPE_OPTIONS: { type: ShapeType; label: string; color: string }[] = [
  { type: "circle", label: "Circle", color: "#f5d85a" },
  { type: "rounded-square", label: "Rounded square", color: "#b9dfec" },
  { type: "square", label: "Square", color: "#c7e8a6" },
  { type: "arrow-right", label: "Arrow right", color: "#f39ca2" },
  { type: "arrow-left", label: "Arrow left", color: "#d7c3df" },
  { type: "post-it", label: "Post-it", color: "#fee07a" },
  { type: "arrow-up", label: "Arrow up", color: "#b7e2cc" },
  { type: "arrow-down", label: "Arrow down", color: "#b7d6ff" },
  { type: "arrow-block-left", label: "Arrow block left", color: "#f7c8a5" },
  { type: "arrow-block-right", label: "Arrow block right", color: "#f3b6dd" },
  { type: "line", label: "Line", color: "#8fc4d8" },
  { type: "dotted-line", label: "Dotted line", color: "#8fc4d8" },
];

const defaultsByType: Record<ShapeType, Pick<DashboardShape, "width" | "height">> = {
  circle: { width: 220, height: 220 },
  "rounded-square": { width: 260, height: 210 },
  square: { width: 220, height: 220 },
  "arrow-right": { width: 290, height: 160 },
  "arrow-left": { width: 290, height: 160 },
  "post-it": { width: 230, height: 230 },
  "arrow-up": { width: 240, height: 200 },
  "arrow-down": { width: 240, height: 200 },
  "arrow-block-left": { width: 310, height: 160 },
  "arrow-block-right": { width: 310, height: 160 },
  line: { width: 260, height: 80 },
  "dotted-line": { width: 260, height: 80 },
};

function newShape(type: ShapeType, index: number): DashboardShape {
  const defaults = defaultsByType[type];
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type,
    label: `New ${type.replaceAll("-", " ")}`,
    href: "/",
    width: defaults.width,
    height: defaults.height,
    x: 40 + ((index * 30) % 400),
    y: 40 + ((index * 30) % 260),
  };
}

function getShapeStyle(type: ShapeType, color: string): React.CSSProperties {
  const base: React.CSSProperties = {
    background: color,
    width: "100%",
    height: "100%",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    overflow: "hidden",
  };

  if (type === "circle") return { ...base, borderRadius: "999px" };
  if (type === "rounded-square") return { ...base, borderRadius: "30px" };
  if (type === "square") return { ...base, borderRadius: "14px" };
  if (type === "post-it") {
    return {
      ...base,
      borderRadius: "14px",
      boxShadow: "inset -18px 18px 0px rgba(0,0,0,0.12)",
    };
  }
  if (type === "arrow-right") {
    return {
      ...base,
      clipPath: "polygon(0 0, 78% 0, 100% 50%, 78% 100%, 0 100%, 14% 50%)",
    };
  }
  if (type === "arrow-left") {
    return {
      ...base,
      clipPath: "polygon(22% 0, 100% 0, 86% 50%, 100% 100%, 22% 100%, 0 50%)",
    };
  }
  if (type === "arrow-up") {
    return {
      ...base,
      clipPath: "polygon(50% 0, 100% 35%, 78% 35%, 78% 100%, 22% 100%, 22% 35%, 0 35%)",
    };
  }
  if (type === "arrow-down") {
    return {
      ...base,
      clipPath: "polygon(22% 0, 78% 0, 78% 65%, 100% 65%, 50% 100%, 0 65%, 22% 65%)",
    };
  }
  if (type === "arrow-block-left") {
    return {
      ...base,
      clipPath: "polygon(0 50%, 18% 0, 100% 0, 100% 100%, 18% 100%)",
    };
  }
  if (type === "arrow-block-right") {
    return {
      ...base,
      clipPath: "polygon(0 0, 82% 0, 100% 50%, 82% 100%, 0 100%)",
    };
  }
  if (type === "line") {
    return {
      ...base,
      background: "transparent",
      borderTop: `6px solid ${color}`,
      marginTop: "32px",
    };
  }
  return {
    ...base,
    background: "transparent",
    borderTop: `6px dotted ${color}`,
    marginTop: "32px",
  };
}

function EnterButton({ type, href }: { type: ShapeType; href: string }) {
  const classes = useMemo(() => {
    const base =
      "absolute right-2 top-2 text-xs font-semibold transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cyan-500";
    if (type === "circle") return `${base} rounded-full bg-sky-900 text-white h-9 w-9`;
    if (type === "rounded-square") return `${base} rounded-lg bg-indigo-700 text-white px-3 py-1.5`;
    if (type === "square") return `${base} rounded-none bg-black text-white px-2 py-1`;
    if (type === "post-it") return `${base} rounded-md bg-amber-800 text-white px-3 py-1`;
    if (type === "line" || type === "dotted-line") return `${base} rounded-full bg-sky-700 text-white px-3 py-1`;
    return `${base} rounded-2xl border-2 border-black bg-white px-3 py-1`;
  }, [type]);

  return (
    <Link href={href || "/"} className={classes}>
      ↦
    </Link>
  );
}

export default function DashboardPage() {
  const [shapes, setShapes] = useState<DashboardShape[]>(() => {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as DashboardShape[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [showPicker, setShowPicker] = useState(false);
  const [dragging, setDragging] = useState<null | { id: string; dx: number; dy: number }>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shapes));
  }, [shapes]);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (ev: MouseEvent) => {
      setShapes((prev) =>
        prev.map((item) =>
          item.id === dragging.id
            ? { ...item, x: Math.max(0, ev.clientX - dragging.dx), y: Math.max(0, ev.clientY - dragging.dy) }
            : item,
        ),
      );
    };
    const onUp = () => setDragging(null);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging]);

  const addShape = (type: ShapeType) => {
    setShapes((prev) => [...prev, newShape(type, prev.length)]);
    setShowPicker(false);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] rounded-2xl bg-[#ececec] p-6 relative overflow-auto">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Custom Dashboard Builder</h1>
        <p className="text-sm text-zinc-600">Drag, resize, edit text, and set each shape&apos;s destination URL.</p>
      </div>

      <button
        type="button"
        onClick={() => setShowPicker((s) => !s)}
        className="fixed left-6 top-28 z-30 h-16 w-16 rounded-full bg-sky-200 text-4xl leading-none shadow-md hover:bg-sky-300"
        aria-label="Add shape"
      >
        +
      </button>

      {showPicker ? (
        <div className="fixed left-24 top-24 z-30 w-72 rounded-xl border border-zinc-300 bg-white p-3 shadow-lg">
          <div className="mb-2 text-sm font-semibold">Add a shape</div>
          <div className="grid grid-cols-2 gap-2">
            {SHAPE_OPTIONS.map((opt) => (
              <button
                key={opt.type}
                type="button"
                onClick={() => addShape(opt.type)}
                className="rounded-md border border-zinc-200 px-2 py-1 text-left text-xs hover:bg-zinc-100"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="relative min-h-[78vh]">
        {shapes.map((shape) => {
          const color = SHAPE_OPTIONS.find((opt) => opt.type === shape.type)?.color ?? "#b9dfec";
          const isLine = shape.type === "line" || shape.type === "dotted-line";
          return (
            <div
              key={shape.id}
              className="absolute"
              style={{ left: shape.x, top: shape.y, width: shape.width, height: shape.height }}
            >
              <div
                className="absolute left-2 top-2 z-20 cursor-move rounded-full bg-black/70 px-2 py-0.5 text-xs text-white"
                onMouseDown={(ev) => {
                  ev.preventDefault();
                  setDragging({ id: shape.id, dx: ev.clientX - shape.x, dy: ev.clientY - shape.y });
                }}
              >
                drag
              </div>

              <div
                className="absolute bottom-2 right-2 z-20 h-4 w-4 cursor-se-resize rounded-sm border border-zinc-800 bg-white"
                onMouseDown={(ev) => {
                  ev.preventDefault();
                  const startX = ev.clientX;
                  const startY = ev.clientY;
                  const startW = shape.width;
                  const startH = shape.height;
                  const onMove = (moveEv: MouseEvent) => {
                    setShapes((prev) =>
                      prev.map((item) =>
                        item.id === shape.id
                          ? {
                              ...item,
                              width: Math.max(140, startW + moveEv.clientX - startX),
                              height: Math.max(70, startH + moveEv.clientY - startY),
                            }
                          : item,
                      ),
                    );
                  };
                  const onUp = () => {
                    window.removeEventListener("mousemove", onMove);
                    window.removeEventListener("mouseup", onUp);
                  };
                  window.addEventListener("mousemove", onMove);
                  window.addEventListener("mouseup", onUp);
                }}
              />

              <div style={getShapeStyle(shape.type, color)}>
                <textarea
                  className="mx-8 resize-none bg-transparent text-center text-xl font-medium outline-none"
                  value={shape.label}
                  onChange={(ev) =>
                    setShapes((prev) => prev.map((item) => (item.id === shape.id ? { ...item, label: ev.target.value } : item)))
                  }
                  rows={isLine ? 1 : 3}
                />
                <EnterButton type={shape.type} href={shape.href} />

                <button
                  type="button"
                  className="absolute left-2 bottom-2 rounded-full bg-red-600 px-2 py-1 text-xs text-white"
                  onClick={() => setShapes((prev) => prev.filter((item) => item.id !== shape.id))}
                >
                  remove
                </button>
              </div>

              <input
                value={shape.href}
                onChange={(ev) =>
                  setShapes((prev) => prev.map((item) => (item.id === shape.id ? { ...item, href: ev.target.value } : item)))
                }
                className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs"
                placeholder="Enter destination URL e.g. /resume"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
