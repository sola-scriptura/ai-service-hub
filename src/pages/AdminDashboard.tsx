import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { adminApi, AdminProject, AdminUser } from '@/services/adminApi';
import { emailApi } from '@/services/emailApi';
import { ProjectStatus, UserRole } from '@/types/database';
import Navbar from '@/components/landing/Navbar';
import FooterSection from '@/components/landing/FooterSection';
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

  const getStatusClass = (status: string) => {
    return `status-badge status-${status}`;
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

  const getRoleClass = (role: string) => {
    return `role-badge role-${role}`;
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
      <div className="landing-page">
        <Navbar />
        <main className="centered-page">
          <div>
            <h1>Access Denied</h1>
            <p>You do not have permission to access the admin dashboard.</p>
            <Link to="/">Go Home</Link>
          </div>
        </main>
        <FooterSection />
      </div>
    );
  }

  // Loading
  if (isAdmin === null || loading) {
    return (
      <div className="landing-page">
        <Navbar />
        <main className="centered-page">
          <div>
            <p style={{ color: 'var(--text-secondary)' }}>Loading admin dashboard...</p>
          </div>
        </main>
        <FooterSection />
      </div>
    );
  }

  return (
    <div className="landing-page">
      <Navbar />
      <main className="admin-page">
        <div className="admin-inner">
          {/* Header */}
          <div className="admin-top">
            <div>
              <Link to="/" className="back-link back-link-dark">
                <ArrowLeft size={16} />
                Back to Home
              </Link>
              <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, letterSpacing: '-0.04em', fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>
                Admin Dashboard
              </h1>
              <p style={{ color: 'var(--text-secondary)' }}>Manage projects, users, and system settings</p>
            </div>
            <div className="admin-actions">
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem 0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <Label htmlFor="adminName">Full Name</Label>
                      <Input
                        id="adminName"
                        value={newAdminName}
                        onChange={(e) => setNewAdminName(e.target.value)}
                        placeholder="John Doe"
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <Label htmlFor="adminEmail">Email</Label>
                      <Input
                        id="adminEmail"
                        type="email"
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        placeholder="admin@example.com"
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-card-label">
                <FolderKanban size={18} />
                <span>Total</span>
              </div>
              <div className="stat-card-value">{stats.total}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-label" style={{ color: '#B45309' }}>
                <Clock size={18} />
                <span>Pending</span>
              </div>
              <div className="stat-card-value">{stats.pending}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-label" style={{ color: '#0369A1' }}>
                <RefreshCw size={18} />
                <span>In Progress</span>
              </div>
              <div className="stat-card-value">{stats.inProgress}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-label" style={{ color: 'var(--green)' }}>
                <TrendingUp size={18} />
                <span>Completed</span>
              </div>
              <div className="stat-card-value">{stats.completed}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-label" style={{ color: 'var(--warm)' }}>
                <Mail size={18} />
                <span>Revision</span>
              </div>
              <div className="stat-card-value">{stats.revision}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-label" style={{ color: '#DC2626' }}>
                <Users size={18} />
                <span>Cancelled</span>
              </div>
              <div className="stat-card-value">{stats.cancelled}</div>
            </div>
            <div className="stat-card highlight">
              <div className="stat-card-label">
                <DollarSign size={18} />
                <span>Revenue</span>
              </div>
              <div className="stat-card-value">
                ${stats.totalRevenue.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="projects" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
            <TabsContent value="projects" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Filters */}
              <div className="filter-bar">
                <div className="filter-group">
                  <Label htmlFor="statusFilter" style={{ whiteSpace: 'nowrap' }}>
                    Status:
                  </Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger id="statusFilter" style={{ width: '150px' }}>
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
                <div className="filter-group">
                  <Label htmlFor="serviceFilter" style={{ whiteSpace: 'nowrap' }}>
                    Service:
                  </Label>
                  <Select value={serviceFilter} onValueChange={setServiceFilter}>
                    <SelectTrigger id="serviceFilter" style={{ width: '200px' }}>
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
                <div className="filter-count">
                  Showing {filteredProjects.length} of {projects.length} projects
                </div>
              </div>

              {/* Projects List */}
              {filteredProjects.length === 0 ? (
                <div className="dash-empty">
                  <h3>No Projects Found</h3>
                  <p>
                    {projects.length === 0
                      ? 'No projects have been submitted yet.'
                      : 'No projects match your current filters.'}
                  </p>
                </div>
              ) : (
                <div className="project-list">
                  {filteredProjects.map((project) => (
                    <div key={project.id} className="dash-card">
                      <div className="dash-card-header">
                        <div className="admin-project-header">
                          <div style={{ flex: 1 }}>
                            <div className="admin-project-title">
                              <h3>{project.title}</h3>
                              <span className={getStatusClass(project.status)}>
                                {formatStatus(project.status)}
                              </span>
                            </div>
                            <div className="dash-meta">
                              <span className="dash-meta-item">
                                <Clock size={16} />
                                {new Date(project.submittedAt).toLocaleDateString()}
                              </span>
                              <span className="dash-meta-item">
                                <DollarSign size={16} />
                                ${project.finalPrice.toFixed(2)}
                              </span>
                              <span className="dash-meta-item">
                                <User size={16} />
                                {project.clientName || project.clientEmail}
                              </span>
                            </div>
                          </div>
                          <div className="admin-project-controls">
                            <Select
                              value={project.status}
                              onValueChange={(value) =>
                                handleStatusChange(project.id, value as ProjectStatus)
                              }
                            >
                              <SelectTrigger style={{ width: '140px' }}>
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
                      </div>

                      {expandedProjects.has(project.id) && (
                        <div className="admin-expand-content">
                          {project.description && (
                            <div style={{ marginBottom: '1rem' }}>
                              <h4 style={{ fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: '0.25rem' }}>Description:</h4>
                              <p style={{ color: 'var(--text-secondary)' }}>{project.description}</p>
                            </div>
                          )}

                          <div className="admin-detail-grid">
                            <div className="admin-detail-section">
                              <h4>Project Details</h4>
                              <div className="admin-detail-row">
                                <p><span className="admin-detail-label">Service:</span> {project.serviceTitle}</p>
                                <p><span className="admin-detail-label">Expert:</span> {project.expertName || 'N/A'}</p>
                                <p><span className="admin-detail-label">Quantity:</span> {project.quantity}</p>
                              </div>
                            </div>
                            <div className="admin-detail-section">
                              <h4>Quote Breakdown</h4>
                              <div className="admin-detail-row">
                                <p><span className="admin-detail-label">Base Price:</span> ${project.basePrice.toFixed(2)}</p>
                                <p><span className="admin-detail-label">Urgency:</span> {project.urgency}</p>
                                <p><span className="admin-detail-label">Complexity:</span> {project.complexity}</p>
                                <p style={{ fontWeight: 600 }}><span className="admin-detail-label">Final:</span> ${project.finalPrice.toFixed(2)}</p>
                              </div>
                            </div>
                            <div className="admin-detail-section">
                              <h4>Client Info</h4>
                              <div className="admin-detail-row">
                                <p><span className="admin-detail-label">Name:</span> {project.clientName || 'N/A'}</p>
                                <p><span className="admin-detail-label">Email:</span> {project.clientEmail}</p>
                              </div>
                            </div>
                          </div>

                          {/* Files */}
                          {project.files.length > 0 && (
                            <div>
                              <h4 style={{ fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: '0.5rem' }}>
                                Uploaded Files ({project.files.length})
                              </h4>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {project.files.map((file) => (
                                  <div key={file.id} className="file-item">
                                    <div className="file-info">
                                      <File size={16} />
                                      <div>
                                        <div className="file-name">{file.fileName}</div>
                                        <div className="file-size">{formatFileSize(file.fileSize)}</div>
                                      </div>
                                    </div>
                                    <a
                                      href={file.fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="file-download"
                                    >
                                      <Download size={16} />
                                    </a>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Timestamps */}
                          <div className="admin-timestamps">
                            <span>Created: {new Date(project.createdAt).toLocaleString()}</span>
                            {project.startedAt && (
                              <span>Started: {new Date(project.startedAt).toLocaleString()}</span>
                            )}
                            {project.completedAt && (
                              <span>Completed: {new Date(project.completedAt).toLocaleString()}</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="dash-card">
                <div className="dash-card-header">
                  <div className="dash-card-title">All Users</div>
                </div>
                <div className="dash-card-body">
                  <div style={{ overflowX: 'auto' }}>
                    <table className="users-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Joined</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u.id}>
                            <td>{u.fullName || 'N/A'}</td>
                            <td>{u.email}</td>
                            <td>
                              <span className={getRoleClass(u.role)}>
                                {u.role}
                              </span>
                            </td>
                            <td>
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                            <td>
                              {u.id === user?.id ? (
                                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontStyle: 'italic' }}>You</span>
                              ) : (
                                <Select
                                  value={u.role}
                                  onValueChange={(value) =>
                                    handleRoleChange(u.id, value as UserRole)
                                  }
                                >
                                  <SelectTrigger style={{ width: '120px' }}>
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
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default AdminDashboard;
