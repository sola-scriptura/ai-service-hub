import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { projectsApi, Project } from '@/services/projectsApi';
import { fileUploadApi, ProjectFile } from '@/services/fileUploadApi';
import Navbar from '@/components/landing/Navbar';
import FooterSection from '@/components/landing/FooterSection';
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

  const getStatusClass = (status: string) => {
    return `status-badge status-${status}`;
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
      <div className="landing-page">
        <Navbar />
        <main className="centered-page">
          <div>
            <h1>Access Denied</h1>
            <p>Please sign in to view your dashboard.</p>
            <Link to="/">Go Home</Link>
          </div>
        </main>
        <FooterSection />
      </div>
    );
  }

  return (
    <div className="landing-page">
      <Navbar />
      <main className="dashboard-page">
        <div className="dashboard-inner">
          {/* Header */}
          <div className="dashboard-header">
            <Link to="/" className="back-link back-link-dark">
              <ArrowLeft size={16} />
              Back to Home
            </Link>
            <h1>My Projects</h1>
            <p>
              Welcome back, {user.fullName || user.email}! Here are your submitted projects.
            </p>
          </div>

          {/* Projects List */}
          {loading ? (
            <div className="dash-empty">
              <p>Loading your projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="dash-empty">
              <h3>No Projects Yet</h3>
              <p>
                You haven't submitted any projects yet. Get started by choosing a service!
              </p>
              <Link to="/#services" className="btn btn-primary">Browse Services</Link>
            </div>
          ) : (
            <div className="project-list">
              {projects.map((project) => (
                <div key={project.id} className="dash-card">
                  <div className="dash-card-header">
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div>
                        <div className="dash-card-title">{project.title}</div>
                        <div className="dash-meta">
                          <span className="dash-meta-item">
                            <Clock size={16} />
                            Submitted {new Date(project.submittedAt).toLocaleDateString()}
                          </span>
                          <span className="dash-meta-item">
                            <DollarSign size={16} />
                            ${project.finalPrice}
                          </span>
                        </div>
                      </div>
                      <span className={getStatusClass(project.status)}>
                        {formatStatus(project.status)}
                      </span>
                    </div>
                  </div>
                  <div className="dash-card-body">
                    {project.description && (
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{project.description}</p>
                    )}

                    <div className="dash-detail-grid">
                      <div>
                        <div className="dash-detail-label">Service</div>
                        <div className="dash-detail-value">
                          {project.serviceId.replace('-', ' ')}
                        </div>
                      </div>
                      <div>
                        <div className="dash-detail-label">Quantity</div>
                        <div className="dash-detail-value">{project.quantity}</div>
                      </div>
                      <div>
                        <div className="dash-detail-label">Urgency</div>
                        <div className="dash-detail-value">{project.urgency}</div>
                      </div>
                    </div>

                    {/* Uploaded Files */}
                    {project.files.length > 0 && (
                      <div style={{ marginTop: '1rem' }}>
                        <div className="dash-detail-label" style={{ marginBottom: '0.5rem' }}>Uploaded Files:</div>
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default ClientDashboard;
