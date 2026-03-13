/**
 * User Profile & Documents Routes
 */
import { apiFetch } from '../api';

export const userRoutes = {
  /** Get user profile */
  getProfile: () =>
    apiFetch('/user/profile'),

  /** Update user profile */
  updateProfile: (data: Record<string, any>) =>
    apiFetch('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  /** Upload a document (base64 encoded) */
  uploadDocument: (docType: string, base64Data: string, filename: string) =>
    apiFetch('/user/documents/upload', {
      method: 'POST',
      body: JSON.stringify({ doc_type: docType, data: base64Data, filename }),
    }),

  /** Get uploaded documents list */
  getDocuments: () =>
    apiFetch('/user/documents'),

  /** Update language preference */
  setLanguage: (language: 'en' | 'hi') =>
    apiFetch('/user/preferences/language', {
      method: 'PUT',
      body: JSON.stringify({ language }),
    }),

  /** Upload profile picture (base64 encoded) */
  uploadProfilePic: (base64Data: string, mimeType: string) =>
    apiFetch('/user/profile-pic', {
      method: 'POST',
      body: JSON.stringify({ data: base64Data, mime_type: mimeType }),
    }),

  /** Get profile picture URL */
  getProfilePic: () =>
    apiFetch('/user/profile-pic'),
};
