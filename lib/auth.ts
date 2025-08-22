
import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Buscar usuario con información de organización
        const user = await prisma.user.findFirst({
          where: { 
            email: credentials.email,
            estado: 'ACTIVO' // Solo permitir login a usuarios activos
          },
          include: {
            organization: {
              select: {
                id: true,
                name: true,
                slug: true,
                status: true,
                plan: true,
                features: true,
                maxUsers: true,
                maxPatients: true
              }
            }
          }
        });

        if (!user || !user.password) {
          return null;
        }

        // Verificar que la organización esté activa
        if (user.organization?.status === 'suspended' || user.organization?.status === 'cancelled') {
          return null;
        }

        const passwordsMatch = await bcrypt.compare(credentials.password, user.password);

        if (!passwordsMatch) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          firstName: user.firstName || undefined,
          lastName: user.lastName || undefined,
          role: user.role,
          phone: user.phone || undefined,
          especialidad: user.especialidad || undefined,
          organizationId: user.organizationId,
          organizationName: user.organization?.name,
          organizationSlug: user.organization?.slug,
          organizationStatus: user.organization?.status,
          organizationPlan: user.organization?.plan,
          organizationFeatures: user.organization?.features || [],
          organizationMaxUsers: user.organization?.maxUsers,
          organizationMaxPatients: user.organization?.maxPatients,
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.phone = user.phone;
        token.especialidad = user.especialidad;
        token.organizationId = user.organizationId;
        token.organizationName = user.organizationName;
        token.organizationSlug = user.organizationSlug;
        token.organizationStatus = user.organizationStatus;
        token.organizationPlan = user.organizationPlan;
        token.organizationFeatures = user.organizationFeatures;
        token.organizationMaxUsers = user.organizationMaxUsers;
        token.organizationMaxPatients = user.organizationMaxPatients;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub || '';
        session.user.role = token.role as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.phone = token.phone as string;
        session.user.especialidad = token.especialidad as string;
        session.user.organizationId = token.organizationId as string;
        session.user.organizationName = token.organizationName as string;
        session.user.organizationSlug = token.organizationSlug as string;
        session.user.organizationStatus = token.organizationStatus as string;
        session.user.organizationPlan = token.organizationPlan as string;
        session.user.organizationFeatures = token.organizationFeatures as string[];
        session.user.organizationMaxUsers = token.organizationMaxUsers as number;
        session.user.organizationMaxPatients = token.organizationMaxPatients as number;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};

export const getServerAuthSession = () => getServerSession(authOptions);
