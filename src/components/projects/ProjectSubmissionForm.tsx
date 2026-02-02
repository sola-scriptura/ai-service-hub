import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { projectsApi } from '@/services/projectsApi';
import { fileUploadApi } from '@/services/fileUploadApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle } from 'lucide-react';
import FileUpload from '@/components/ui/file-upload';

interface ProjectSubmissionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ProjectSubmissionForm = ({ onSuccess, onCancel }: ProjectSubmissionFormProps) => {
  const { currentQuote, selectedExpert, selectedService } = useAppContext();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !selectedExpert || !selectedService || !currentQuote) {
      toast({
        title: "Error",
        description: "Missing required information. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (files.length === 0) {
      toast({
        title: "Files Required",
        description: "Please upload at least one file before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('[ProjectSubmissionForm] Creating project...');
      
      // Create project first (includes email notification to admin and client)
      const { project, error: projectError } = await projectsApi.create({
        clientId: user.id,
        expertId: selectedExpert.id,
        serviceId: selectedService.id,
        title: formData.title,
        description: formData.description || undefined,
        quantity: currentQuote.criteria.quantity || 1,
        urgency: currentQuote.criteria.urgency as any,
        complexity: currentQuote.criteria.complexity as any,
        basePrice: currentQuote.basePrice,
        finalPrice: currentQuote.finalPrice,
        // Additional data for email notifications
        clientEmail: user.email,
        clientName: user.fullName,
        serviceTitle: selectedService.title,
        expertName: selectedExpert.name,
      });

      if (projectError || !project) {
        throw projectError || new Error('Failed to create project');
      }

      console.log('[ProjectSubmissionForm] Project created:', project.id);
      console.log('[ProjectSubmissionForm] Uploading files...');

      // Upload files and save records
      const fileUploadPromises = files.map(async (file) => {
        const { url, error: uploadError } = await fileUploadApi.uploadFile(file, project.id);
        
        if (uploadError || !url) {
          throw uploadError || new Error(`Failed to upload ${file.name}`);
        }

        const { error: recordError } = await fileUploadApi.saveFileRecord(
          project.id,
          file.name,
          url,
          file.size,
          file.type,
          user.id
        );

        if (recordError) {
          throw recordError;
        }

        return { fileName: file.name, url };
      });

      await Promise.all(fileUploadPromises);

      console.log('[ProjectSubmissionForm] All files uploaded successfully');
      
      setIsSuccess(true);
      toast({
        title: "Project Submitted!",
        description: `Your project "${formData.title}" has been submitted successfully.`,
      });

      // Navigate to dashboard after a short delay
      setTimeout(() => {
        onSuccess?.();
        navigate('/dashboard');
      }, 2000);

    } catch (error) {
      console.error('[ProjectSubmissionForm] Submission error:', error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="landing-page">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="font-display text-xl font-bold mb-2">Project Submitted!</h3>
            <p className="text-primary-600 mb-4">
              Your project has been submitted successfully. You'll receive updates on your project status.
            </p>
            <button className="btn btn-primary" onClick={onSuccess}>
              Continue
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="landing-page">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="font-display text-2xl">Submit Your Project</CardTitle>
          <p className="text-primary-600">
            Provide details about your project to get started with {selectedExpert?.name}.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Project Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter a descriptive title for your project"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Project Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Project Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your project requirements, goals, and any specific instructions..."
                rows={4}
                disabled={isSubmitting}
              />
            </div>

            {/* File Upload */}
            <FileUpload
              files={files}
              onFilesChange={setFiles}
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.mov,.avi"
              maxFiles={5}
              disabled={isSubmitting}
            />

            {/* Read-only fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  value={currentQuote?.criteria.quantity || 1}
                  disabled
                  className="bg-neutral-50"
                />
              </div>
              <div className="space-y-2">
                <Label>Urgency</Label>
                <Input
                  value={currentQuote?.criteria.urgency || 'standard'}
                  disabled
                  className="bg-neutral-50 capitalize"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Complexity</Label>
              <Input
                value={currentQuote?.criteria.complexity || 'standard'}
                disabled
                className="bg-neutral-50 capitalize"
              />
            </div>

            {/* Selected Expert (Read-only) */}
            <div className="space-y-2">
              <Label>Selected Expert</Label>
              <div className="p-3 bg-accent/5 rounded-lg border border-accent/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent to-secondary-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {selectedExpert?.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold">{selectedExpert?.name}</p>
                    <p className="text-sm text-primary-600">
                      {selectedExpert?.rating}★ • {selectedExpert?.completedProjects} projects
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Service (Read-only) */}
            <div className="space-y-2">
              <Label>Service</Label>
              <div className="p-3 bg-neutral-50 rounded-lg border">
                <p className="font-semibold">{selectedService?.title}</p>
                <p className="text-sm text-primary-600">{selectedService?.description}</p>
              </div>
            </div>

            {/* Price Summary */}
            <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Total Price:</span>
                <span className="font-display text-2xl font-bold text-accent">
                  ${currentQuote?.finalPrice}
                </span>
              </div>
              <p className="text-sm text-primary-600">
                Delivery: {currentQuote?.turnaroundTime}
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-4">
              {onCancel && (
                <button
                  type="button"
                  className="btn btn-secondary flex-1"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="btn btn-primary flex-1"
                disabled={isSubmitting || !formData.title.trim() || files.length === 0}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Project'
                )}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectSubmissionForm;