"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Column<T> = {
  key: string;
  header: string;
  cell?: (item: T) => ReactNode;
};

type DataTableProps<T> = {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  className?: string;
};

export function DataTable<T>({ data, columns, keyExtractor, onRowClick, className }: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="p-8 text-center bg-card rounded-lg border border-neutral-variant text-neutral-variant-on">
        No data available
      </div>
    );
  }

  return (
    <div className={cn("overflow-x-auto rounded-lg border border-neutral-variant bg-card", className)}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-neutral-variant bg-neutral/30 text-label-sm font-semibold text-neutral-variant-on uppercase tracking-wider">
            {columns.map((col) => (
              <th key={col.key} className="px-6 py-4">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-body-sm text-neutral-on">
          {data.map((item, rowIndex) => (
            <tr 
              key={keyExtractor(item)} 
              className={cn(
                "border-b border-neutral-variant last:border-0 hover:bg-neutral/10 transition-colors",
                onRowClick && "cursor-pointer"
              )}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-6 py-4">
                  {col.cell ? col.cell(item) : (item as any)[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
