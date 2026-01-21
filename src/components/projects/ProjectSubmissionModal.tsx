import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ProjectSubmissionForm from './ProjectSubmissionForm';

interface ProjectSubmissionModalProps {
  open: boolean;
  onClose: () => void;
}

const ProjectSubmissionModal = ({ open, onClose }: ProjectSubmissionModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Submit Project</DialogTitle>
        </DialogHeader>
        <ProjectSubmissionForm
          onSuccess={onClose}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ProjectSubmissionModal;