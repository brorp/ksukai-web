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
import { ChevronLeft, ChevronRight, ArrowUpDown, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Table<TData, TValue>({
  columns,
  data,
  onBulkUpdate,
}: {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onBulkUpdate?: (selectedRows: TData[]) => void;
}) {
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { rowSelection, sorting },
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();
  const hasData = data.length > 0;

  const paginationRange = useMemo(() => {
    const range: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) range.push(i);
    } else {
      range.push(1);
      if (currentPage > 3) range.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) if (!range.includes(i)) range.push(i);
      if (currentPage < totalPages - 2) range.push("...");
      if (!range.includes(totalPages)) range.push(totalPages);
    }
    return range;
  }, [currentPage, totalPages]);

  return (
    <div className="flex flex-col w-full h-full">
      <div className="rounded-4xl border border-slate-100 bg-white shadow-sm flex flex-col h-[calc(100vh-160px)] overflow-hidden">
        <div className="flex-1 overflow-auto no-scrollbar relative">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead className="sticky top-0 z-30">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header, index) => (
                    <th
                      key={header.id}
                      className={cn(
                        "px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 bg-slate-50/90 backdrop-blur-md border-b border-slate-100",
                        index === 0 &&
                          "rounded-tl-4xl sticky left-0 z-40 bg-slate-50",
                        index === headerGroup.headers.length - 1 &&
                          "rounded-tr-4xl sticky right-0 z-40 bg-slate-50",
                      )}
                    >
                      <div
                        className={cn(
                          "flex items-center gap-2",
                          header.column.getCanSort() &&
                            "cursor-pointer select-none",
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {header.column.getCanSort() && (
                          <ArrowUpDown size={10} />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-50">
              {hasData ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={cn(
                      "hover:bg-slate-50/50 transition-colors",
                      row.getIsSelected() ? "bg-primary-50/30" : "",
                    )}
                  >
                    {row.getVisibleCells().map((cell, index) => (
                      <td
                        key={cell.id}
                        className={cn(
                          "px-4 py-2 text-[13px] text-slate-600 font-medium",
                          cell.column.id === "pertanyaan" && "max-w-md",
                          index === 0 &&
                            "sticky left-0 bg-white group-hover:bg-slate-50/50 z-10",
                          index === row.getVisibleCells().length - 1 &&
                            "sticky right-0 bg-white group-hover:bg-slate-50/50 z-10",
                        )}
                      >
                        <div
                          className={cn(
                            cell.column.id === "pertanyaan" && "line-clamp-2",
                          )}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="h-full">
                    <div className="flex flex-col items-center justify-center py-24 text-slate-300">
                      <div className="bg-slate-50 p-4 rounded-3xl mb-4">
                        <Inbox size={40} strokeWidth={1.5} />
                      </div>
                      <p className="text-xs font-black uppercase tracking-widest">
                        Data Tidak Ditemukan
                      </p>
                      <p className="text-[10px] font-medium text-slate-400 mt-1">
                        Belum ada informasi yang bisa ditampilkan saat ini.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {hasData && (
          <div className="bg-white border-t border-slate-100 px-6 py-3 flex items-center justify-between z-30">
            <div className="flex items-center gap-3">
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
                className="bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 text-[10px] font-semibold text-primary outline-none"
              >
                {[10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {size} Rows
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft size={14} />
              </Button>
              {paginationRange.map((page, idx) => (
                <button
                  key={idx}
                  onClick={() =>
                    typeof page === "number" && table.setPageIndex(page - 1)
                  }
                  className={cn(
                    "h-7 min-w-7 text-[10px] font-bold rounded-lg",
                    currentPage === page
                      ? "bg-primary text-white shadow-sm shadow-primary/20"
                      : "text-slate-400 hover:bg-white",
                  )}
                >
                  {page}
                </button>
              ))}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
