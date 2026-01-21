import { useState } from 'react';
import { projectsApi, ProjectCreate } from '@/services/projectsApi';
import { useToast } from '@/hooks/use-toast';

export const useProjectSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const submitProject = async (projectData: ProjectCreate) => {
    setIsSubmitting(true);

    try {
      console.log('[useProjectSubmission] Submitting project:', projectData);

      const { project, error } = await projectsApi.create(projectData);

      if (error) {
        console.error('[useProjectSubmission] Error creating project:', error);
        toast({
          title: "Submission Failed",
          description: error.message || "Failed to submit project. Please try again.",
          variant: "destructive",
        });
        return { success: false, project: null, error };
      }

      console.log('[useProjectSubmission] Project created successfully:', project);
      
      toast({
        title: "Project Submitted!",
        description: `Your project has been submitted successfully.`,
      });

      return { success: true, project, error: null };

    } catch (error) {
      console.error('[useProjectSubmission] Unexpected error:', error);
      toast({
        title: "Submission Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return { success: false, project: null, error: error as Error };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitProject,
    isSubmitting,
  };
};