import { Queue } from "bullmq";
import { redisConfig } from "../config/redis";

export interface EmailJobData {
  type: "WELCOME" | "APPOINTMENT_CONFIRMED" | "APPOINTMENT_CANCELLED" | "TRIAGE_EMERGENCY";
  to: string;
  name: string;
  payload: Record<string, any>;
}

export const emailQueue = new Queue("emailQueue", {
  connection: redisConfig as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: 1000,
    removeOnFail: 5000,
  },
});

export const addEmailJob = async (jobData: EmailJobData): Promise<void> => {
  try {
    await emailQueue.add(jobData.type, jobData);
  } catch (error) {
    console.warn("⚠️ No se pudo encolar en Redis, enviando en fallback local:", error);
    const { processEmailJob } = await import("../queues/email.worker");
    await processEmailJob(jobData).catch((e) => console.error("Error en fallback email:", e));
  }
};
