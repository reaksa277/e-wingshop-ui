"use client";

import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import {
  useListAllInventory,
  useLowStock,
  useExpiringSoon,
  useExpiredInventory,
  useAdjustStock,
  useTransferStock,
  useUpsertInventory,
  useBranches,
  useProducts,
} from "@/hooks";
import type { InventoryRequest } from "@/types";

// Shadcn UI Components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Loader2, ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import type { InventoryResponse } from "@/types";

type Tab = "all" | "low" | "expiring" | "expired";

export default function InventoryPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [branchId, setBranchId] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [inventoryForm, setInventoryForm] = useState<Partial<InventoryRequest>>({
    quantity: 0,
    lowStockThreshold: 10,
  });
  const [formErrors, setFormErrors] = useState<{
    branchId?: string;
    productId?: string;
    quantity?: string;
  }>({});

  // Adjust Stock Dialog State
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [adjustData, setAdjustData] = useState({
    productId: 0,
    branchId: 0,
    productName: "",
    quantity: "",
    reason: "Manual"
  });

  // Transfer Stock Dialog State
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [transferData, setTransferData] = useState({
    productId: 0,
    fromBranchId: 0,
    productName: "",
    toBranchId: "",
    quantity: ""
  });

  const { data: branches } = useBranches();
  const { data: products } = useProducts({ size: 1000 });
  const adjustStock = useAdjustStock();
  const transferStock = useTransferStock();
  const upsertInventory = useUpsertInventory();

  // Queries
  const selectedBranchId = branchId === "all" ? undefined : Number(branchId);
  const allQuery = useListAllInventory(page, 20, selectedBranchId);
  const lowQuery = useLowStock(selectedBranchId);
  const expiringQuery = useExpiringSoon(selectedBranchId, 30);
  const expiredQuery = useExpiredInventory();

  const rows = tab === "all" ? allQuery.data?.content
    : tab === "low" ? lowQuery.data
    : tab === "expiring" ? expiringQuery.data
    : expiredQuery.data;

  const isLoading = tab === "all" ? allQuery.isLoading
    : tab === "low" ? lowQuery.isLoading
    : tab === "expiring" ? expiringQuery.isLoading
    : expiredQuery.isLoading;

  const handleAdjust = (productId: number, bId: number, name: string) => {
    setAdjustData({
      productId,
      branchId: bId,
      productName: name,
      quantity: "",
      reason: "Manual"
    });
    setAdjustDialogOpen(true);
  };

  const handleAdjustSubmit = async () => {
    const delta = parseInt(adjustData.quantity, 10);
    if (isNaN(delta)) return;
    await adjustStock.mutateAsync({
      branchId: adjustData.branchId,
      productId: adjustData.productId,
      delta,
      reason: adjustData.reason
    });
    setAdjustDialogOpen(false);
    setAdjustData({ productId: 0, branchId: 0, productName: "", quantity: "", reason: "Manual" });
  };

  const handleTransfer = (productId: number, fromBranchId: number, name: string) => {
    setTransferData({
      productId,
      fromBranchId,
      productName: name,
      toBranchId: "",
      quantity: ""
    });
    setTransferDialogOpen(true);
  };

  const handleTransferSubmit = async () => {
    if (!transferData.toBranchId || !transferData.quantity) return;
    await transferStock.mutateAsync({
      fromBranchId: transferData.fromBranchId,
      toBranchId: Number(transferData.toBranchId),
      productId: transferData.productId,
      quantity: Number(transferData.quantity)
    });
    setTransferDialogOpen(false);
    setTransferData({ productId: 0, fromBranchId: 0, productName: "", toBranchId: "", quantity: "" });
  };

  const handleAddInventory = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const errors: { branchId?: string; productId?: string; quantity?: string } = {};

    if (!inventoryForm.branchId) {
      errors.branchId = 'Please select a branch';
    }

    if (!inventoryForm.productId) {
      errors.productId = 'Please select a product';
    }

    if (!inventoryForm.quantity || inventoryForm.quantity <= 0) {
      errors.quantity = 'Please enter a valid quantity (greater than 0)';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Clear errors and submit
    setFormErrors({});

    try {
      await upsertInventory.mutateAsync(inventoryForm as InventoryRequest);
      setShowAddForm(false);
      setInventoryForm({ quantity: 0, lowStockThreshold: 10 });
      setFormErrors({});
    } catch (error) {
      console.error('Failed to add inventory:', error);
    }
  };

  // Define columns for DataTable
  const columns: ColumnDef<InventoryResponse>[] = [
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
      cell: ({ row }) => row.getValue("branchName"),
    },
    {
      accessorKey: "quantity",
      header: "Qty",
      cell: ({ row }) => (
        <span className="font-bold">{row.getValue("quantity")}</span>
      ),
    },
    {
      accessorKey: "lowStockThreshold",
      header: "Threshold",
      cell: ({ row }) => (
        <span className="text-muted-foreground hidden md:table-cell">
          {row.getValue("lowStockThreshold")}
        </span>
      ),
    },
    {
      accessorKey: "expiryDate",
      header: "Expiry",
      cell: ({ row }) => {
        const inv = row.original;
        return (
          <div className="flex flex-col">
            <span className="text-sm">{inv.expiryDate ?? "—"}</span>
            {inv.daysUntilExpiry !== undefined && (
              <span className={`text-xs font-semibold ${
                inv.daysUntilExpiry < 0 ? "text-destructive" :
                inv.daysUntilExpiry <= 7 ? "text-accent" : "text-muted-foreground"
              }`}>
                {inv.daysUntilExpiry < 0 ? `${Math.abs(inv.daysUntilExpiry)}d ago` : `${inv.daysUntilExpiry}d left`}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "expired",
      header: "Status",
      cell: ({ row }) => {
        const inv = row.original;
        return (
          <Badge variant={inv.expired ? "destructive" : inv.lowStock ? "outline" : "secondary"} className={
            !inv.expired && !inv.lowStock ? "" : ""
          }>
            {inv.expired ? "Expired" : inv.lowStock ? "Low" : "OK"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const inv = row.original;
        return (
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAdjust(inv.productId, inv.branchId, inv.productName)}
              disabled={adjustStock.isPending}
            >
              {adjustStock.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Adjust
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTransfer(inv.productId, inv.branchId, inv.productName)}
              disabled={transferStock.isPending}
            >
              {transferStock.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Transfer
            </Button>
          </div>
        );
      },
    },
  ];

  const getRowClass = (row: InventoryResponse) => {
    if (row.expired) return "bg-red-50/50 hover:bg-red-50";
    if (row.lowStock) return "bg-amber-50/50 hover:bg-amber-50";
    return "";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Inventory</h2>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="mr-2 h-4 w-4" /> Add Inventory
          </Button>
          <Select
            value={branchId}
            onValueChange={(val) => { setBranchId(val); setPage(0); }}
          >
            <SelectTrigger className="w-50">
              <SelectValue placeholder="All Branches" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              {branches?.map((b) => (
                <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => { setTab(v as Tab); setPage(0); }}>
        <TabsList className="grid w-full grid-cols-2 md:w-auto md:flex">
          <TabsTrigger value="all">All Stock</TabsTrigger>
          <TabsTrigger value="low" className="gap-2">
            Low Stock
            {lowQuery.data?.length ? <Badge variant="destructive" className="h-5 px-1.5">{lowQuery.data.length}</Badge> : null}
          </TabsTrigger>
          <TabsTrigger value="expiring" className="gap-2">
            Expiring
            {expiringQuery.data?.length ? <Badge variant="outline" className="h-5 px-1.5">{expiringQuery.data.length}</Badge> : null}
          </TabsTrigger>
          <TabsTrigger value="expired">Expired</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Add Inventory Form */}
      {showAddForm && (
        <Card>
          <CardContent className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold">Add Stock Inventory</h3>
              <p className="text-sm text-muted-foreground">Add new inventory for a product at a specific branch</p>
            </div>
            <form onSubmit={handleAddInventory} className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Branch Selection */}
              <div className="space-y-2">
                <Label htmlFor="branch-select">Branch <span className="text-destructive">*</span></Label>
                <Select
                  value={inventoryForm.branchId?.toString()}
                  onValueChange={(v) => {
                    setInventoryForm((f) => ({ ...f, branchId: Number(v) }));
                    if (formErrors.branchId) {
                      setFormErrors((e) => ({ ...e, branchId: undefined }));
                    }
                  }}
                >
                  <SelectTrigger id="branch-select" className={formErrors.branchId ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select Branch *" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches?.map((b) => (
                      <SelectItem key={b.id} value={b.id.toString()}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.branchId && (
                  <p className="text-sm text-destructive">{formErrors.branchId}</p>
                )}
              </div>

              {/* Product Selection */}
              <div className="space-y-2">
                <Label htmlFor="product-select">Product <span className="text-destructive">*</span></Label>
                <Select
                  value={inventoryForm.productId?.toString()}
                  onValueChange={(v) => {
                    setInventoryForm((f) => ({
                      ...f,
                      productId: Number(v),
                    }));
                    if (formErrors.productId) {
                      setFormErrors((e) => ({ ...e, productId: undefined }));
                    }
                  }}
                >
                  <SelectTrigger id="product-select" className={formErrors.productId ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select Product *" />
                  </SelectTrigger>
                  <SelectContent>
                    {products?.content.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.name} {p.barcode ? `(${p.barcode})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.productId && (
                  <p className="text-sm text-destructive">{formErrors.productId}</p>
                )}
              </div>

              {/* Quantity Input */}
              <div className="space-y-2">
                <Label htmlFor="quantity-input">Quantity <span className="text-destructive">*</span></Label>
                <Input
                  id="quantity-input"
                  required
                  type="number"
                  placeholder="Enter quantity"
                  value={inventoryForm.quantity ?? ''}
                  onChange={(e) => {
                    setInventoryForm((f) => ({ ...f, quantity: Number(e.target.value) }));
                    if (formErrors.quantity) {
                      setFormErrors((e) => ({ ...e, quantity: undefined }));
                    }
                  }}
                  className={formErrors.quantity ? 'border-destructive' : ''}
                />
                {formErrors.quantity && (
                  <p className="text-sm text-destructive">{formErrors.quantity}</p>
                )}
              </div>

              {/* Low Stock Threshold Input */}
              <div className="space-y-2">
                <Label htmlFor="threshold-input">Low Stock Threshold</Label>
                <Input
                  id="threshold-input"
                  type="number"
                  placeholder="Enter threshold (optional)"
                  value={inventoryForm.lowStockThreshold ?? ''}
                  onChange={(e) => setInventoryForm((f) => ({ ...f, lowStockThreshold: Number(e.target.value) }))}
                />
              </div>

              {/* Expiry Date Input */}
              <div className="space-y-2">
                <Label htmlFor="expiry-input">Expiry Date</Label>
                <Input
                  id="expiry-input"
                  type="date"
                  placeholder="Select expiry date"
                  value={inventoryForm.expiryDate ?? ''}
                  onChange={(e) => setInventoryForm((f) => ({ ...f, expiryDate: e.target.value }))}
                />
              </div>

              {/* Form Actions */}
              <div className="flex items-end gap-4 md:col-span-2 lg:col-span-3">
                <Button type="submit" variant="default" disabled={upsertInventory.isPending}>
                  {upsertInventory.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {upsertInventory.isPending ? 'Adding...' : 'Add Inventory'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormErrors({});
                  }}
                >
                  Cancel
                </Button>
                {upsertInventory.isError && (
                  <span className="text-sm text-destructive font-medium">
                    Failed to add inventory. Please try again.
                  </span>
                )}
                {upsertInventory.isSuccess && showAddForm && (
                  <span className="text-sm text-primary font-medium">
                    ✓ Inventory added successfully!
                  </span>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={rows ?? []}
              filterColumn="productName"
              filterPlaceholder="Search products..."
              isLoading={isLoading}
              enablePagination={false}
              emptyState={{
                title: "No inventory found",
                description: "No items match your current filters.",
              }}
              getRowClass={getRowClass}
            />
          </CardContent>
        </Card>
      )}

      {tab === "all" && allQuery.data && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-muted-foreground">
            Page {allQuery.data.page + 1} of {allQuery.data.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={allQuery.data.first}
              onClick={() => setPage((p) => p - 1)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={allQuery.data.last}
              onClick={() => setPage((p) => p + 1)}
            >
              Next <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Adjust Stock Dialog */}
      <Dialog open={adjustDialogOpen} onOpenChange={setAdjustDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
            <DialogDescription>
              Adjust inventory for <span className="font-semibold">{adjustData.productName}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="adjust-quantity">Quantity Change</Label>
              <Input
                id="adjust-quantity"
                type="number"
                placeholder="Enter quantity (use - for reduction)"
                value={adjustData.quantity}
                onChange={(e) => setAdjustData({ ...adjustData, quantity: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Use negative numbers to reduce stock (e.g., -5)</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="adjust-reason">Reason</Label>
              <Input
                id="adjust-reason"
                type="text"
                placeholder="e.g., Manual correction, Damage, etc."
                value={adjustData.reason}
                onChange={(e) => setAdjustData({ ...adjustData, reason: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdjustSubmit} disabled={adjustStock.isPending || !adjustData.quantity}>
              {adjustStock.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Adjust Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer Stock Dialog */}
      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Stock</DialogTitle>
            <DialogDescription>
              Transfer <span className="font-semibold">{transferData.productName}</span> from {transferData.fromBranchId ? branches?.find(b => b.id === transferData.fromBranchId)?.name : "selected branch"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="transfer-to-branch">To Branch</Label>
              <Select value={transferData.toBranchId} onValueChange={(val) => setTransferData({ ...transferData, toBranchId: val })}>
                <SelectTrigger id="transfer-to-branch">
                  <SelectValue placeholder="Select destination branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches?.filter(b => b.id !== transferData.fromBranchId).map((b) => (
                    <SelectItem key={b.id} value={b.id.toString()}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="transfer-quantity">Quantity</Label>
              <Input
                id="transfer-quantity"
                type="number"
                placeholder="Enter quantity to transfer"
                value={transferData.quantity}
                onChange={(e) => setTransferData({ ...transferData, quantity: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleTransferSubmit} disabled={transferStock.isPending || !transferData.toBranchId || !transferData.quantity}>
              {transferStock.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Transfer Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
