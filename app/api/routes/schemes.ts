/**
 * Schemes Routes — Eligibility, Details, Applications
 */
import { apiFetch } from '../api';

export const schemeRoutes = {
  /** Get all eligible schemes for the current user */
  getEligibleSchemes: () =>
    apiFetch('/schemes/eligible'),

  /** Get registered/active schemes */
  getRegisteredSchemes: () =>
    apiFetch('/schemes/registered'),

  /** Get dynamic form schema for a specific scheme */
  getFormSchema: (schemeId: string) =>
    apiFetch(`/schemes/${schemeId}/form-schema`),

  /** Submit scheme application */
  submitApplication: (schemeId: string, formData: Record<string, any>) =>
    apiFetch(`/schemes/${schemeId}/apply`, {
      method: 'POST',
      body: JSON.stringify(formData),
    }),

  /** Get application status timeline */
  getApplicationStatus: () =>
    apiFetch('/schemes/applications/status'),
};
