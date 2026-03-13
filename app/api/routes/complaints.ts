/**
 * Complaints / Grievance Routes
 */
import { apiFetch } from '../api';

export const complaintRoutes = {
  /** File a new complaint (text) */
  fileComplaint: (title: string, description: string, department?: string) =>
    apiFetch('/complaints/file', {
      method: 'POST',
      body: JSON.stringify({ title, description, department }),
    }),

  /** Get all complaints with tracking info */
  getComplaints: () =>
    apiFetch('/complaints'),

  /** Get specific complaint details */
  getComplaintById: (complaintId: string) =>
    apiFetch(`/complaints/${complaintId}`),

  /** Escalate a complaint */
  escalateComplaint: (complaintId: string, reason: string) =>
    apiFetch(`/complaints/${complaintId}/escalate`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
};
