'use client';

import { useState, useRef } from 'react';
import api from '@/lib/api-client';

interface ExecutionResult {
  execution_id: string;
  output: string;
  error: string | null;
  execution_time: number;
}

export default function CodeSandbox() {
  const [code, setCode] = useState<string>(`# Python Code Sandbox\n# Write your code here and click Run\n\ndef fibonacci(n):\n    """Generate fibonacci sequence"""\n    a, b = 0, 1\n    result = []\n    for _ in range(n):\n        result.append(a)\n        a, b = b, a + b\n    return result\n\nprint("Fibonacci(10):", fibonacci(10))\nprint("Sum:", sum(fibonacci(10)))`);
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [execTime, setExecTime] = useState<number | null>(null);
  const [history, setHistory] = useState<ExecutionResult[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const runCode = async () => {
    setIsRunning(true);
    setOutput('');
    setError(null);
    setExecTime(null);

    try {
      const result = await api.executeCode(code);
      setOutput(result.output);
      setError(result.error);
      setExecTime(result.execution_time);
      setHistory(prev => [result, ...prev].slice(0, 10));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Execution failed');
    } finally {
      setIsRunning(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      setCode(code.substring(0, start) + '    ' + code.substring(end));
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 4;
      }, 0);
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      runCode();
    }
  };

  const templates = [
    { name: 'Fibonacci', code: `def fibonacci(n):\n    a, b = 0, 1\n    for _ in range(n):\n        print(a, end=' ')\n        a, b = b, a + b\n\nfibonacci(15)` },
    { name: 'Sort', code: `nums = [64, 34, 25, 12, 22, 11, 90]\n\n# Bubble Sort\ndef bubble_sort(arr):\n    n = len(arr)\n    for i in range(n):\n        for j in range(0, n-i-1):\n            if arr[j] > arr[j+1]:\n                arr[j], arr[j+1] = arr[j+1], arr[j]\n    return arr\n\nprint("Sorted:", bubble_sort(nums.copy()))` },
    { name: 'Math', code: `import math\n\n# Quadratic formula\na, b, c = 1, -5, 6\ndisc = b**2 - 4*a*c\n\nif disc >= 0:\n    x1 = (-b + math.sqrt(disc)) / (2*a)\n    x2 = (-b - math.sqrt(disc)) / (2*a)\n    print(f"Roots: x1={x1}, x2={x2}")\nelse:\n    print("No real roots")` },
    { name: 'Statistics', code: `data = [23, 45, 12, 67, 34, 89, 45, 23, 56, 78]\n\nmean = sum(data) / len(data)\nsorted_data = sorted(data)\nn = len(sorted_data)\nmedian = (sorted_data[n//2] + sorted_data[n//2-1])/2 if n%2==0 else sorted_data[n//2]\nvariance = sum((x - mean)**2 for x in data) / len(data)\nstd_dev = variance**0.5\n\nprint(f"Mean: {mean:.2f}")\nprint(f"Median: {median}")\nprint(f"Std Dev: {std_dev:.2f}")\nprint(f"Min: {min(data)}, Max: {max(data)}")` },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Code Sandbox</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">Python</span>
          <span className="text-xs text-muted-foreground">Ctrl+Enter to run</span>
        </div>
      </div>

      {/* Templates */}
      <div className="flex gap-2 flex-wrap">
        <span className="text-sm text-muted-foreground">Templates:</span>
        {templates.map((t) => (
          <button
            key={t.name}
            onClick={() => setCode(t.code)}
            className="text-xs px-2 py-1 rounded bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Editor */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="bg-card px-3 py-2 border-b border-border flex items-center justify-between">
          <span className="text-sm font-medium">Editor</span>
          <button
            onClick={runCode}
            disabled={isRunning || !code.trim()}
            className="px-4 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm rounded font-medium transition-colors flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full"></span>
                Running...
              </>
            ) : (
              <>&#9654; Run</>
            )}
          </button>
        </div>
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full h-64 p-4 bg-[#1e1e1e] text-[#d4d4d4] font-mono text-sm resize-none focus:outline-none"
          spellCheck={false}
          placeholder="Write your Python code here..."
        />
      </div>

      {/* Output */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="bg-card px-3 py-2 border-b border-border flex items-center justify-between">
          <span className="text-sm font-medium">Output</span>
          {execTime !== null && (
            <span className="text-xs text-muted-foreground">Executed in {execTime}s</span>
          )}
        </div>
        <div className="p-4 bg-[#1e1e1e] min-h-[100px] max-h-[200px] overflow-y-auto">
          {isRunning ? (
            <div className="text-yellow-400 font-mono text-sm animate-pulse">Running code...</div>
          ) : error ? (
            <pre className="text-red-400 font-mono text-sm whitespace-pre-wrap">{error}</pre>
          ) : output ? (
            <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap">{output}</pre>
          ) : (
            <span className="text-gray-500 font-mono text-sm">Output will appear here...</span>
          )}
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="bg-card px-3 py-2 border-b border-border">
            <span className="text-sm font-medium">Recent Executions</span>
          </div>
          <div className="divide-y divide-border max-h-40 overflow-y-auto">
            {history.map((h, i) => (
              <div key={h.execution_id} className="px-3 py-2 text-xs flex items-center justify-between hover:bg-secondary/50">
                <span className={`font-mono ${h.error ? 'text-red-400' : 'text-green-400'}`}>
                  {h.error ? 'Error' : 'Success'} - {h.output.substring(0, 50) || h.error?.substring(0, 50)}...
                </span>
                <span className="text-muted-foreground">{h.execution_time}s</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
