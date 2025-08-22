import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name?: string | null;
    firstName?: string;
    lastName?: string;
    role: string;
    phone?: string;
    especialidad?: string;
    organizationId: string;
    organizationName?: string;
    organizationSlug?: string;
    organizationStatus?: string;
    organizationPlan?: string;
    organizationFeatures?: string[];
    organizationMaxUsers?: number;
    organizationMaxPatients?: number;
  }

  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      firstName?: string;
      lastName?: string;
      role: string;
      phone?: string;
      especialidad?: string;
      organizationId: string;
      organizationName?: string;
      organizationSlug?: string;
      organizationStatus?: string;
      organizationPlan?: string;
      organizationFeatures?: string[];
      organizationMaxUsers?: number;
      organizationMaxPatients?: number;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    especialidad?: string;
    organizationId: string;
    organizationName?: string;
    organizationSlug?: string;
    organizationStatus?: string;
    organizationPlan?: string;
    organizationFeatures?: string[];
    organizationMaxUsers?: number;
    organizationMaxPatients?: number;
  }
}