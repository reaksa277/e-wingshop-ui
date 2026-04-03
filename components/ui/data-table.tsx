"use client";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type DataTableSortingState = SortingState;
export type DataTableColumnFiltersState = ColumnFiltersState;

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  /**
   * Column to filter by (uses the column id)
   * Shows a search input if specified
   */
  filterColumn?: string;
  filterPlaceholder?: string;
  /**
   * Enable row selection
   */
  enableRowSelection?: boolean;
  onRowSelect?: (rows: TData[]) => void;
  /**
   * Enable sorting
   */
  enableSorting?: boolean;
  /**
   * Enable pagination
   */
  enablePagination?: boolean;
  pageSize?: number;
  /**
   * Total count for server-side pagination (optional)
   * If provided, shows total count instead of current page count
   */
  totalCount?: number;
  /**
   * Custom actions column
   */
  actionsColumn?: {
    header: string;
    render: (row: TData) => React.ReactNode;
  };
  /**
   * Empty state
   */
  emptyState?: {
    title: string;
    description?: string;
  };
  /**
   * Loading state
   */
  isLoading?: boolean;
  /**
   * Additional toolbar actions
   */
  toolbarActions?: React.ReactNode;
  /**
   * Custom row class based on row data
   */
  getRowClass?: (row: TData) => string;
  className?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filterColumn,
  filterPlaceholder = "Search...",
  enableRowSelection = false,
  onRowSelect,
  enableSorting = true,
  enablePagination = true,
  pageSize = 10,
  totalCount,
  actionsColumn,
  emptyState = {
    title: "No results",
    description: "No data available to display.",
  },
  isLoading = false,
  toolbarActions,
  getRowClass,
  className,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  // Add actions column if provided
  const allColumns = React.useMemo(() => {
    if (!actionsColumn) return columns;
    return [
      ...columns,
      {
        id: "actions",
        header: actionsColumn.header,
        cell: ({ row }) => actionsColumn.render(row.original),
        enableSorting: false,
        enableHiding: false,
      } as ColumnDef<TData, TValue>,
    ];
  }, [columns, actionsColumn]);

  const table = useReactTable({
    data,
    columns: allColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter: filterColumn ? undefined : globalFilter,
    },
    enableRowSelection,
    enableSorting,
    enableGlobalFilter: !filterColumn,
  });

  // Call onRowSelect when selection changes
  React.useEffect(() => {
    if (onRowSelect && enableRowSelection) {
      const selectedRows = table
        .getFilteredSelectedRowModel()
        .rows.map((row) => row.original);
      onRowSelect(selectedRows);
    }
  }, [rowSelection, onRowSelect, enableRowSelection, table]);

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {filterColumn ? (
            <Input
              placeholder={filterPlaceholder}
              value={
                (table.getColumn(filterColumn)?.getFilterValue() as string) ??
                ""
              }
              onChange={(event) =>
                table.getColumn(filterColumn)?.setFilterValue(event.target.value)
              }
              className="h-8 w-37.5 lg:w-62.5"
            />
          ) : (
            <Input
              placeholder={filterPlaceholder}
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="h-8 w-37.5 lg:w-62.5"
            />
          )}
        </div>
        <div className="flex items-center gap-2">
          {toolbarActions}
          {enablePagination && (
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-17.5 lg:w-15.625">
                <SelectValue placeholder={pageSize.toString()} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      enableSorting && header.column.getCanSort()
                        ? "cursor-pointer select-none"
                        : ""
                    )}
                    onClick={
                      enableSorting && header.column.getCanSort()
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {enableSorting && header.column.getCanSort() && (
                        <span className="shrink-0">
                          {header.column.getIsSorted() === "desc" ? (
                            <ArrowDown className="h-4 w-4" />
                          ) : header.column.getIsSorted() === "asc" ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : (
                            <ArrowUpDown className="h-4 w-4 opacity-50" />
                          )}
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading skeleton rows
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`} className="animate-pulse">
                  {allColumns.map((_, j) => (
                    <TableCell key={`skeleton-${i}-${j}`}>
                      <div className="h-4 w-full bg-muted rounded" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={getRowClass?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={allColumns.length}
                  className="h-24 text-center"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="rounded-full bg-muted p-3">
                      <MoreHorizontal className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium">{emptyState.title}</p>
                      {emptyState.description && (
                        <p className="text-sm text-muted-foreground">
                          {emptyState.description}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {enablePagination && (
        <div className="flex items-center justify-between gap-4">
          {enableRowSelection && (
            <div className="text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {totalCount ?? table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
          )}
          {!enableRowSelection && (
            <div className="text-sm text-muted-foreground">
              {totalCount ?? table.getFilteredRowModel().rows.length} row(s)
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-xs"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon-xs"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon-xs"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon-xs"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span>
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount() || 1}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
