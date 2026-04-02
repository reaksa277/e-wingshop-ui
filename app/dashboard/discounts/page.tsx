"use client";

import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import {
  useActiveDiscounts,
  useDiscountTiers,
  useCreateDiscount,
  useAutoApplyDiscounts,
  useRevokeDiscount,
  useExpiringSoon,
  useBranches,
} from "@/hooks";
import type { CreateDiscountRequest, DiscountTier } from "@/types";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";

export default function DiscountsPage() {
  const [branchId, setBranchId] = useState<number | undefined>();
  const [page, setPage] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<CreateDiscountRequest>>({ tier: "ONE_WEEK" });

  const { data: branches } = useBranches();
  const { data: discounts, isLoading } = useActiveDiscounts(branchId, page, 20);
  const { data: tiers } = useDiscountTiers();
  const { data: expiring } = useExpiringSoon(branchId, 30);

  const createDiscount = useCreateDiscount();
  const autoApply = useAutoApplyDiscounts();
  const revoke = useRevokeDiscount();

  async function handleAutoApply(tier: DiscountTier) {
    const r = await autoApply.mutateAsync({ tier, branchId });
    alert(r.message);
  }

  async function handleRevoke(id: number, name: string) {
    const reason = prompt(`Reason for revoking discount on "${name}":`);
    if (!reason) return;
    await revoke.mutateAsync({ id, reason });
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.inventoryId || !form.tier) return;
    await createDiscount.mutateAsync(form as CreateDiscountRequest);
    setShowForm(false);
    setForm({ tier: "ONE_WEEK" });
  }

  const noDiscountCount =
    expiring?.filter((inv) => !discounts?.content.some((d) => d.inventoryId === inv.id)).length ?? 0;

  // Define columns for DataTable
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "productName",
      header: "Product",
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("productName")}</span>
      ),
    },
    {
      accessorKey: "branchName",
      header: "Branch",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">{row.getValue("branchName")}</span>
      ),
    },
    {
      accessorKey: "currentStock",
      header: "Stock",
      cell: ({ row }) => row.getValue("currentStock"),
    },
    {
      accessorKey: "tierLabel",
      header: "Tier",
      cell: ({ row }) => (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          {row.getValue("tierLabel")}
        </Badge>
      ),
    },
    {
      accessorKey: "originalPrice",
      header: "Was",
      cell: ({ row }) => (
        <span className="text-muted-foreground line-through">
          ${Number(row.getValue("originalPrice")).toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: "discountPct",
      header: "Disc.",
      cell: ({ row }) => (
        <span className="font-bold text-destructive">-{row.getValue("discountPct")}%</span>
      ),
    },
    {
      accessorKey: "discountedPrice",
      header: "Now",
      cell: ({ row }) => (
        <span className="font-bold text-green-600">
          ${Number(row.getValue("discountedPrice")).toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: "savingsAmount",
      header: "Saves",
      cell: ({ row }) => (
        <span className="text-xs">${Number(row.getValue("savingsAmount")).toFixed(2)}</span>
      ),
    },
    {
      accessorKey: "expiryDate",
      header: "Expiry",
      cell: ({ row }) => {
        const d = row.original;
        return (
          <div className="flex flex-col text-xs">
            <span>{d.expiryDate ?? "—"}</span>
            {d.daysUntilExpiry !== undefined && (
              <span
                className={`font-bold ${
                  d.daysUntilExpiry <= 3 ? "text-destructive" : "text-amber-600"
                }`}
              >
                {d.daysUntilExpiry}d left
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const d = row.original;
        return (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleRevoke(d.id, d.productName)}
            disabled={revoke.isPending}
          >
            Revoke
          </Button>
        );
      },
    },
  ];

  const getRowClass = (row: any) => {
    if (row.daysUntilExpiry !== undefined && row.daysUntilExpiry <= 3) {
      return "bg-red-50/50";
    }
    return "";
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Expiry Discounts</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" /> New Discount
        </Button>
      </div>

      {/* Filter Section */}
      <div className="w-60">
        <Select
          value={branchId?.toString() ?? "all"}
          onValueChange={(v) => {
            setBranchId(v === "all" ? undefined : Number(v));
            setPage(0);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Branches" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Branches</SelectItem>
            {branches?.map((b) => (
              <SelectItem key={b.id} value={b.id.toString()}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Alert banner */}
      {noDiscountCount > 0 && (
        <Alert variant="destructive" className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4" />
          <div className="flex w-full items-center justify-between">
            <div>
              <AlertTitle>Expiring Soon</AlertTitle>
              <AlertDescription>
                <strong>{noDiscountCount}</strong> items have no active discount.
              </AlertDescription>
            </div>
            <div className="flex gap-2">
              {tiers
                ?.filter((t) => t.tier !== "CUSTOM")
                .map((t) => (
                  <Button
                    key={t.tier}
                    size="sm"
                    variant="secondary"
                    onClick={() => handleAutoApply(t.tier)}
                    disabled={autoApply.isPending}
                  >
                    Auto-apply {t.label}
                  </Button>
                ))}
            </div>
          </div>
        </Alert>
      )}

      {/* Create form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Create Discount</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <Input
                required
                type="number"
                placeholder="Inventory ID *"
                value={form.inventoryId ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, inventoryId: Number(e.target.value) }))}
              />
              <Select
                value={form.tier}
                onValueChange={(v) => setForm((f) => ({ ...f, tier: v as DiscountTier }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tiers?.map((t) => (
                    <SelectItem key={t.tier} value={t.tier}>
                      {t.label} ({t.defaultRatePct}% default)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                step="0.01"
                placeholder="Override %"
                value={form.discountPct ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    discountPct: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
              />
              {form.tier === "CUSTOM" && (
                <Input
                  type="date"
                  required
                  value={form.validUntil ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, validUntil: e.target.value }))}
                />
              )}
              <Input
                className="md:col-span-4"
                placeholder="Note"
                value={form.note ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              />
              <div className="md:col-span-4 flex items-center gap-4">
                <Button type="submit" variant="default" disabled={createDiscount.isPending}>
                  {createDiscount.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                {createDiscount.isError && (
                  <span className="text-sm text-destructive font-medium">
                    {(createDiscount.error as Error).message}
                  </span>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="rounded-md border bg-card">
          <DataTable
            columns={columns}
            data={discounts?.content ?? []}
            filterColumn="productName"
            filterPlaceholder="Search discounts..."
            isLoading={isLoading}
            enablePagination={false}
            emptyState={{
              title: "No discounts found",
              description: "No active discounts match your current filters.",
            }}
            getRowClass={getRowClass}
          />
        </div>
      )}

      {/* Pagination */}
      {discounts && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {discounts.page + 1} of {discounts.totalPages} ({discounts.totalElements} active)
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={discounts.first}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={discounts.last}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
