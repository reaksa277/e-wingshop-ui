"use client";

import { useState, useEffect } from "react";
import { 
  useInventoryByBranch, 
  useListAllInventory,
  useLowStock, 
  useExpiringSoon, 
  useExpiredInventory, 
  useAdjustStock, 
  useTransferStock, 
  useBranches,
  useMe
} from "@/hooks";

// Shadcn UI Components
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
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
import { Loader2, ArrowLeft, ArrowRight } from "lucide-react";

type Tab = "all" | "low" | "expiring" | "expired";

export default function InventoryPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [branchId, setBranchId] = useState<string>("all");
  const [page, setPage] = useState(0);

  // Get current user
  const { data: currentUser } = useMe();
  const isManager = currentUser?.role === "MANAGER";

  // When user data loads and they are a manager, set their branch
  useEffect(() => {
    if (isManager && currentUser?.branchId) {
      setBranchId(currentUser.branchId.toString());
    }
  }, [isManager, currentUser?.branchId]);

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
  const adjustStock = useAdjustStock();
  const transferStock = useTransferStock();

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

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Inventory</h2>
        
        <Select 
          value={branchId} 
          onValueChange={(val) => { setBranchId(val); setPage(0); }}
          disabled={isManager}
        >
          <SelectTrigger className="w-50" disabled={isManager}>
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

      <Tabs value={tab} onValueChange={(v) => { setTab(v as Tab); setPage(0); }}>
        <TabsList className="grid w-full grid-cols-2 md:w-auto md:flex">
          <TabsTrigger value="all">All Stock</TabsTrigger>
          <TabsTrigger value="low" className="gap-2">
            Low Stock 
            {lowQuery.data?.length ? <Badge variant="destructive" className="h-5 px-1.5">{lowQuery.data.length}</Badge> : null}
          </TabsTrigger>
          <TabsTrigger value="expiring" className="gap-2">
            Expiring
            {expiringQuery.data?.length ? <Badge variant="outline" className="h-5 px-1.5 bg-orange-100 text-orange-700 border-orange-200">{expiringQuery.data.length}</Badge> : null}
          </TabsTrigger>
          <TabsTrigger value="expired">Expired</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead className="hidden md:table-cell">Threshold</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows?.map((inv) => (
                  <TableRow 
                    key={inv.id}
                    className={
                        inv.expired ? "bg-red-50/50 hover:bg-red-50" : 
                        inv.lowStock ? "bg-amber-50/50 hover:bg-amber-50" : ""
                    }
                  >
                    <TableCell className="font-medium">{inv.productName}</TableCell>
                    <TableCell>{inv.branchName}</TableCell>
                    <TableCell className="font-bold">{inv.quantity}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{inv.lowStockThreshold}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{inv.expiryDate ?? "—"}</span>
                        {inv.daysUntilExpiry !== undefined && (
                          <span className={`text-xs font-semibold ${
                            inv.daysUntilExpiry < 0 ? "text-red-600" : 
                            inv.daysUntilExpiry <= 7 ? "text-orange-600" : "text-muted-foreground"
                          }`}>
                            {inv.daysUntilExpiry < 0 ? `${Math.abs(inv.daysUntilExpiry)}d ago` : `${inv.daysUntilExpiry}d left`}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={inv.expired ? "destructive" : inv.lowStock ? "outline" : "secondary"} className={
                        !inv.expired && !inv.lowStock ? "bg-green-100 text-green-800 hover:bg-green-100 border-transparent" : ""
                      }>
                        {inv.expired ? "Expired" : inv.lowStock ? "Low" : "OK"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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