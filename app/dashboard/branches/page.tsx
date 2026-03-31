'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Phone, Plus, Edit, Trash2, Search } from 'lucide-react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { authService } from '@/services/auth.service';
import { tokenStore } from '@/lib/api-client';
import type { BranchResponse, BranchRequest } from '@/types';
import { useBranches, useCreateBranch, useUpdateBranch, useDeleteBranch } from '@/hooks/use-branches';

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
  const [search, setSearch] = useState('');

  const {
    data: branchesData,
    isLoading,
  } = useBranches();

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

  const isSuperadmin = userData?.role === 'OWNER' || userData?.role === 'ADMIN';

  // Filter branches based on search
  const filteredBranches = branchesData?.filter((branch: BranchResponse) => {
    const matchesSearch =
      branch.name.toLowerCase().includes(search.toLowerCase()) ||
      branch.address.toLowerCase().includes(search.toLowerCase()) ||
      (branch.phone && branch.phone.includes(search));
    return matchesSearch;
  });

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
            <DialogTrigger asChild>
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

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search branches..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Branches Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredBranches?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No branches found
                  </TableCell>
                </TableRow>
              ) : (
                filteredBranches?.map((branch: BranchResponse) => (
                  <TableRow key={branch.id}>
                    <TableCell className="font-medium">{branch.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{branch.address}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{branch.phone || '—'}</span>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(branch.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      {isSuperadmin && (
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(branch)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(branch.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
