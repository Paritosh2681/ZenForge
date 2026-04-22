'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidRendererProps {
  chart: string;
}

const DIAGRAM_PREFIXES = [
  'graph ',
  'flowchart ',
  'sequenceDiagram',
  'classDiagram',
  'stateDiagram',
  'stateDiagram-v2',
  'erDiagram',
  'journey',
  'gantt',
  'pie',
  'mindmap',
  'timeline',
  'gitGraph',
  'sankey-beta',
  'xychart-beta',
];

const STOP_MARKERS = [
  'in this mermaid diagram',
  'sources:',
  '--- page',
  'relevance:',
  'ask a question',
  'send',
];

function normalizeMermaidInput(chart: string): string | null {
  if (!chart?.trim()) return null;

  const fencedMatch = chart.match(/```mermaid\s*([\s\S]*?)```/i);
  const rawChart = fencedMatch ? fencedMatch[1] : chart;

  const lines = rawChart
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n');

  const cleanedLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('```')) continue;

    const lower = trimmed.toLowerCase();
    if (STOP_MARKERS.some((marker) => lower.includes(marker))) break;

    cleanedLines.push(trimmed);
  }

  if (cleanedLines.length === 0) return null;

  const first = cleanedLines[0];
  if (!DIAGRAM_PREFIXES.some((prefix) => first.startsWith(prefix))) {
    cleanedLines.unshift('flowchart TD');
  }

  return cleanedLines.join('\n').trim();
}

function buildFallbackFlowchart(text: string): string {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 12);

  if (lines.length === 0) return 'flowchart TD\nA[No diagram content]';

  const nodes = lines.map((line, i) => {
    const safe = line
      .replace(/"/g, "'")
      .replace(/\[/g, '(')
      .replace(/\]/g, ')')
      .replace(/`/g, "'")
      .slice(0, 120);
    return `N${i}["${safe}"]`;
  });

  const edges: string[] = [];
  for (let i = 0; i < nodes.length - 1; i += 1) {
    edges.push(`N${i} --> N${i + 1}`);
  }

  return ['flowchart TD', ...nodes, ...edges].join('\n');
}

export default function MermaidRenderer({ chart }: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!chart || !containerRef.current) return;

    // Normalize model output into a Mermaid-safe chart string.
    const cleanChart = normalizeMermaidInput(chart);
    if (!cleanChart) return;

    // Initialize mermaid
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'Inter, sans-serif',
    });

    const renderDiagram = async () => {
      setError(null);

      // Basic validation for common Mermaid syntax issues
      if (!DIAGRAM_PREFIXES.some((prefix) => cleanChart.startsWith(prefix))) {
        // Clear any leftover content
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div class="text-gray-500 text-center p-4">
              <p>Diagram rendering failed</p>
              <p class="text-sm mt-2">Please check the diagram syntax</p>
            </div>
          `;
        }
        setError('Invalid Mermaid diagram type');
        return;
      }

      const id = `mermaid-${Math.floor(Math.random() * 1000000)}-${Date.now()}`;
      try {
        const { svg } = await mermaid.render(id, cleanChart);
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (err) {
        // Clean up Mermaid's injected error SVG from the DOM to prevent multiple bomb icons!
        const errorSvg = document.getElementById(id);
        if (errorSvg) errorSvg.remove();
        
        const fallbackChart = buildFallbackFlowchart(cleanChart);
        const fallbackId = `mermaid-fallback-${Math.floor(Math.random() * 1000000)}-${Date.now()}`;
        try {
          // Retry with a guaranteed-valid flowchart fallback from raw text lines.
          const { svg } = await mermaid.render(fallbackId, fallbackChart);

          if (containerRef.current) {
            containerRef.current.innerHTML = svg;
          }
          setError(null);
        } catch (fallbackErr) {
          // Clean up the fallback error SVG as well
          const fallbackErrorSvg = document.getElementById(fallbackId);
          if (fallbackErrorSvg) fallbackErrorSvg.remove();
          
          console.error('Mermaid rendering error:', err);
          console.error('Mermaid fallback rendering error:', fallbackErr);
          setError('Failed to render diagram - Invalid syntax');

          // Clear any leftover content
          if (containerRef.current) {
            containerRef.current.innerHTML = `
              <div class="text-gray-500 text-center p-4">
                <p>Diagram rendering failed</p>
                <p class="text-sm mt-2">Please check the diagram syntax</p>
              </div>
            `;
          }
        }
      }
    };

    renderDiagram();
  }, [chart]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 overflow-auto">
      <div ref={containerRef} className="flex justify-center" />
    </div>
  );
}
