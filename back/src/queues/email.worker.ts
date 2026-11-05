import { Worker, Job } from "bullmq";
import nodemailer, { Transporter } from "nodemailer";
import { redisConfig } from "../config/redis";
import { envs } from "../config/envs";
import { EmailJobData } from "../services/queue.service";

let transporter: Transporter | null = null;

function getMailTransporter(): Transporter {
  if (!transporter) {
    if (envs.SMTP_USER && envs.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: envs.SMTP_USER,
          pass: envs.SMTP_PASS,
        },
      });
    } else {
      // Stream transport para logs si no hay credenciales configuradas
      transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
    }
  }
  return transporter;
}

export async function processEmailJob(data: EmailJobData): Promise<void> {
  const mailer = getMailTransporter();
  let subject = "";
  let html = "";

  switch (data.type) {
    case "WELCOME":
      subject = "¡Bienvenido/a a Clínica Osorio!";
      html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #0284c7;">¡Hola ${data.name}!</h2>
          <p>Tu cuenta ha sido creada exitosamente en <strong>TurnoClínica</strong>.</p>
          <p>Ahora puedes solicitar turnos y utilizar nuestro sistema de <strong>Triaje Médico con Inteligencia Artificial</strong>.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b;">Clínica Osorio - Cuidado médico a tu alcance.</p>
        </div>
      `;
      break;

    case "APPOINTMENT_CONFIRMED":
      subject = `Turno Confirmado: ${data.payload.date} ${data.payload.time} hs`;
      html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #16a34a;">¡Tu turno está confirmado, ${data.name}!</h2>
          <p><strong>Detalles de la cita:</strong></p>
          <ul>
            <li><strong>Fecha:</strong> ${data.payload.date}</li>
            <li><strong>Hora:</strong> ${data.payload.time} hs</li>
            <li><strong>Motivo / Especialidad:</strong> ${data.payload.description}</li>
            ${data.payload.doctorName ? `<li><strong>Profesional:</strong> Dr/a. ${data.payload.doctorName}</li>` : ""}
          </ul>
          <p>Por favor preséntate 10 minutos antes en recepción con tu DNI.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b;">Clínica Osorio - Sistema Inteligente de Turnos.</p>
        </div>
      `;
      break;

    case "APPOINTMENT_CANCELLED":
      subject = `Cancelación de Turno #${data.payload.id}`;
      html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #dc2626;">Turno Cancelado</h2>
          <p>Hola ${data.name}, te informamos que el turno programado para el <strong>${data.payload.date}</strong> a las <strong>${data.payload.time} hs</strong> ha sido cancelado.</p>
          <p>Si deseas reprogramar, puedes ingresar a la plataforma en cualquier momento.</p>
        </div>
      `;
      break;

    case "TRIAGE_EMERGENCY":
      subject = `⚠️ ALERTA MÉDICA: Nivel de Urgencia Crítico`;
      html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #7f1d1d; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px;">
          <h2>Atención Inmediata Requerida</h2>
          <p>Hola ${data.name},</p>
          <p>Según la evaluación de síntomas realizada, tu situación ha sido clasificada con <strong>Nivel de Urgencia ${data.payload.urgencyLevel} (${data.payload.category})</strong>.</p>
          <p><strong>Recomendación:</strong> Por favor dirígete inmediatamente a la Guardia Médica más cercana o comunícate al servicio de emergencias médicas (107 / 911).</p>
        </div>
      `;
      break;
  }

  await mailer.sendMail({
    from: envs.EMAIL_FROM,
    to: data.to,
    subject,
    html,
  });

  console.log(`✉️ [EmailWorker] Correo enviado exitosamente a: ${data.to} | Tipo: ${data.type}`);
}

export const startEmailWorker = () => {
  try {
    const worker = new Worker<EmailJobData>(
      "emailQueue",
      async (job: Job<EmailJobData>) => {
        await processEmailJob(job.data);
      },
      {
        // @ts-ignore
        connection: redisConfig,
        concurrency: 10, // 10 envíos concurrentes por worker
      }
    );

    worker.on("completed", (job) => {
      console.log(`✅ [Worker] Trabajo ${job.id} completado`);
    });

    worker.on("failed", (job, err) => {
      console.error(`❌ [Worker] Trabajo ${job?.id} falló:`, err.message);
    });

    console.log("🚀 BullMQ Email Worker iniciado correctamente");
    return worker;
  } catch (err: any) {
    console.warn("⚠️ No se pudo iniciar el Worker de BullMQ (Redis inactivo):", err.message);
    return null;
  }
};
