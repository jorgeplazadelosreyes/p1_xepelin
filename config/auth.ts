/**
 * Authentication configuration for the application
 */

export const authConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  url: process.env.NEXTAUTH_URL,

  loginUrl: '/login',
  homeUrl: '/',

  demoCredentials: {
    id: '1',
    name: 'Demo User',
    email: 'user@example.com',
    password: 'password',
  }
};
