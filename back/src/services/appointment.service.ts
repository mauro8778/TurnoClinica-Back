import { AppDataSource, appointmentModel, doctorModel, userModel } from "../config/data-source";
import { acquireDistributedLock, releaseDistributedLock, deleteCache } from "../config/redis";
import { CreateAppointmentDto, QueryAppointmentDto } from "../dtos/appointment.dto";
import { Appointment, Doctor, User } from "../entities";
import { addEmailJob } from "./queue.service";
import { PaginationResult } from "./user.service";

export const createAppointmentService = async (
  params: CreateAppointmentDto,
  currentUserId: number
): Promise<Appointment> => {
  const targetUserId = params.userId || currentUserId;
  const lockKey = `appointment:${params.doctorId || "gen"}:${params.date}:${params.time}`;

  // 1. Adquirir Bloqueo Distribuido en Redis (Previene doble reserva concurrente)
  const lockToken = await acquireDistributedLock(lockKey, 8); // 8 segundos TTL
  if (!lockToken) {
    const err: any = new Error(
      "Este horario está en proceso de reserva por otro usuario. Por favor intenta con otro turno."
    );
    err.statusCode = 409;
    throw err;
  }

  try {
    return await AppDataSource.transaction("SERIALIZABLE", async (transactionalEntityManager) => {
      // 2. Verificar existencia del paciente
      const user = await transactionalEntityManager.findOne(User, {
        where: { id: targetUserId },
      });

      if (!user) {
        const err: any = new Error(`El paciente con ID ${targetUserId} no existe`);
        err.statusCode = 404;
        throw err;
      }

      // 3. Verificar profesional médico si fue especificado
      let doctor: Doctor | null = null;
      if (params.doctorId) {
        doctor = await transactionalEntityManager.findOne(Doctor, {
          where: { id: params.doctorId, isActive: true },
        });

        if (!doctor) {
          const err: any = new Error(`El médico con ID ${params.doctorId} no está disponible`);
          err.statusCode = 404;
          throw err;
        }

        // 4. Validar que el médico no tenga ya una cita confirmada en esa fecha y hora
        const existingAppointment = await transactionalEntityManager.findOne(Appointment, {
          where: {
            doctor: { id: doctor.id },
            date: params.date,
            time: params.time,
            status: "confirmed",
          },
        });

        if (existingAppointment) {
          const err: any = new Error(
            `El médico seleccionado ya tiene un turno reservado para el ${params.date} a las ${params.time} hs.`
          );
          err.statusCode = 409;
          throw err;
        }
      }

      // 5. Crear la cita médica
      const appointment = transactionalEntityManager.create(Appointment, {
        date: params.date,
        time: params.time,
        description: params.description,
        status: params.status || "confirmed",
        user,
        doctor: doctor || undefined,
      });

      const savedAppointment = await transactionalEntityManager.save(appointment);

      // 6. Invalidar caché de turnos
      await deleteCache("appointments:*");

      // 7. Encolar notificación de confirmación en BullMQ
      await addEmailJob({
        type: "APPOINTMENT_CONFIRMED",
        to: user.email,
        name: user.name,
        payload: {
          id: savedAppointment.id,
          date: savedAppointment.date,
          time: savedAppointment.time,
          description: savedAppointment.description,
          doctorName: doctor ? doctor.name : null,
        },
      });

      return savedAppointment;
    });
  } finally {
    // 8. Liberación atómica del bloqueo distribuido
    await releaseDistributedLock(lockKey, lockToken);
  }
};

export const cancelAppointmentService = async (
  id: number,
  userId?: number,
  userRole?: string
): Promise<Appointment> => {
  const appointment = await appointmentModel.findOne({
    where: { id },
    relations: ["user", "doctor"],
  });

  if (!appointment) {
    const err: any = new Error(`El turno #${id} no existe`);
    err.statusCode = 404;
    throw err;
  }

  // Si no es admin/doctor, verificar que el turno le pertenezca al usuario autenticado
  if (userRole === "patient" && userId && appointment.user.id !== userId) {
    const err: any = new Error("No tienes autorización para cancelar este turno");
    err.statusCode = 403;
    throw err;
  }

  appointment.status = "cancelled";
  const updatedAppointment = await appointmentModel.save(appointment);

  await deleteCache("appointments:*");

  // Notificar cancelación por correo
  if (appointment.user?.email) {
    await addEmailJob({
      type: "APPOINTMENT_CANCELLED",
      to: appointment.user.email,
      name: appointment.user.name,
      payload: {
        id: appointment.id,
        date: appointment.date,
        time: appointment.time,
      },
    });
  }

  return updatedAppointment;
};

export const getAppointmentsService = async (
  query: QueryAppointmentDto
): Promise<PaginationResult<Appointment>> => {
  const page = query.page || 1;
  const limit = query.limit || 20;
  const skip = (page - 1) * limit;

  const queryBuilder = appointmentModel
    .createQueryBuilder("app")
    .leftJoinAndSelect("app.user", "user")
    .leftJoinAndSelect("app.doctor", "doctor")
    .leftJoinAndSelect("doctor.specialty", "specialty")
    .orderBy("app.date", "DESC")
    .addOrderBy("app.time", "ASC")
    .skip(skip)
    .take(limit);

  if (query.date) {
    queryBuilder.andWhere("app.date = :date", { date: query.date });
  }

  if (query.status) {
    queryBuilder.andWhere("app.status = :status", { status: query.status });
  }

  if (query.doctorId) {
    queryBuilder.andWhere("doctor.id = :doctorId", { doctorId: query.doctorId });
  }

  const [data, total] = await queryBuilder.getManyAndCount();

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const getAppointmentByIdService = async (id: number): Promise<Appointment> => {
  const appointment = await appointmentModel.findOne({
    where: { id },
    relations: ["user", "doctor", "doctor.specialty", "triageAssessment"],
  });

  if (!appointment) {
    const err: any = new Error(`El turno con ID ${id} no existe`);
    err.statusCode = 404;
    throw err;
  }

  return appointment;
};
