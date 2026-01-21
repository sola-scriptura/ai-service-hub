import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { adminApi, AdminProject, AdminUser } from '@/services/adminApi';
import { emailApi } from '@/services/emailApi';
import { ProjectStatus, UserRole } from '@/types/database';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Clock,
  DollarSign,
  File,
  Download,
  Users,
  FolderKanban,
  TrendingUp,
  UserPlus,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Mail,
  User,
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    revision: 0,
    cancelled: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');

  // New admin form
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [showNewAdminDialog, setShowNewAdminDialog] = useState(false);

  // Check admin status
  useEffect(() => {
    const checkAdmin = async () => {
      console.log('[AdminDashboard] Checking admin status...');
      console.log('[AdminDashboard] Current user:', user?.id, user?.email);
      const adminStatus = await adminApi.isAdmin();
      console.log('[AdminDashboard] Admin status result:', adminStatus);
      setIsAdmin(adminStatus);
      if (!adminStatus) {
        console.log('[AdminDashboard] User is NOT admin - showing access denied');
        toast({
          title: 'Access Denied',
          description: 'You do not have admin privileges.',
          variant: 'destructive',
        });
      } else {
        console.log('[AdminDashboard] User IS admin - will fetch data');
      }
    };

    if (user) {
      checkAdmin();
    } else {
      console.log('[AdminDashboard] No user logged in');
      setIsAdmin(false);
    }
  }, [user, toast]);

  // Fetch data
  const fetchData = async () => {
    if (!isAdmin) {
      console.log('[AdminDashboard] fetchData skipped - not admin');
      return;
    }

    console.log('[AdminDashboard] fetchData starting...');

    try {
      const [projectsData, usersData, statsData] = await Promise.all([
        adminApi.getAllProjects(),
        adminApi.getAllUsers(),
        adminApi.getProjectStats(),
      ]);

      console.log('[AdminDashboard] Fetched projects:', projectsData.length);
      console.log('[AdminDashboard] Fetched users:', usersData.length);
      console.log('[AdminDashboard] Fetched stats:', statsData);

      setProjects(projectsData);
      setUsers(usersData);
      setStats(statsData);
    } catch (error) {
      console.error('[AdminDashboard] Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast({
      title: 'Refreshed',
      description: 'Dashboard data has been updated.',
    });
  };

  const handleStatusChange = async (projectId: string, newStatus: ProjectStatus) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    const oldStatus = project.status;

    try {
      const { success, error } = await adminApi.updateProjectStatus(projectId, newStatus);

      if (error || !success) {
        throw error || new Error('Failed to update status');
      }

      // Update local state
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, status: newStatus } : p))
      );

      // Send status change notification
      const adminEmail = await emailApi.getAdminEmail();
      if (adminEmail) {
        await emailApi.sendStatusChangeNotification(
          {
            projectId: project.id,
            projectTitle: project.title,
            serviceTitle: project.serviceTitle,
            expertName: project.expertName,
            clientName: project.clientName,
            clientEmail: project.clientEmail,
            finalPrice: project.finalPrice,
            urgency: project.urgency,
            complexity: project.complexity,
            status: newStatus,
            submittedAt: project.submittedAt,
          },
          oldStatus,
          newStatus,
          adminEmail
        );
      }

      toast({
        title: 'Status Updated',
        description: `Project status changed to ${newStatus.replace('_', ' ')}.`,
      });

      // Refresh stats
      const newStats = await adminApi.getProjectStats();
      setStats(newStats);
    } catch (error) {
      console.error('[AdminDashboard] Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update project status.',
        variant: 'destructive',
      });
    }
  };

  const handleCreateAdmin = async () => {
    if (!newAdminEmail || !newAdminPassword || !newAdminName) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all fields.',
        variant: 'destructive',
      });
      return;
    }

    setCreatingAdmin(true);

    try {
      const { user: newUser, error } = await adminApi.createAdminUser(
        newAdminEmail,
        newAdminPassword,
        newAdminName
      );

      if (error || !newUser) {
        throw error || new Error('Failed to create admin');
      }

      toast({
        title: 'Admin Created',
        description: `Admin user ${newAdminName} has been created successfully.`,
      });

      setNewAdminEmail('');
      setNewAdminPassword('');
      setNewAdminName('');
      setShowNewAdminDialog(false);

      // Refresh users list
      const updatedUsers = await adminApi.getAllUsers();
      setUsers(updatedUsers);
    } catch (error) {
      console.error('[AdminDashboard] Error creating admin:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create admin user.',
        variant: 'destructive',
      });
    } finally {
      setCreatingAdmin(false);
    }
  };

  const toggleProjectExpand = (projectId: string) => {
    setExpandedProjects((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    // Prevent changing own role
    if (userId === user?.id) {
      toast({
        title: 'Error',
        description: 'You cannot change your own role.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { success, error } = await adminApi.updateUserRole(userId, newRole);

      if (error || !success) {
        throw error || new Error('Failed to update role');
      }

      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );

      toast({
        title: 'Role Updated',
        description: `User role changed to ${newRole}.`,
      });
    } catch (error) {
      console.error('[AdminDashboard] Error updating role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user role.',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'revision':
        return 'bg-orange-100 text-orange-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    if (statusFilter !== 'all' && project.status !== statusFilter) return false;
    if (serviceFilter !== 'all' && project.serviceId !== serviceFilter) return false;
    return true;
  });

  // Get unique services for filter
  const uniqueServices = [...new Set(projects.map((p) => p.serviceId))];

  // Access denied
  if (!user || isAdmin === false) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="py-24 px-[5%] text-center">
          <h1 className="font-display text-3xl font-bold mb-4">Access Denied</h1>
          <p className="text-primary-600 mb-8">
            You do not have permission to access the admin dashboard.
          </p>
          <Button asChild variant="cta">
            <Link to="/">Go Home</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  // Loading
  if (isAdmin === null || loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="py-24 px-[5%] text-center">
          <p className="text-primary-600">Loading admin dashboard...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <main className="py-8 px-[5%]">
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-800 mb-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
              <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-primary-600">Manage projects, users, and system settings</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Dialog open={showNewAdminDialog} onOpenChange={setShowNewAdminDialog}>
                <DialogTrigger asChild>
                  <Button variant="cta">
                    <UserPlus className="w-4 h-4 mr-2" />
                    New Admin
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Admin User</DialogTitle>
                    <DialogDescription>
                      Add a new admin user with full dashboard access.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="adminName">Full Name</Label>
                      <Input
                        id="adminName"
                        value={newAdminName}
                        onChange={(e) => setNewAdminName(e.target.value)}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="adminEmail">Email</Label>
                      <Input
                        id="adminEmail"
                        type="email"
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        placeholder="admin@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="adminPassword">Password</Label>
                      <Input
                        id="adminPassword"
                        type="password"
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                        placeholder="Min. 8 characters"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowNewAdminDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="cta"
                      onClick={handleCreateAdmin}
                      disabled={creatingAdmin}
                    >
                      {creatingAdmin ? 'Creating...' : 'Create Admin'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <FolderKanban className="w-5 h-5 text-primary-600" />
                  <span className="text-sm text-primary-600">Total</span>
                </div>
                <p className="text-2xl font-bold mt-1">{stats.total}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm text-primary-600">Pending</span>
                </div>
                <p className="text-2xl font-bold mt-1">{stats.pending}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-primary-600">In Progress</span>
                </div>
                <p className="text-2xl font-bold mt-1">{stats.inProgress}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-primary-600">Completed</span>
                </div>
                <p className="text-2xl font-bold mt-1">{stats.completed}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-orange-600" />
                  <span className="text-sm text-primary-600">Revision</span>
                </div>
                <p className="text-2xl font-bold mt-1">{stats.revision}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-red-600" />
                  <span className="text-sm text-primary-600">Cancelled</span>
                </div>
                <p className="text-2xl font-bold mt-1">{stats.cancelled}</p>
              </CardContent>
            </Card>
            <Card className="bg-green-50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-700">Revenue</span>
                </div>
                <p className="text-2xl font-bold mt-1 text-green-700">
                  ${stats.totalRevenue.toFixed(2)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="projects" className="space-y-6">
            <TabsList>
              <TabsTrigger value="projects">
                <FolderKanban className="w-4 h-4 mr-2" />
                Projects ({projects.length})
              </TabsTrigger>
              <TabsTrigger value="users">
                <Users className="w-4 h-4 mr-2" />
                Users ({users.length})
              </TabsTrigger>
            </TabsList>

            {/* Projects Tab */}
            <TabsContent value="projects" className="space-y-4">
              {/* Filters */}
              <div className="flex flex-wrap gap-4 p-4 bg-white rounded-lg border">
                <div className="flex items-center gap-2">
                  <Label htmlFor="statusFilter" className="text-sm whitespace-nowrap">
                    Status:
                  </Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger id="statusFilter" className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="revision">Revision</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="serviceFilter" className="text-sm whitespace-nowrap">
                    Service:
                  </Label>
                  <Select value={serviceFilter} onValueChange={setServiceFilter}>
                    <SelectTrigger id="serviceFilter" className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Services</SelectItem>
                      {uniqueServices.map((serviceId) => (
                        <SelectItem key={serviceId} value={serviceId}>
                          {projects.find((p) => p.serviceId === serviceId)?.serviceTitle ||
                            serviceId}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="ml-auto text-sm text-primary-600">
                  Showing {filteredProjects.length} of {projects.length} projects
                </div>
              </div>

              {/* Projects List */}
              {filteredProjects.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <h3 className="font-display text-xl font-bold mb-2">No Projects Found</h3>
                    <p className="text-primary-600">
                      {projects.length === 0
                        ? 'No projects have been submitted yet.'
                        : 'No projects match your current filters.'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredProjects.map((project) => (
                    <Card key={project.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <CardTitle className="font-display text-lg">
                                {project.title}
                              </CardTitle>
                              <Badge className={getStatusColor(project.status)}>
                                {formatStatus(project.status)}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-primary-600">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {new Date(project.submittedAt).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />$
                                {project.finalPrice.toFixed(2)}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                {project.clientName || project.clientEmail}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Select
                              value={project.status}
                              onValueChange={(value) =>
                                handleStatusChange(project.id, value as ProjectStatus)
                              }
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="revision">Revision</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleProjectExpand(project.id)}
                            >
                              {expandedProjects.has(project.id) ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardHeader>

                      {expandedProjects.has(project.id) && (
                        <CardContent className="pt-4 border-t">
                          {project.description && (
                            <div className="mb-4">
                              <h4 className="font-semibold text-sm mb-1">Description:</h4>
                              <p className="text-primary-700">{project.description}</p>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <h4 className="font-semibold text-sm mb-2">Project Details</h4>
                              <div className="space-y-1 text-sm">
                                <p>
                                  <span className="text-primary-600">Service:</span>{' '}
                                  {project.serviceTitle}
                                </p>
                                <p>
                                  <span className="text-primary-600">Expert:</span>{' '}
                                  {project.expertName || 'N/A'}
                                </p>
                                <p>
                                  <span className="text-primary-600">Quantity:</span>{' '}
                                  {project.quantity}
                                </p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm mb-2">Quote Breakdown</h4>
                              <div className="space-y-1 text-sm">
                                <p>
                                  <span className="text-primary-600">Base Price:</span> $
                                  {project.basePrice.toFixed(2)}
                                </p>
                                <p>
                                  <span className="text-primary-600">Urgency:</span>{' '}
                                  {project.urgency}
                                </p>
                                <p>
                                  <span className="text-primary-600">Complexity:</span>{' '}
                                  {project.complexity}
                                </p>
                                <p className="font-semibold">
                                  <span className="text-primary-600">Final:</span> $
                                  {project.finalPrice.toFixed(2)}
                                </p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm mb-2">Client Info</h4>
                              <div className="space-y-1 text-sm">
                                <p>
                                  <span className="text-primary-600">Name:</span>{' '}
                                  {project.clientName || 'N/A'}
                                </p>
                                <p>
                                  <span className="text-primary-600">Email:</span>{' '}
                                  {project.clientEmail}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Files */}
                          {project.files.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-sm mb-2">
                                Uploaded Files ({project.files.length})
                              </h4>
                              <div className="space-y-2">
                                {project.files.map((file) => (
                                  <div
                                    key={file.id}
                                    className="flex items-center justify-between p-2 bg-neutral-50 rounded"
                                  >
                                    <div className="flex items-center gap-2">
                                      <File className="w-4 h-4 text-neutral-500" />
                                      <div>
                                        <p className="text-sm font-medium">{file.fileName}</p>
                                        <p className="text-xs text-neutral-500">
                                          {formatFileSize(file.fileSize)}
                                        </p>
                                      </div>
                                    </div>
                                    <Button
                                      asChild
                                      variant="ghost"
                                      size="sm"
                                      className="text-accent hover:text-accent-dark"
                                    >
                                      <a
                                        href={file.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <Download className="w-4 h-4" />
                                      </a>
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Timestamps */}
                          <div className="mt-4 pt-4 border-t text-xs text-primary-500">
                            <span>Created: {new Date(project.createdAt).toLocaleString()}</span>
                            {project.startedAt && (
                              <span className="ml-4">
                                Started: {new Date(project.startedAt).toLocaleString()}
                              </span>
                            )}
                            {project.completedAt && (
                              <span className="ml-4">
                                Completed: {new Date(project.completedAt).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>All Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-semibold">Name</th>
                          <th className="text-left py-3 px-4 font-semibold">Email</th>
                          <th className="text-left py-3 px-4 font-semibold">Role</th>
                          <th className="text-left py-3 px-4 font-semibold">Joined</th>
                          <th className="text-left py-3 px-4 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u.id} className="border-b hover:bg-neutral-50">
                            <td className="py-3 px-4">{u.fullName || 'N/A'}</td>
                            <td className="py-3 px-4">{u.email}</td>
                            <td className="py-3 px-4">
                              <Badge
                                className={
                                  u.role === 'admin'
                                    ? 'bg-purple-100 text-purple-800'
                                    : u.role === 'expert'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                                }
                              >
                                {u.role}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              {u.id === user?.id ? (
                                <span className="text-sm text-primary-500 italic">You</span>
                              ) : (
                                <Select
                                  value={u.role}
                                  onValueChange={(value) =>
                                    handleRoleChange(u.id, value as UserRole)
                                  }
                                >
                                  <SelectTrigger className="w-[120px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="client">Client</SelectItem>
                                    <SelectItem value="expert">Expert</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
