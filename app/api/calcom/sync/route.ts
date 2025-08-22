
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Get Cal.com configuration
    const config = await prisma.calComConfig.findUnique({
      where: { userId: session.user.id }
    });

    if (!config || !config.isConnected || !config.apiKey || !config.calId) {
      return NextResponse.json({ error: 'Cal.com no está configurado' }, { status: 400 });
    }

    let synchronizedCount = 0;
    let errors = [];

    try {
      // Get bookings from Cal.com
      const response = await fetch(`https://api.cal.com/v1/bookings`, {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Cal.com API error: ${response.statusText}`);
      }

      const data = await response.json();
      const bookings = data.bookings || [];

      for (const booking of bookings) {
        try {
          // Check if appointment already exists
          const existingAppointment = await prisma.appointment.findFirst({
            where: { calComBookingId: booking.id.toString() }
          });

          if (!existingAppointment) {
            // Try to find the patient
            let patient = null;
            if (booking.attendees && booking.attendees.length > 0) {
              const attendee = booking.attendees[0];
              
              patient = await prisma.patient.findFirst({
                where: { email: attendee.email }
              });

              // Create patient if not found
              if (!patient && attendee.name) {
                const [firstName, ...lastNameParts] = attendee.name.split(' ');
                const lastName = lastNameParts.join(' ') || firstName;

                patient = await prisma.patient.create({
                  data: {
                    firstName: firstName,
                    lastName: lastName,
                    email: attendee.email,
                    phone: attendee.phone || '',
                    status: 'Activo'
                  }
                });
              }
            }

            if (patient) {
              // Create the appointment
              const startDate = new Date(booking.startTime);
              const endDate = new Date(booking.endTime);

              await prisma.appointment.create({
                data: {
                  patientId: patient.id,
                  doctorId: session.user.id,
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
                  type: booking.title || 'Consulta',
                  reason: booking.description || 'Cita desde Cal.com',
                  status: booking.status === 'CANCELLED' ? 'Cancelada' : 'Programada',
                  duration: Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60)),
                  calComBookingId: booking.id.toString(),
                  calComEventId: booking.uid,
                  syncStatus: 'synced'
                }
              });

              synchronizedCount++;
            }
          } else {
            // Update existing appointment if needed
            const startDate = new Date(booking.startTime);
            const endDate = new Date(booking.endTime);
            
            await prisma.appointment.update({
              where: { id: existingAppointment.id },
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
                status: booking.status === 'CANCELLED' ? 'Cancelada' : 'Programada',
                syncStatus: 'synced'
              }
            });
          }
        } catch (bookingError) {
          console.error('Error processing booking:', booking.id, bookingError);
          errors.push(`Booking ${booking.id}: ${bookingError}`);
        }
      }

    } catch (apiError) {
      console.error('Cal.com API error:', apiError);
      errors.push(`API Error: ${apiError}`);
    }

    // Update the config with sync info
    await prisma.calComConfig.update({
      where: { userId: session.user.id },
      data: {
        lastSync: new Date(),
        syncErrors: errors.length > 0 ? errors.join('\n') : null
      }
    });

    return NextResponse.json({ 
      synchronized: synchronizedCount,
      errors: errors.length > 0 ? errors : null
    });

  } catch (error) {
    console.error('Error in manual sync:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
