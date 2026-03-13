"use client";

import type { ReactNode } from "react";

interface SimpleTableProps {
  loading: boolean;
  headers: string[];
  rows: Array<Array<string | ReactNode>>;
  emptyText: string;
}

export default function SimpleTable({
  loading,
  headers,
  rows,
  emptyText,
}: SimpleTableProps) {
  return (
    <div className="rounded-lg border border-slate-200 overflow-auto bg-white">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="bg-slate-50">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="text-left px-4 py-3 font-semibold text-slate-600"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td className="px-4 py-8 text-slate-500" colSpan={headers.length}>
                Memuat data...
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td className="px-4 py-8 text-slate-500" colSpan={headers.length}>
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-t border-slate-100">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-3 align-top text-slate-700">
                    <div className="max-w-[380px] break-words">{cell}</div>
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
