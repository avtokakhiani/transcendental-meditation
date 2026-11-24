'use client';

import { Component, useEffect, useState, type ReactNode } from 'react';
import type { z } from 'zod';
import { comparisonPropsSchema } from '@/lib/articles/component-registry';

type Data = z.infer<typeof comparisonPropsSchema>;
class VisualBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  override state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  override render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
export function ComparisonTable({ data }: { data: Data }) {
  return <table className="w-full text-left text-sm"><caption className="pb-3 text-left">{data.title}</caption><thead><tr><th scope="col">მაჩვენებელი</th><th scope="col">მნიშვნელობა {data.unit}</th></tr></thead><tbody>{data.rows.map((row, index) => <tr key={index}><th scope="row" className="py-2 font-normal">{row.label}</th><td>{row.value} {data.unit}</td></tr>)}</tbody></table>;
}
function Comparison({ data }: { data: Data }) {
  const [active, setActive] = useState<number | null>(null);
  const maximum = Math.max(1, ...data.rows.map(row => Math.abs(row.value)));
  return <><div className="mb-5 space-y-3" aria-label={data.title}>{data.rows.map((row, index) => <button type="button" key={index} aria-pressed={active === index} className="block w-full rounded-lg border border-cream-300 p-3 text-left focus-visible:outline-2 focus-visible:outline-plum-700" onClick={() => setActive(active === index ? null : index)}><span className="flex justify-between gap-3 text-sm"><span>{row.label}</span><strong>{row.value} {data.unit}</strong></span><span className="mt-2 block h-3 rounded bg-cream-200" aria-hidden="true"><span className={`block h-full rounded ${active === index ? 'bg-saffron-500' : 'bg-plum-600'}`} style={{ width: `${Math.abs(row.value) / maximum * 100}%` }} /></span></button>)}</div><ComparisonTable data={data} /></>;
}
/** Untrusted implementation code never runs during SSR. Each instance has its own boundary. */
export function InteractiveVisual({ data }: { data: Data }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const fallback = <ComparisonTable data={data} />;
  return mounted ? <VisualBoundary fallback={fallback}><Comparison data={data} /></VisualBoundary> : fallback;
}
