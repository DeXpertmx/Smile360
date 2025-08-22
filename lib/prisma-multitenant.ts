
import { PrismaClient } from '@prisma/client';

// Cache de clientes Prisma por organización
const prismaClients = new Map<string, PrismaClient>();

// Cliente global sin filtro de organización (para operaciones de sistema)
export const prisma = new PrismaClient({
  log: ['error'],
});

export function getPrismaForOrganization(organizationId: string): PrismaClient {
  if (!prismaClients.has(organizationId)) {
    const client = new PrismaClient({
      log: ['error'],
    });

    // Extender el cliente con middleware para filtrado automático por organización
    client.$use(async (params, next) => {
      const modelsWithOrgId = [
        'User', 'Patient', 'Appointment', 'Treatment', 'Invoice', 
        'Budget', 'Prescription', 'LabOrder', 'Expense'
      ];

      // Solo agregar filtro de organización a modelos que lo tengan
      if (modelsWithOrgId.includes(params.model || '')) {
        // Para consultas de lectura
        if (params.action === 'findMany' || params.action === 'findFirst' || params.action === 'findUnique') {
          if (!params.args) params.args = {};
          if (!params.args.where) params.args.where = {};
          
          // Solo agregar filtro si no existe ya
          if (!params.args.where.organizationId) {
            params.args.where.organizationId = organizationId;
          }
        }
        
        // Para operaciones de escritura
        if (params.action === 'create') {
          if (!params.args) params.args = {};
          if (!params.args.data) params.args.data = {};
          
          // Agregar organizationId a datos de creación si no existe
          if (!params.args.data.organizationId) {
            params.args.data.organizationId = organizationId;
          }
        }
        
        // Para actualizaciones masivas
        if (params.action === 'updateMany' || params.action === 'deleteMany') {
          if (!params.args) params.args = {};
          if (!params.args.where) params.args.where = {};
          
          if (!params.args.where.organizationId) {
            params.args.where.organizationId = organizationId;
          }
        }
      }

      return next(params);
    });

    prismaClients.set(organizationId, client);
  }

  return prismaClients.get(organizationId)!;
}

export function clearPrismaCache() {
  for (const [_, client] of prismaClients) {
    client.$disconnect();
  }
  prismaClients.clear();
}
