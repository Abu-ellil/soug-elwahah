// Main index file for types
export * from './user';
export * from './store';
export * from './driver';
export * from './order';

// Admin type
export interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: string[];
  avatar?: string;
}