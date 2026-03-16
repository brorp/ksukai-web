"use client";

import React, { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onBulkUpdate?: (selectedRows: TData[]) => void;
  onSortChange?: (sortKey: string, direction: "asc" | "desc") => void;
}

export function Table<TData, TValue>({
  columns,
  data,
  onBulkUpdate,
  onSortChange,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { rowSelection, sorting },
    onRowSelectionChange: setRowSelection,
    onSortingChange: (updater) => {
      const nextState =
        typeof updater === "function" ? updater(sorting) : updater;
      setSorting(nextState);
      if (nextState.length > 0) {
        onSortChange?.(nextState[0].id, nextState[0].desc ? "desc" : "asc");
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // --- Logic Pagination: Collapse if > 5 pages ---
  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();

  const paginationRange = useMemo(() => {
    const range: (number | string)[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) range.push(i);
    } else {
      range.push(1); // Selalu tampilkan halaman pertama

      if (currentPage > 3) range.push("...");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!range.includes(i)) range.push(i);
      }

      if (currentPage < totalPages - 2) range.push("...");

      if (!range.includes(totalPages)) range.push(totalPages);
    }
    return range;
  }, [currentPage, totalPages]);

  const selectedRows = table.getFilteredSelectedRowModel().rows;

  return (
    <div className="space-y-4">
      {/* Bulk Action Toolbar */}
      {selectedRows.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
              {selectedRows.length}
            </span>
            <span className="text-sm font-medium text-blue-700">
              soal terpilih
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50"
              onClick={() =>
                onBulkUpdate?.(selectedRows.map((r) => r.original))
              }
            >
              Update Status Masal
            </Button>
            <Button size="sm" variant="destructive">
              Hapus Masal
            </Button>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-200">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const isStickyLeft = header.column.id === "select";
                    const isStickyRight = header.column.id === "actions";

                    return (
                      <th
                        key={header.id}
                        className={cn(
                          "px-4 py-4 text-[11px] font-semibold uppercase tracking-widest text-slate-400 transition-colors",
                          header.column.getCanSort() &&
                            "cursor-pointer hover:text-slate-600 select-none",
                          isStickyLeft &&
                            "sticky left-0 z-20 bg-slate-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]",
                          isStickyRight &&
                            "sticky right-0 z-20 bg-slate-50 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)]",
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center gap-2">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {header.column.getCanSort() && (
                            <span className="text-slate-300">
                              {{
                                asc: (
                                  <ArrowUp
                                    size={12}
                                    className="text-blue-500"
                                  />
                                ),
                                desc: (
                                  <ArrowDown
                                    size={12}
                                    className="text-blue-500"
                                  />
                                ),
                              }[header.column.getIsSorted() as string] ?? (
                                <ArrowUpDown size={12} />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-100">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    "hover:bg-slate-50/50 transition-colors group",
                    row.getIsSelected() ? "bg-blue-50/30" : "",
                  )}
                >
                  {row.getVisibleCells().map((cell) => {
                    const isStickyLeft = cell.column.id === "select";
                    const isStickyRight = cell.column.id === "actions";

                    return (
                      <td
                        key={cell.id}
                        className={cn(
                          "px-4 py-4 text-sm text-slate-600",
                          isStickyLeft &&
                            "sticky left-0 z-10 bg-white group-hover:bg-slate-50/50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]",
                          isStickyRight &&
                            "sticky right-0 z-10 bg-white group-hover:bg-slate-50/50 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)]",
                          row.getIsSelected() &&
                            (isStickyLeft || isStickyRight) &&
                            "bg-blue-50/40",
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-4 bg-white border-t border-slate-100">
        {/* Sisi Kiri: Page Size & Info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Rows
            </span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
            >
              {[10, 20, 50, 100].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
          <p className="text-[11px] font-medium text-slate-400 hidden md:block">
            Showing{" "}
            <span className="text-slate-900 font-bold">
              {table.getRowModel().rows.length}
            </span>{" "}
            of{" "}
            <span className="text-slate-900 font-bold">
              {table.getFilteredRowModel().rows.length}
            </span>
          </p>
        </div>

        {/* Sisi Kanan: Pagination Control */}
        <div className="flex items-center gap-1.5">
          {/* Navigasi Kiri */}
          <Button
            variant="ghost"
            className="h-9 w-9 p-0 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition-all active:scale-90"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft size={18} />
          </Button>

          {/* Angka Halaman - Gaya Floating Pill */}
          <div className="flex items-center gap-1 px-1.5 py-1 bg-slate-50 rounded-2xl border border-slate-100">
            {paginationRange.map((page, idx) => (
              <React.Fragment key={idx}>
                {page === "..." ? (
                  <span className="w-6 text-center text-slate-300 text-[10px] font-semibold tracking-widest">
                    ...
                  </span>
                ) : (
                  <button
                    onClick={() => table.setPageIndex((page as number) - 1)}
                    className={cn(
                      "h-7 min-w-[28px] px-1.5 text-[11px] font-semibold rounded-lg transition-all",
                      currentPage === page
                        ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200/50"
                        : "text-slate-400 hover:text-slate-600 hover:bg-white/50",
                    )}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Navigasi Kanan */}
          <Button
            variant="ghost"
            className="h-9 w-9 p-0 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition-all active:scale-90"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
