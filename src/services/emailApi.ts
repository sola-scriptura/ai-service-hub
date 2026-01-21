import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Email Notification Service
 *
 * This service handles email notifications for project events.
 *
 * IMPORTANT: For production use, you need to set up one of the following:
 *
 * Option 1: Supabase Edge Functions with Resend/SendGrid
 * - Create an Edge Function that sends emails
 * - Call the Edge Function from this service
 *
 * Option 2: Supabase Database Webhooks
 * - Set up a webhook trigger on the email_notifications table
 * - Use a service like Zapier, Make, or n8n to send emails
 *
 * Option 3: External Email Service (Resend, SendGrid, etc.)
 * - Requires a backend server or Edge Function
 * - Store API keys securely in environment variables
 *
 * For now, this service logs notifications to the email_notifications table
 * and can optionally call an Edge Function if configured.
 */

export interface EmailNotification {
  id: string;
  recipientEmail: string;
  recipientName: string | null;
  subject: string;
  body: string;
  notificationType: 'project_submitted' | 'status_changed';
  projectId: string | null;
  status: 'pending' | 'sent' | 'failed';
  errorMessage: string | null;
  createdAt: string;
  sentAt: string | null;
}

export interface ProjectEmailData {
  projectId: string;
  projectTitle: string;
  serviceTitle: string;
  expertName: string | null;
  clientName: string | null;
  clientEmail: string;
  finalPrice: number;
  urgency: string;
  complexity: string;
  status: string;
  submittedAt: string;
}

// Email templates
const emailTemplates = {
  projectSubmitted: (data: ProjectEmailData, isAdmin: boolean) => ({
    subject: isAdmin
      ? `New Project Submitted: ${data.projectTitle}`
      : `Your Project Has Been Submitted: ${data.projectTitle}`,
    body: `
${isAdmin ? 'A new project has been submitted and requires your attention.' : 'Thank you for submitting your project!'}

Project Details:
----------------
Title: ${data.projectTitle}
Service: ${data.serviceTitle}
Selected Expert: ${data.expertName || 'To be assigned'}
${isAdmin ? `Client: ${data.clientName || 'N/A'} (${data.clientEmail})` : ''}

Quote Breakdown:
---------------
Final Price: $${data.finalPrice.toFixed(2)}
Urgency: ${data.urgency}
Complexity: ${data.complexity}

Status: ${data.status.replace('_', ' ').toUpperCase()}
Submitted: ${new Date(data.submittedAt).toLocaleString()}

${isAdmin
  ? 'Please review the project and update its status in the admin dashboard.'
  : 'We will review your project and get back to you shortly. You can track your project status in your dashboard.'
}

---
AI Service Hub
    `.trim(),
  }),

  statusChanged: (data: ProjectEmailData, oldStatus: string, newStatus: string, isAdmin: boolean) => ({
    subject: `Project Status Updated: ${data.projectTitle}`,
    body: `
${isAdmin ? 'A project status has been updated.' : 'Your project status has been updated!'}

Project: ${data.projectTitle}
Service: ${data.serviceTitle}

Status Change: ${oldStatus.replace('_', ' ').toUpperCase()} → ${newStatus.replace('_', ' ').toUpperCase()}

${getStatusMessage(newStatus, isAdmin)}

${isAdmin
  ? `Client: ${data.clientName || 'N/A'} (${data.clientEmail})`
  : 'You can view your project details in your dashboard.'
}

---
AI Service Hub
    `.trim(),
  }),
};

function getStatusMessage(status: string, isAdmin: boolean): string {
  const messages: Record<string, { admin: string; client: string }> = {
    pending: {
      admin: 'The project is awaiting review.',
      client: 'Your project is in queue and will be reviewed shortly.',
    },
    in_progress: {
      admin: 'Work has started on this project.',
      client: 'Great news! Work has begun on your project.',
    },
    completed: {
      admin: 'The project has been completed.',
      client: 'Your project has been completed! Please check your dashboard to download the deliverables.',
    },
    revision: {
      admin: 'The project requires revision.',
      client: 'Your project is being revised based on feedback.',
    },
    cancelled: {
      admin: 'The project has been cancelled.',
      client: 'Your project has been cancelled. If you have questions, please contact support.',
    },
  };

  return messages[status]?.[isAdmin ? 'admin' : 'client'] || '';
}

export const emailApi = {
  /**
   * Send project submission notification to client and admin
   */
  async sendProjectSubmittedNotification(
    projectData: ProjectEmailData,
    adminEmail: string
  ): Promise<{ success: boolean; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      console.log('[emailApi] Supabase not configured, skipping email');
      return { success: false, error: new Error('Supabase not configured') };
    }

    try {
      console.log('[emailApi] Sending project submitted notifications...');

      // Create notification for client
      const clientEmail = emailTemplates.projectSubmitted(projectData, false);
      await this.createNotificationRecord({
        recipientEmail: projectData.clientEmail,
        recipientName: projectData.clientName,
        subject: clientEmail.subject,
        body: clientEmail.body,
        notificationType: 'project_submitted',
        projectId: projectData.projectId,
      });

      // Create notification for admin
      const adminEmailContent = emailTemplates.projectSubmitted(projectData, true);
      await this.createNotificationRecord({
        recipientEmail: adminEmail,
        recipientName: 'Admin',
        subject: adminEmailContent.subject,
        body: adminEmailContent.body,
        notificationType: 'project_submitted',
        projectId: projectData.projectId,
      });

      // Try to send via Edge Function if available
      await this.triggerEmailSend(projectData.projectId);

      console.log('[emailApi] Project submitted notifications created');
      return { success: true, error: null };
    } catch (error) {
      console.error('[emailApi] Error sending project submitted notification:', error);
      return { success: false, error: error as Error };
    }
  },

  /**
   * Send status change notification to client and admin
   */
  async sendStatusChangeNotification(
    projectData: ProjectEmailData,
    oldStatus: string,
    newStatus: string,
    adminEmail: string
  ): Promise<{ success: boolean; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      console.log('[emailApi] Supabase not configured, skipping email');
      return { success: false, error: new Error('Supabase not configured') };
    }

    try {
      console.log('[emailApi] Sending status change notifications...');

      // Create notification for client
      const clientEmail = emailTemplates.statusChanged(projectData, oldStatus, newStatus, false);
      await this.createNotificationRecord({
        recipientEmail: projectData.clientEmail,
        recipientName: projectData.clientName,
        subject: clientEmail.subject,
        body: clientEmail.body,
        notificationType: 'status_changed',
        projectId: projectData.projectId,
      });

      // Create notification for admin
      const adminEmailContent = emailTemplates.statusChanged(projectData, oldStatus, newStatus, true);
      await this.createNotificationRecord({
        recipientEmail: adminEmail,
        recipientName: 'Admin',
        subject: adminEmailContent.subject,
        body: adminEmailContent.body,
        notificationType: 'status_changed',
        projectId: projectData.projectId,
      });

      // Try to send via Edge Function if available
      await this.triggerEmailSend(projectData.projectId);

      console.log('[emailApi] Status change notifications created');
      return { success: true, error: null };
    } catch (error) {
      console.error('[emailApi] Error sending status change notification:', error);
      return { success: false, error: error as Error };
    }
  },

  /**
   * Create a notification record in the database
   */
  async createNotificationRecord(data: {
    recipientEmail: string;
    recipientName: string | null;
    subject: string;
    body: string;
    notificationType: string;
    projectId: string | null;
  }): Promise<{ id: string | null; error: Error | null }> {
    try {
      const { data: notification, error } = await supabase!
        .from('email_notifications')
        .insert({
          recipient_email: data.recipientEmail,
          recipient_name: data.recipientName,
          subject: data.subject,
          body: data.body,
          notification_type: data.notificationType,
          project_id: data.projectId,
          status: 'pending',
        })
        .select('id')
        .single();

      if (error) throw error;

      return { id: notification?.id || null, error: null };
    } catch (error) {
      console.error('[emailApi] Error creating notification record:', error);
      return { id: null, error: error as Error };
    }
  },

  /**
   * Trigger email sending via Edge Function (if configured)
   * This is a placeholder - implement based on your email provider
   */
  async triggerEmailSend(projectId: string): Promise<void> {
    try {
      // Check if Edge Function is available
      const edgeFunctionUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!edgeFunctionUrl) return;

      // Try to invoke the send-email Edge Function
      const { error } = await supabase!.functions.invoke('send-email', {
        body: { projectId },
      });

      if (error) {
        // Edge Function not available - emails will be sent manually or via webhook
        console.log('[emailApi] Edge Function not available, notifications stored for manual processing');
      }
    } catch {
      // Silently fail - Edge Function is optional
      console.log('[emailApi] Edge Function invocation skipped');
    }
  },

  /**
   * Get pending notifications (for manual processing or debugging)
   */
  async getPendingNotifications(): Promise<EmailNotification[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const { data, error } = await supabase!
        .from('email_notifications')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;

      return (data || []).map((n) => ({
        id: n.id,
        recipientEmail: n.recipient_email,
        recipientName: n.recipient_name,
        subject: n.subject,
        body: n.body,
        notificationType: n.notification_type as 'project_submitted' | 'status_changed',
        projectId: n.project_id,
        status: n.status as 'pending' | 'sent' | 'failed',
        errorMessage: n.error_message,
        createdAt: n.created_at,
        sentAt: n.sent_at,
      }));
    } catch (error) {
      console.error('[emailApi] Error fetching pending notifications:', error);
      return [];
    }
  },

  /**
   * Mark notification as sent
   */
  async markAsSent(notificationId: string): Promise<void> {
    if (!isSupabaseConfigured()) return;

    try {
      await supabase!
        .from('email_notifications')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
        })
        .eq('id', notificationId);
    } catch (error) {
      console.error('[emailApi] Error marking notification as sent:', error);
    }
  },

  /**
   * Mark notification as failed
   */
  async markAsFailed(notificationId: string, errorMessage: string): Promise<void> {
    if (!isSupabaseConfigured()) return;

    try {
      await supabase!
        .from('email_notifications')
        .update({
          status: 'failed',
          error_message: errorMessage,
        })
        .eq('id', notificationId);
    } catch (error) {
      console.error('[emailApi] Error marking notification as failed:', error);
    }
  },

  /**
   * Get admin email for notifications
   * Uses the get_admin_email() RPC function to bypass RLS and avoid recursion
   */
  async getAdminEmail(): Promise<string | null> {
    if (!isSupabaseConfigured()) return null;

    try {
      console.log('[emailApi] Getting admin email via RPC function...');

      // Use the RPC function to avoid RLS recursion issues
      const { data, error } = await supabase!.rpc('get_admin_email');

      if (error) {
        console.error('[emailApi] RPC get_admin_email error:', error.message);
        console.log('[emailApi] Falling back to direct query...');

        // Fallback to direct query (may fail with RLS recursion)
        const { data: fallbackData, error: fallbackError } = await supabase!
          .from('profiles')
          .select('email')
          .eq('role', 'admin')
          .order('created_at', { ascending: true })
          .limit(1)
          .single();

        if (fallbackError || !fallbackData) {
          console.error('[emailApi] Fallback query also failed:', fallbackError?.message);
          return null;
        }
        return fallbackData.email;
      }

      console.log('[emailApi] Admin email retrieved:', data ? 'found' : 'not found');
      return data as string | null;
    } catch (error) {
      console.error('[emailApi] Error getting admin email:', error);
      return null;
    }
  },
};
