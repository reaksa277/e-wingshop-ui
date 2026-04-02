'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { type ColumnDef } from '@tanstack/react-table';
import {
  useUsers,
  useCreateStaff,
  useChangeRole,
  useResetPassword,
} from '@/hooks/use-users';
import { userService } from '@/services/user.service';
import { RoleName, CreateStaffRequest } from '@/types';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Download, User as UserIcon, Loader2 } from 'lucide-react';
import { formatRoleNameBadge, getRoleBadgeVariant } from '@/lib/role-utils';
import Papa from 'papaparse';
import { DataTable } from '@/components/ui/data-table';

const userFormSchema = z.object({
  fullName: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .optional()
    .or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  role: z.enum(['SUPERADMIN', 'MANAGER', 'STAFF']),
});

export default function UsersPage() {
  const [currentPage, setCurrentPage] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const PAGE_SIZE = 20;

  const { data: usersData, isLoading, refetch: refetchUsers } = useUsers(currentPage, PAGE_SIZE);
  const createStaffMutation = useCreateStaff();
  const changeRoleMutation = useChangeRole();
  const resetPasswordMutation = useResetPassword();

  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      phone: '',
      role: 'STAFF',
    },
  });

  useEffect(() => {
    if (editingUser) {
      form.reset({
        fullName: editingUser.fullName,
        email: editingUser.email,
        password: '',
        phone: editingUser.phone || '',
        role: editingUser.role,
      });
    } else {
      form.reset({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        role: 'STAFF',
      });
    }
  }, [editingUser, form]);

  const onSubmit = async (data: z.infer<typeof userFormSchema>) => {
    try {
      if (editingUser) {
        // Update role if changed
        if (data.role !== editingUser.role) {
          await changeRoleMutation.mutateAsync({
            id: editingUser.id,
            role: data.role as RoleName,
          });
        }
        // Reset password if provided
        if (data.password) {
          await resetPasswordMutation.mutateAsync({
            id: editingUser.id,
            password: data.password,
          });
        }
        toast.success('User updated successfully');
      } else {
        // Create new staff member
        const createData: CreateStaffRequest = {
          fullName: data.fullName,
          email: data.email,
          password: data.password || '',
          phone: data.phone,
          role: data.role as RoleName,
        };
        await createStaffMutation.mutateAsync(createData);
        toast.success('User created successfully');
      }
      setIsDialogOpen(false);
      setEditingUser(null);
      refetchUsers();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save user');
    }
  };

  const handleDelete = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await userService.deleteUser(userId);
      toast.success('User deleted successfully');
      refetchUsers();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete user');
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  const handleExport = () => {
    if (!usersData?.content?.length) return;
    const csv = Papa.unparse(
      usersData.content.map((u: any) => ({
        Name: u.fullName,
        Email: u.email,
        Role: u.role,
        Phone: u.phone || 'N/A',
      }))
    );
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Users exported successfully');
  };

  // Define columns for DataTable
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'fullName',
      header: 'User',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback>
                {user.fullName
                  .split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{user.fullName}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.getValue('email')}</span>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.getValue('phone') || '-'}</span>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => (
        <Badge variant={getRoleBadgeVariant(row.getValue('role') as string)}>
          {formatRoleNameBadge(row.getValue('role') as string)}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEdit(user)}
              title="Edit user"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(user.id)}
              title="Delete user"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger>
              <Button onClick={() => setEditingUser(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="John Doe" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                placeholder="john@example.com"
                                disabled={!!editingUser}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {editingUser ? 'New Password (optional)' : 'Password'}
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="password"
                                placeholder={editingUser ? 'Leave blank to keep unchanged' : '••••••'}
                              />
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
                            <FormLabel>Phone (optional)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="+1 (555) 123-4567" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="SUPERADMIN">Super Admin</SelectItem>
                              <SelectItem value="MANAGER">Manager</SelectItem>
                              <SelectItem value="STAFF">Staff</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={
                          createStaffMutation.isPending ||
                          changeRoleMutation.isPending ||
                          resetPasswordMutation.isPending
                        }
                      >
                        {createStaffMutation.isPending ||
                        changeRoleMutation.isPending ||
                        resetPasswordMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : editingUser ? (
                          'Update'
                        ) : (
                          'Create'
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="pt-6">
          <DataTable
            columns={columns}
            data={usersData?.content ?? []}
            filterColumn="fullName"
            filterPlaceholder="Search by name or email..."
            isLoading={isLoading}
            enablePagination={false}
            emptyState={{
              title: 'No users found',
              description: 'Create your first user to get started.',
            }}
          />
        </CardContent>
      </Card>

      {/* Pagination */}
      {usersData && usersData.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {usersData.content.length} of {usersData.totalElements} users
          </p>
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
            >
              Previous
            </Button>
            <span className="flex items-center px-4 text-sm">
              Page {currentPage + 1} of {usersData.totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() =>
                setCurrentPage((p) => Math.min(usersData.totalPages - 1, p + 1))
              }
              disabled={currentPage >= usersData.totalPages - 1}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
