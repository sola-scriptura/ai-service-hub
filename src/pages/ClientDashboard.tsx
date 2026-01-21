import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { projectsApi, Project } from '@/services/projectsApi';
import { fileUploadApi, ProjectFile } from '@/services/fileUploadApi';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, DollarSign, File, Download } from 'lucide-react';

interface ProjectWithFiles extends Project {
  files: ProjectFile[];
}

const ClientDashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectWithFiles[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    if (!user) return;
    
    try {
      console.log('[ClientDashboard] Fetching projects for user:', user.id);
      const userProjects = await projectsApi.getByClient(user.id);
      
      // Fetch files for each project
      const projectsWithFiles = await Promise.all(
        userProjects.map(async (project) => {
          const files = await fileUploadApi.getProjectFiles(project.id);
          return { ...project, files };
        })
      );
      
      console.log('[ClientDashboard] Fetched projects with files:', projectsWithFiles);
      setProjects(projectsWithFiles);
    } catch (error) {
      console.error('[ClientDashboard] Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'revision': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!user) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="py-24 px-[5%] text-center">
          <h1 className="font-display text-3xl font-bold mb-4">Access Denied</h1>
          <p className="text-primary-600 mb-8">Please sign in to view your dashboard.</p>
          <Button asChild variant="cta">
            <Link to="/">Go Home</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-12 px-[5%]">
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-800 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <h1 className="font-display text-3xl font-bold mb-2">My Projects</h1>
            <p className="text-primary-600">
              Welcome back, {user.fullName || user.email}! Here are your submitted projects.
            </p>
          </div>

          {/* Projects List */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-primary-600">Loading your projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <h3 className="font-display text-xl font-bold mb-2">No Projects Yet</h3>
                <p className="text-primary-600 mb-6">
                  You haven't submitted any projects yet. Get started by choosing a service!
                </p>
                <Button asChild variant="cta">
                  <Link to="/#services">Browse Services</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {projects.map((project) => (
                <Card key={project.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="font-display text-xl mb-2">
                          {project.title}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-primary-600">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Submitted {new Date(project.submittedAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            ${project.finalPrice}
                          </span>
                        </div>
                      </div>
                      <Badge className={getStatusColor(project.status)}>
                        {formatStatus(project.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {project.description && (
                      <p className="text-primary-700 mb-4">{project.description}</p>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                      <div>
                        <span className="font-semibold">Service:</span>
                        <p className="text-primary-600 capitalize">
                          {project.serviceId.replace('-', ' ')}
                        </p>
                      </div>
                      <div>
                        <span className="font-semibold">Quantity:</span>
                        <p className="text-primary-600">{project.quantity}</p>
                      </div>
                      <div>
                        <span className="font-semibold">Urgency:</span>
                        <p className="text-primary-600 capitalize">{project.urgency}</p>
                      </div>
                    </div>

                    {/* Uploaded Files */}
                    {project.files.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-semibold text-sm mb-2">Uploaded Files:</h4>
                        <div className="space-y-2">
                          {project.files.map((file) => (
                            <div key={file.id} className="flex items-center justify-between p-2 bg-neutral-50 rounded">
                              <div className="flex items-center gap-2">
                                <File className="w-4 h-4 text-neutral-500" />
                                <div>
                                  <p className="text-sm font-medium">{file.fileName}</p>
                                  <p className="text-xs text-neutral-500">{formatFileSize(file.fileSize)}</p>
                                </div>
                              </div>
                              <Button
                                asChild
                                variant="ghost"
                                size="sm"
                                className="text-accent hover:text-accent-dark"
                              >
                                <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                                  <Download className="w-4 h-4" />
                                </a>
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ClientDashboard;