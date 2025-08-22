
import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import { getAvailableModulesForUser } from '@/lib/module-access';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerAuthSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const organizationFeatures = session.user.organizationFeatures || [];
    const userRole = session.user.role;

    const availableModules = getAvailableModulesForUser(organizationFeatures, userRole);

    return NextResponse.json({
      success: true,
      modules: availableModules,
      user: {
        role: userRole,
        organizationPlan: session.user.organizationPlan,
        organizationFeatures
      }
    });

  } catch (error) {
    console.error('Error fetching available modules:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
