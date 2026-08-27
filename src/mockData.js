// Static admin display identity used by the admin chrome (sidebar footer).
// Real admin data is sourced from the authenticated user in the Redux store;
// this is only a display fallback for the admin shell avatar/name.
export const admin = {
  name: 'Admin',
  email: 'admin@vyloo.com',
  role: 'ROOT',
  avatar: '',
};
