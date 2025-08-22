
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const config = await prisma.calComConfig.findUnique({
      where: { userId: session.user.id }
    });

    if (!config) {
      return NextResponse.json({
        isConnected: false,
        syncEnabled: false,
        autoSync: false,
        webhookEvents: ['BOOKING_CREATED', 'BOOKING_CANCELLED', 'BOOKING_RESCHEDULED']
      });
    }

    return NextResponse.json({
      isConnected: config.isConnected,
      syncEnabled: config.syncEnabled,
      autoSync: config.autoSync,
      webhookUrl: config.webhookUrl,
      lastSync: config.lastSync?.toISOString(),
      syncErrors: config.syncErrors,
      webhookEvents: config.webhookEvents,
      apiKey: config.apiKey ? '***masked***' : null,
      calId: config.calId
    });

  } catch (error) {
    console.error('Error fetching Cal.com settings:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { apiKey, calId, syncEnabled, autoSync, webhookEvents } = await request.json();

    if (!apiKey || !calId) {
      return NextResponse.json({ error: 'API Key y Cal ID son requeridos' }, { status: 400 });
    }

    // Generate webhook URL
    const webhookUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/calcom/webhook`;

    const config = await prisma.calComConfig.upsert({
      where: { userId: session.user.id },
      update: {
        apiKey,
        calId,
        syncEnabled,
        autoSync,
        webhookUrl,
        webhookEvents: webhookEvents || ['BOOKING_CREATED', 'BOOKING_CANCELLED', 'BOOKING_RESCHEDULED'],
        isConnected: true,
        isEnabled: true,
        updatedAt: new Date()
      },
      create: {
        userId: session.user.id,
        apiKey,
        calId,
        syncEnabled,
        autoSync,
        webhookUrl,
        webhookEvents: webhookEvents || ['BOOKING_CREATED', 'BOOKING_CANCELLED', 'BOOKING_RESCHEDULED'],
        isConnected: true,
        isEnabled: true
      }
    });

    return NextResponse.json({
      isConnected: config.isConnected,
      syncEnabled: config.syncEnabled,
      autoSync: config.autoSync,
      webhookUrl: config.webhookUrl,
      webhookEvents: config.webhookEvents,
      calId: config.calId
    });

  } catch (error) {
    console.error('Error saving Cal.com settings:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const updates = await request.json();

    const config = await prisma.calComConfig.update({
      where: { userId: session.user.id },
      data: {
        ...updates,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      isConnected: config.isConnected,
      syncEnabled: config.syncEnabled,
      autoSync: config.autoSync,
      webhookUrl: config.webhookUrl,
      webhookEvents: config.webhookEvents
    });

  } catch (error) {
    console.error('Error updating Cal.com settings:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
