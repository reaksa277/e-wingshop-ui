'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Phone, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { DataTable } from '@/components/ui/data-table';
import { authService } from '@/services/auth.service';
import { tokenStore } from '@/lib/api-client';
import type { BranchResponse, BranchRequest } from '@/types';
import {
  useBranches,
  useCreateBranch,
  useUpdateBranch,
  useDeleteBranch,
} from '@/hooks/use-branches';

const branchFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().min(1, 'Phone is required'),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
});

type BranchFormData = z.infer<typeof branchFormSchema>;

export default function BranchesPage() {
  const isAuthenticated = !!tokenStore.getAccess();

  const { data: userData } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => authService.me(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchResponse | null>(null);

  const { data: branchesData, isLoading } = useBranches();

  const createBranchMutation = useCreateBranch();
  const updateBranchMutation = useUpdateBranch(editingBranch?.id || 0);
  const deleteBranchMutation = useDeleteBranch();

  const form = useForm({
    resolver: zodResolver(branchFormSchema),
    defaultValues: {
      name: '',
      address: '',
      phone: '',
      latitude: undefined,
      longitude: undefined,
    },
  });

  const isSuperadmin = userData?.role === 'SUPERADMIN' || userData?.role === 'MANAGER';

  // Define columns for DataTable
  const columns: ColumnDef<BranchResponse>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => <span className="font-medium">{row.getValue('name')}</span>,
    },
    {
      accessorKey: 'address',
      header: 'Address',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{row.getValue('address')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{row.getValue('phone') || '—'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => new Date(row.getValue('createdAt') as string).toLocaleDateString(),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const branch = row.original;
        if (!isSuperadmin) return null;
        return (
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="icon" onClick={() => handleEdit(branch)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(branch.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        );
      },
    },
  ];

  const onSubmit = async (data: BranchFormData) => {
    const branchRequest: BranchRequest = {
      name: data.name,
      address: data.address,
      phone: data.phone,
      latitude: data.latitude,
      longitude: data.longitude,
    };

    if (editingBranch) {
      updateBranchMutation.mutate(branchRequest, {
        onSuccess: () => {
          toast.success('Branch updated successfully');
          setIsDialogOpen(false);
          setEditingBranch(null);
        },
        onError: () => toast.error('Failed to update branch'),
      });
    } else {
      createBranchMutation.mutate(branchRequest, {
        onSuccess: () => {
          toast.success('Branch created successfully');
          setIsDialogOpen(false);
          form.reset();
        },
        onError: () => toast.error('Failed to create branch'),
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this branch?')) return;
    deleteBranchMutation.mutate(id, {
      onSuccess: () => toast.success('Branch deleted successfully'),
      onError: () => toast.error('Failed to delete branch'),
    });
  };

  const handleEdit = (branch: BranchResponse) => {
    setEditingBranch(branch);
    form.reset({
      name: branch.name,
      address: branch.address,
      phone: branch.phone || '',
      latitude: branch.latitude,
      longitude: branch.longitude,
    });
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Branches</h1>
          <p className="text-muted-foreground">Manage your store locations</p>
        </div>
        {isSuperadmin && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger>
              <Button onClick={() => setEditingBranch(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Branch
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingBranch ? 'Edit Branch' : 'Add New Branch'}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">{editingBranch ? 'Update' : 'Create'}</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Branches Table */}
      <Card>
        <CardContent className="pt-6">
          <DataTable
            columns={columns}
            data={branchesData ?? []}
            filterColumn="name"
            filterPlaceholder="Search branches..."
            isLoading={isLoading}
            enablePagination={false}
            emptyState={{
              title: 'No branches found',
              description: 'Create your first branch to get started.',
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
