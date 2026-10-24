"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** A number that counts up to its value when it appears or changes. */
export function CountUp({ value, format }: { value: number; format: (n: number) => string }) {
  const [shown, setShown] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    const dur = reduced() ? 0 : 900;
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const tick = (t: number) => {
      const k = dur ? Math.min(1, (t - start) / dur) : 1;
      setShown(a + (value - a) * (1 - (1 - k) ** 3));
      if (k < 1) raf = requestAnimationFrame(tick);
      else from.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span className="tabular-nums">{format(shown)}</span>;
}

/** Fades its children in the first time they scroll into view. Content already on screen shows at once. */
export function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced() || !("IntersectionObserver" in window)) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setShown(true);
        io.disconnect();
      }
    }, { rootMargin: "0px 0px -8% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} data-shown={shown ? "" : undefined} className={`reveal ${className}`}>{children}</div>;
}

/** Text that types itself out, then cycles to the next line, like a prompt being written. */
export function Typewriter({ lines }: { lines: string[] }) {
  const [i, setI] = useState(0);
  const [n, setN] = useState(0);
  useEffect(() => {
    if (reduced()) {  // show the whole line at once, no cycling
      const t = setTimeout(() => setN(lines[i].length), 0);
      return () => clearTimeout(t);
    }
    const full = n >= lines[i].length;
    const t = setTimeout(() => {
      if (!full) setN(n + 1);
      else {
        setI((i + 1) % lines.length);
        setN(0);
      }
    }, full ? 2200 : 45);
    return () => clearTimeout(t);
  }, [i, n, lines]);
  return (
    <span>
      {lines[i].slice(0, n)}
      <span aria-hidden="true" className="animate-caret ml-px inline-block h-[1.1em] w-px translate-y-[0.15em] bg-current" />
    </span>
  );
}
