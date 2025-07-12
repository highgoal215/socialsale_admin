import { useState, useEffect } from 'react';
import { UserService, User, UserStatus } from '@/services/user-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Ban, 
  CheckCircle, 
  Trash2, 
  Filter, 
  UserCog,
  SortAsc,
  SortDesc,
  Loader2,
  Plus
} from 'lucide-react';
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

// New user form interface
interface NewUserForm {
  username: string;
  email: string;
  password: string;
  role: 'user' | 'moderator';
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');
  const [sortField, setSortField] = useState<keyof User>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState<NewUserForm>({
    username: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await UserService.getAllUsers();
        setUsers(data);
        setFilteredUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError(error instanceof Error ? error.message : 'Failed to load users');
        toast.error('Failed to load users');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...users];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      // Map blockstate to status
      result = result.filter(user => {
        if (statusFilter === 'active' && user.blockstate === 0) return true;
        if (statusFilter === 'blocked' && user.blockstate === 1) return true;
        if (statusFilter === 'deleted' && user.blockstate === 2) return true;
        return false;
      });
    }
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        user => (user.username?.toLowerCase().includes(query) || 
                user.email?.toLowerCase().includes(query))
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      const fieldA = a[sortField];
      const fieldB = b[sortField];
      
      if (typeof fieldA === 'string' && typeof fieldB === 'string') {
        return sortDirection === 'asc' 
          ? fieldA.localeCompare(fieldB) 
          : fieldB.localeCompare(fieldA);
      } else if (typeof fieldA === 'number' && typeof fieldB === 'number') {
        return sortDirection === 'asc' 
          ? fieldA - fieldB 
          : fieldB - fieldA;
      }
      
      return 0;
    });
    
    setFilteredUsers(result);
  }, [users, statusFilter, searchQuery, sortField, sortDirection]);

  // Handle user deletion
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    setIsProcessing(true);
    try {
      // Update user status to 'deleted' (blockstate 2)
      const success = await UserService.updateUserStatus(userToDelete._id, 'deleted');
      if (success) {
        setUsers(prevUsers =>
          prevUsers.map(user => user._id === userToDelete._id ? { ...user, blockstate: 2, status: 'deleted' } : user)
        );
        toast.success(`User ${userToDelete.email} deleted successfully`);
      } else {
        toast.error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('An error occurred while deleting the user');
    } finally {
      setIsProcessing(false);
      setUserToDelete(null);
    }
  };

  // Handle user status update
  const handleUpdateStatus = async (userId: string, newStatus: UserStatus) => {
    setIsProcessing(true);
    try {
      const updatedUser = await UserService.updateUserStatus(userId, newStatus);
      if (updatedUser) {
        setUsers(prevUsers => 
          prevUsers.map(user => user._id === userId ? updatedUser : user)
        );
        toast.success(`User status updated to ${newStatus}`);
      } else {
        toast.error('Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('An error occurred while updating the user');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle creating a new user
  const handleCreateUser = async () => {
    // Validate form
    if (!newUser.username || !newUser.email || !newUser.password) {
      toast.error('Please fill all required fields');
      return;
    }

    if (newUser.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsAddingUser(true);
    try {
      const createdUser = await UserService.createUser({
        username: newUser.username,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role
      });

      if (createdUser) {
        setUsers(prev => [...prev, createdUser]);
        toast.success('User created successfully');
        setIsAddUserDialogOpen(false);
        
        // Reset form
        setNewUser({
          username: '',
          email: '',
          password: '',
          role: 'user'
        });
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    } finally {
      setIsAddingUser(false);
    }
  };

  // Toggle sort direction
  const toggleSort = (field: keyof User) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Render status badge
  const renderStatusBadge = (blockstate: number) => {
    switch (blockstate) {
      case 0:
        return <Badge variant="outline" className="bg-green-100 text-green-800">Active</Badge>;
      case 1:
        return <Badge variant="outline" className="bg-red-100 text-red-800">Blocked</Badge>;
      case 2:
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Deleted</Badge>;
      default:
        return null;
    }
  };

  // Map blockstate to status string
  const getStatusFromBlockstate = (blockstate: number): UserStatus => {
    switch (blockstate) {
      case 0: return 'active';
      case 1: return 'blocked';
      case 2: return 'deleted';
      default: return 'active';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users Management</h1>
          <p className="text-muted-foreground">View and manage user accounts</p>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                All Users
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('active')}>
                Active Users
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('blocked')}>
                Blocked Users
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={() => setIsAddUserDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add User
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="p-4">
          <CardTitle>User Accounts</CardTitle>
          <CardDescription>
            {filteredUsers.length} users found
            {statusFilter !== 'all' && ` (filtered by ${statusFilter})`}
            {searchQuery && ` matching "${searchQuery}"`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-60">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-500">{error}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">
                      <button 
                        className="flex items-center gap-1"
                        onClick={() => toggleSort('username')}
                      >
                        Name
                        {sortField === 'username' && (
                          sortDirection === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="w-[200px]">
                      <button 
                        className="flex items-center gap-1"
                        onClick={() => toggleSort('email')}
                      >
                        Email
                        {sortField === 'email' && (
                          sortDirection === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />
                        )}
                      </button>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>
                      <button 
                        className="flex items-center gap-1"
                        onClick={() => toggleSort('role')}
                      >
                        Role
                        {sortField === 'role' && (
                          sortDirection === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />
                        )}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button 
                        className="flex items-center gap-1"
                        onClick={() => toggleSort('createdAt')}
                      >
                        Joined
                        {sortField === 'createdAt' && (
                          sortDirection === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />
                        )}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button 
                        className="flex items-center gap-1"
                        onClick={() => toggleSort('balance')}
                      >
                        Balance
                        {sortField === 'balance' && (
                          sortDirection === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{renderStatusBadge(user.blockstate)}</TableCell>
                        <TableCell className="capitalize">{user.role}</TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>${user.balance?.toFixed(2) || '0.00'}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <UserCog size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {user.blockstate === 0 ? (
                                <DropdownMenuItem 
                                  onClick={() => handleUpdateStatus(user._id, 'blocked')}
                                  disabled={isProcessing || user.role === 'admin'}
                                >
                                  <Ban size={14} className="mr-2" />
                                  Block User
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem 
                                  onClick={() => handleUpdateStatus(user._id, 'active')}
                                  disabled={isProcessing || user.blockstate === 2}
                                >
                                  <CheckCircle size={14} className="mr-2" />
                                  Activate User
                                </DropdownMenuItem>
                              )}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem
                                    onSelect={(e) => {
                                      e.preventDefault();
                                      setUserToDelete(user);
                                    }}
                                    disabled={isProcessing || user.blockstate === 2 || user.role === 'admin'}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 size={14} className="mr-2" />
                                    Delete User
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete the user account for {user.email}. 
                                      This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      onClick={handleDeleteUser}
                                    >
                                      {isProcessing ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          Deleting...
                                        </>
                                      ) : (
                                        <>Delete</>
                                      )}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account. The user will receive their login credentials.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                value={newUser.username}
                onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                placeholder="johndoe"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                placeholder="john@example.com"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                placeholder="••••••••"
              />
              <p className="text-sm text-muted-foreground">
                Password must be at least 8 characters long
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newUser.role}
                onChange={(e) => setNewUser({...newUser, role: e.target.value as 'user' | 'moderator'})}
              >
                <option value="user">Regular User</option>
                <option value="moderator">Moderator</option>
              </select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddUserDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateUser} disabled={isAddingUser}>
              {isAddingUser ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create User'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;