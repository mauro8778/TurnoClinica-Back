import { GoogleGenAI } from "@google/genai";
import { AppDataSource, doctorModel, specialtyModel, triageModel, userModel } from "../config/data-source";
import { envs } from "../config/envs";
import { TriageRequestDto } from "../dtos/triage.dto";
import { Appointment, TriageAssessment, UrgencyLevel, TriageCategory } from "../entities";
import { addEmailJob } from "./queue.service";
import { createAppointmentService } from "./appointment.service";

export interface TriageOutput {
  assessment: TriageAssessment;
  recommendedSpecialty: string;
  isEmergency: boolean;
  scheduledAppointment?: Appointment;
}

export const processAITriageService = async (
  data: TriageRequestDto,
  userId: number
): Promise<TriageOutput> => {
  const user = await userModel.findOne({ where: { id: userId } });
  if (!user) {
    const err: any = new Error("Usuario no encontrado");
    err.statusCode = 404;
    throw err;
  }

  // 1. Ejecutar Evaluación de Triaje Clínico con IA
  const aiEvaluation = await evaluateSymptomsWithAI(data);

  // 2. Persistir la Evaluación de Triaje
  const assessment = triageModel.create({
    user,
    symptoms: data.symptoms,
    duration: data.duration,
    urgencyLevel: aiEvaluation.urgencyLevel,
    category: aiEvaluation.category,
    recommendedSpecialty: aiEvaluation.recommendedSpecialty,
    rationale: aiEvaluation.rationale,
    redFlags: aiEvaluation.redFlags,
    immediateActions: aiEvaluation.immediateActions,
  });

  const savedAssessment = await triageModel.save(assessment);

  const isEmergency = aiEvaluation.urgencyLevel <= 2;

  // 3. Si es Nivel 1 o 2 (Emergencia/Urgencia Crítica), alertar de inmediato
  if (isEmergency) {
    await addEmailJob({
      type: "TRIAGE_EMERGENCY",
      to: user.email,
      name: user.name,
      payload: {
        urgencyLevel: aiEvaluation.urgencyLevel,
        category: aiEvaluation.category,
        symptoms: data.symptoms,
      },
    });
  }

  // 4. Si el usuario solicitó agendamiento automático y no es emergencia vital
  let scheduledAppointment: Appointment | undefined;
  if (data.autoSchedule && !isEmergency) {
    scheduledAppointment = await autoScheduleSpecialtyAppointment(
      user.id,
      aiEvaluation.recommendedSpecialty,
      savedAssessment,
      data.preferredDate
    );
  }

  return {
    assessment: savedAssessment,
    recommendedSpecialty: aiEvaluation.recommendedSpecialty,
    isEmergency,
    scheduledAppointment,
  };
};

/**
 * Motor de IA para Triaje Clínico (Gemini 2.0 / 1.5 con Schema Estructurado y Fallback)
 */
async function evaluateSymptomsWithAI(data: TriageRequestDto): Promise<{
  urgencyLevel: UrgencyLevel;
  category: TriageCategory;
  recommendedSpecialty: string;
  rationale: string;
  redFlags: string[];
  immediateActions: string[];
}> {
  if (envs.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({ apiKey: envs.GEMINI_API_KEY });
      const prompt = `
Eres un Médico Especialista en Triaje de Emergencias Hospitalarias siguiendo el protocolo internacional ESI (Emergency Severity Index).
Evalúa objetivamente la siguiente información clínica del paciente:
- Síntomas reportados: "${data.symptoms}"
- Duración: "${data.duration || "No informada"}"
- Edad del paciente: ${data.patientAge ? `${data.patientAge} años` : "No informada"}
- Antecedentes médicos: ${data.medicalHistory?.join(", ") || "Sin antecedentes"}

Debes responder ÚNICAMENTE con un objeto JSON válido con la siguiente estructura estricta:
{
  "urgencyLevel": 1 | 2 | 3 | 4 | 5,
  "category": "resuscitation" | "emergent" | "urgent" | "semi-urgent" | "non-urgent",
  "recommendedSpecialty": "string (ej: Cardiología, Pediatría, Traumatología, Clínica Médica, Neurología, Guardia)",
  "rationale": "Explicación clínica concisa del nivel asignado",
  "redFlags": ["Lista de signos de alarma a monitorear"],
  "immediateActions": ["Acciones o primeros pasos recomendados mientras espera"]
}
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        return {
          urgencyLevel: Math.max(1, Math.min(5, Number(parsed.urgencyLevel))) as UrgencyLevel,
          category: parsed.category || "urgent",
          recommendedSpecialty: parsed.recommendedSpecialty || "Clínica Médica",
          rationale: parsed.rationale || "Evaluado por modelo clínico de triaje",
          redFlags: Array.isArray(parsed.redFlags) ? parsed.redFlags : [],
          immediateActions: Array.isArray(parsed.immediateActions) ? parsed.immediateActions : [],
        };
      }
    } catch (err: any) {
      console.warn("Aviso en llamada Gemini API, activando motor clínico de fallback:", err.message);
    }
  }

  // Motor Clínico Determinístico de Fallback (100% confiable y sin fallos si no hay API key en local)
  return deterministicClinicalTriage(data.symptoms);
}

function deterministicClinicalTriage(symptoms: string): {
  urgencyLevel: UrgencyLevel;
  category: TriageCategory;
  recommendedSpecialty: string;
  rationale: string;
  redFlags: string[];
  immediateActions: string[];
} {
  const text = symptoms.toLowerCase();

  // Nivel 1: Resuscitation
  if (
    text.includes("inconsciente") ||
    text.includes("paro") ||
    text.includes("no respira") ||
    text.includes("asfixia") ||
    text.includes("convulsionando")
  ) {
    return {
      urgencyLevel: 1,
      category: "resuscitation",
      recommendedSpecialty: "Guardia Médica / Terapia Intensiva",
      rationale: "Amenaza inminente para la vida detectada en los síntomas descriptos.",
      redFlags: ["Pérdida de consciencia", "Falla respiratoria", "Cianosis"],
      immediateActions: [
        "Llamar al servicio de emergencias médicas (107 / 911) inmediatamente",
        "Iniciar maniobras de primeros auxilios si está capacitado",
        "No dejar a la persona desatendida",
      ],
    };
  }

  // Nivel 2: Emergent
  if (
    text.includes("pecho") ||
    text.includes("infarto") ||
    text.includes("brazo izquierdo") ||
    text.includes("ahogo") ||
    text.includes("sangrado abundante") ||
    text.includes("parálisis")
  ) {
    return {
      urgencyLevel: 2,
      category: "emergent",
      recommendedSpecialty: "Cardiología / Guardia",
      rationale: "Síntomas altamente sugestivos de cuadro coronario o emergencia vascular aguda.",
      redFlags: ["Dolor precordial opresivo", "Sudoración fría", "Disnea aguda"],
      immediateActions: [
        "Acudir de inmediato al servicio de guardia más cercano",
        "Evitar esfuerzos físicos",
        "Permanecer en reposo absoluto en posición semisentada",
      ],
    };
  }

  // Nivel 3: Urgent
  if (
    text.includes("fractura") ||
    text.includes("golpe fuerte") ||
    text.includes("dolor abdominal") ||
    text.includes("apendicitis") ||
    text.includes("fiebre alta")
  ) {
    return {
      urgencyLevel: 3,
      category: "urgent",
      recommendedSpecialty: text.includes("fractura") || text.includes("golpe") ? "Traumatología" : "Clínica Médica",
      rationale: "Cuadro agudo que requiere evaluación diagnóstica en consultorio o guardia en las próximas horas.",
      redFlags: ["Abdomen en tabla", "Imposibilidad de apoyar la extremidad", "Fiebre persistente > 39°C"],
      immediateActions: [
        "Inmovilizar la zona en caso de traumatismo",
        "Mantener ayuno ante sospecha quirúrgica abdominal",
        "Controlar temperatura cada 2 horas",
      ],
    };
  }

  // Nivel 4 o 5: Semi-Urgent / Non-Urgent
  const isPediatric = text.includes("niño") || text.includes("bebé") || text.includes("hijo") || text.includes("hija");
  const isSkin = text.includes("mancha") || text.includes("sarpullido") || text.includes("piel") || text.includes("grano");

  let specialty = "Clínica Médica";
  if (isPediatric) specialty = "Pediatría";
  else if (isSkin) specialty = "Dermatología";

  return {
    urgencyLevel: 4,
    category: "semi-urgent",
    recommendedSpecialty: specialty,
    rationale: "Síntomas no amenazantes para la vida que se benefician de consulta médica programada.",
    redFlags: ["Aparición repentina de fiebre alta", "Dificultad para respirar"],
    immediateActions: [
      "Mantener buena hidratación oral",
      "Registrar evolución de los síntomas",
      "Asistir a la cita médica asignada",
    ],
  };
}

/**
 * Asigna automáticamente un turno con un médico de la especialidad recomendada
 */
async function autoScheduleSpecialtyAppointment(
  userId: number,
  specialtyName: string,
  triage: TriageAssessment,
  preferredDate?: string
): Promise<Appointment | undefined> {
  try {
    // Buscar médico disponible de la especialidad
    const doctor = await doctorModel
      .createQueryBuilder("doc")
      .leftJoinAndSelect("doc.specialty", "spec")
      .where("LOWER(spec.name) LIKE LOWER(:name)", { name: `%${specialtyName.split(" ")[0]}%` })
      .andWhere("doc.isActive = :active", { active: true })
      .getOne();

    // Fecha propuesta: preferida o mañana
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const targetDate = preferredDate || tomorrow.toISOString().split("T")[0];
    const targetTime = "10:00"; // Slot por defecto de la mañana

    const appointment = await createAppointmentService(
      {
        date: targetDate,
        time: targetTime,
        description: `Derivado por Triaje IA (${triage.recommendedSpecialty} - Nivel ${triage.urgencyLevel})`,
        doctorId: doctor ? doctor.id : undefined,
        status: "confirmed",
        userId,
      },
      userId
    );

    // Asociar bidireccionalmente el triaje con la cita creada
    triage.appointment = appointment;
    await triageModel.save(triage);

    return appointment;
  } catch (err: any) {
    console.warn("Aviso en agendamiento automático por triaje:", err.message);
    return undefined;
  }
}
