
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-cal-signature');
    
    // Parse the webhook payload
    let payload;
    try {
      payload = JSON.parse(body);
    } catch (error) {
      console.error('Invalid JSON payload:', error);
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { triggerEvent, payload: eventData } = payload;

    console.log('Cal.com webhook received:', triggerEvent, eventData);

    // Process different event types
    switch (triggerEvent) {
      case 'BOOKING_CREATED':
        await handleBookingCreated(eventData);
        break;
      case 'BOOKING_CANCELLED':
        await handleBookingCancelled(eventData);
        break;
      case 'BOOKING_RESCHEDULED':
        await handleBookingRescheduled(eventData);
        break;
      case 'BOOKING_CONFIRMED':
        await handleBookingConfirmed(eventData);
        break;
      default:
        console.log(`Unhandled event type: ${triggerEvent}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Processing error' }, { status: 500 });
  }
}

async function handleBookingCreated(data: any) {
  try {
    const { id, uid, title, description, startTime, endTime, attendees, organizer } = data;

    // Find the doctor by email (assuming the organizer email matches a user in the system)
    const doctor = await prisma.user.findFirst({
      where: {
        email: organizer.email,
        role: { in: ['DOCTOR', 'ADMIN'] }
      }
    });

    if (!doctor) {
      console.log('Doctor not found for email:', organizer.email);
      return;
    }

    // Try to find or create patient based on attendee email
    let patient = null;
    if (attendees && attendees.length > 0) {
      const attendeeEmail = attendees[0].email;
      const attendeeName = attendees[0].name;
      
      // Find existing patient
      patient = await prisma.patient.findFirst({
        where: { email: attendeeEmail }
      });

      // Create patient if not found
      if (!patient && attendeeName) {
        const [firstName, ...lastNameParts] = attendeeName.split(' ');
        const lastName = lastNameParts.join(' ') || firstName;

        patient = await prisma.patient.create({
          data: {
            firstName: firstName,
            lastName: lastName,
            email: attendeeEmail,
            phone: attendees[0].phone || '',
            status: 'Activo'
          }
        });
      }
    }

    if (!patient) {
      console.log('Could not create/find patient for booking');
      return;
    }

    // Parse dates
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    
    // Create appointment in SmileSys
    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        date: startDate,
        startTime: startDate.toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }),
        endTime: endDate.toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }),
        type: title || 'Consulta',
        reason: description || 'Cita programada desde Cal.com',
        status: 'Programada',
        duration: Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60)),
        calComBookingId: id.toString(),
        calComEventId: uid,
        syncStatus: 'synced'
      }
    });

    console.log('Appointment created from Cal.com:', appointment.id);

  } catch (error) {
    console.error('Error handling booking created:', error);
  }
}

async function handleBookingCancelled(data: any) {
  try {
    const { id } = data;

    // Find and update the appointment
    const appointment = await prisma.appointment.findFirst({
      where: { calComBookingId: id.toString() }
    });

    if (appointment) {
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: {
          status: 'Cancelada',
          syncStatus: 'synced',
          notes: (appointment.notes || '') + '\n[Cancelada desde Cal.com]'
        }
      });

      console.log('Appointment cancelled from Cal.com:', appointment.id);
    }

  } catch (error) {
    console.error('Error handling booking cancelled:', error);
  }
}

async function handleBookingRescheduled(data: any) {
  try {
    const { id, startTime, endTime } = data;

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    // Find and update the appointment
    const appointment = await prisma.appointment.findFirst({
      where: { calComBookingId: id.toString() }
    });

    if (appointment) {
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: {
          date: startDate,
          startTime: startDate.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          }),
          endTime: endDate.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          }),
          duration: Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60)),
          syncStatus: 'synced',
          notes: (appointment.notes || '') + '\n[Reagendada desde Cal.com]'
        }
      });

      console.log('Appointment rescheduled from Cal.com:', appointment.id);
    }

  } catch (error) {
    console.error('Error handling booking rescheduled:', error);
  }
}

async function handleBookingConfirmed(data: any) {
  try {
    const { id } = data;

    // Find and update the appointment
    const appointment = await prisma.appointment.findFirst({
      where: { calComBookingId: id.toString() }
    });

    if (appointment) {
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: {
          status: 'Confirmada',
          syncStatus: 'synced',
          notes: (appointment.notes || '') + '\n[Confirmada desde Cal.com]'
        }
      });

      console.log('Appointment confirmed from Cal.com:', appointment.id);
    }

  } catch (error) {
    console.error('Error handling booking confirmed:', error);
  }
}
