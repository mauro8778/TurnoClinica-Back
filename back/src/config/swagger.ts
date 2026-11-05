import { PORT } from "./envs";

export const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "🏥 TurnoClínica Enterprise API & AI Medical Triage",
    version: "2.0.0",
    description: `
API RESTful de alto rendimiento diseñada para una escala de **+1,000,000 de usuarios diarios**.
Cuenta con:
- **Prevención de Condiciones de Carrera (Race Conditions)** mediante **Bloqueos Distribuidos en Redis (Redlock Mutex)**.
- **Procesamiento Asíncrono Desacoplado** de correos y alertas críticas usando **BullMQ Streams**.
- **Motor de Triaje Médico con Inteligencia Artificial** basado en el protocolo internacional **ESI (Emergency Severity Index Levels 1-5)**.
- **Seguridad Bancaria/Médica**: Autenticación JWT Bearer, contraseñas hasheadas con \`bcryptjs\` y validación de esquemas en runtime con \`Zod\`.
- **Manejo de Errores RFC 7807** (*Problem Details for HTTP APIs*).
    `,
    contact: {
      name: "Mauro Diaz",
      url: "https://github.com/mauro8778",
      email: "maurodiaz8778@gmail.com",
    },
  },
  servers: [
    {
      url: `http://localhost:${PORT}`,
      description: "Servidor de Desarrollo Local",
    },
    {
      url: "https://api.turnoclinica.com",
      description: "Servidor de Producción (Alta Disponibilidad)",
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Introduce el token JWT obtenido en **/auth/login** o **/auth/register** con formato: \`Bearer <token>\`",
      },
    },
    schemas: {
      ErrorProblemDetails: {
        type: "object",
        properties: {
          type: { type: "string", example: "https://turnoclinica.com/errors/400" },
          title: { type: "string", example: "Error de Validación de Datos" },
          status: { type: "integer", example: 400 },
          detail: { type: "string", example: "Los datos enviados no cumplen con el formato requerido" },
          errors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                field: { type: "string", example: "email" },
                message: { type: "string", example: "Email inválido" },
              },
            },
          },
          timestamp: { type: "string", format: "date-time" },
          path: { type: "string", example: "/auth/register" },
        },
      },
      UserResponse: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Juan Pérez" },
          email: { type: "string", example: "juan.perez@example.com" },
          role: { type: "string", example: "patient", enum: ["patient", "doctor", "admin"] },
          nDni: { type: "string", example: "38945123" },
          phone: { type: "string", example: "+54 11 4455-6677" },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          user: { $ref: "#/components/schemas/UserResponse" },
          tokens: {
            type: "object",
            properties: {
              accessToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
              refreshToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
              expiresIn: { type: "string", example: "1h" },
            },
          },
        },
      },
      RegisterRequest: {
        type: "object",
        required: ["name", "email", "birthdate", "nDni", "username", "password"],
        properties: {
          name: { type: "string", example: "Juan Pérez" },
          email: { type: "string", format: "email", example: "juan.perez@example.com" },
          birthdate: { type: "string", format: "date", example: "1992-08-24" },
          nDni: { type: "string", example: "38945123" },
          username: { type: "string", example: "juanperez92" },
          password: { type: "string", format: "password", example: "PasswordSeguro123!" },
          phone: { type: "string", example: "+54 11 4455-6677" },
          role: { type: "string", enum: ["patient", "doctor", "admin"], default: "patient" },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["username", "password"],
        properties: {
          username: { type: "string", example: "juanperez92" },
          password: { type: "string", format: "password", example: "PasswordSeguro123!" },
        },
      },
      AppointmentRequest: {
        type: "object",
        required: ["date", "time", "description"],
        properties: {
          date: { type: "string", format: "date", example: "2026-11-20" },
          time: { type: "string", example: "10:30", description: "Formato militar HH:MM (24 hs)" },
          description: { type: "string", example: "Control cardiológico anual por antecedentes familiares" },
          doctorId: { type: "integer", example: 2, description: "ID del profesional médico (opcional)" },
          userId: { type: "integer", example: 1, description: "ID del paciente (por defecto toma el del token JWT)" },
        },
      },
      AppointmentResponse: {
        type: "object",
        properties: {
          id: { type: "integer", example: 42 },
          date: { type: "string", example: "2026-11-20" },
          time: { type: "string", example: "10:30" },
          description: { type: "string", example: "Control cardiológico anual" },
          status: { type: "string", example: "confirmed", enum: ["pending", "confirmed", "cancelled", "completed"] },
          createdAt: { type: "string", format: "date-time" },
          user: { $ref: "#/components/schemas/UserResponse" },
        },
      },
      TriageRequest: {
        type: "object",
        required: ["symptoms"],
        properties: {
          symptoms: {
            type: "string",
            example: "Dolor punzante e inflamación aguda en tobillo derecho tras sufrir una torcedura jugando al fútbol, no puedo apoyar el pie",
            description: "Descripción detallada del cuadro clínico (mínimo 10 caracteres)",
          },
          duration: { type: "string", example: "3 horas" },
          patientAge: { type: "integer", example: 29 },
          medicalHistory: {
            type: "array",
            items: { type: "string" },
            example: ["Esguince previo", "Sin alergias"],
          },
          autoSchedule: {
            type: "boolean",
            example: true,
            description: "Si es true y el caso no es de emergencia vital, agenda automáticamente un turno con el especialista recomendado",
          },
          preferredDate: { type: "string", format: "date", example: "2026-11-10" },
        },
      },
      TriageResponse: {
        type: "object",
        properties: {
          status: { type: "string", example: "success" },
          data: {
            type: "object",
            properties: {
              assessment: {
                type: "object",
                properties: {
                  id: { type: "integer", example: 10 },
                  urgencyLevel: { type: "integer", example: 3, description: "1 = Resucitación/Crítico, 5 = No Urgente (Escala ESI)" },
                  category: { type: "string", example: "urgent", enum: ["resuscitation", "emergent", "urgent", "semi-urgent", "non-urgent"] },
                  recommendedSpecialty: { type: "string", example: "Traumatología" },
                  rationale: { type: "string", example: "Traumatismo articular agudo con impotencia funcional que requiere evaluación y radiografía." },
                  redFlags: {
                    type: "array",
                    items: { type: "string" },
                    example: ["Imposibilidad de apoyo", "Deformidad articular evidente"],
                  },
                  immediateActions: {
                    type: "array",
                    items: { type: "string" },
                    example: ["Reposo estricto", "Aplicación de hielo local por 15 minutos", "Elevación de la extremidad"],
                  },
                },
              },
              isEmergency: { type: "boolean", example: false },
              scheduledAppointment: { $ref: "#/components/schemas/AppointmentResponse" },
            },
          },
        },
      },
    },
  },
  tags: [
    { name: "Salud del Sistema", description: "Métricas y comprobación de estado de servicios (DB y Redis)" },
    { name: "Autenticación", description: "Registro, login con bcrypt y gestión de tokens JWT" },
    { name: "Turnos Médicos (Appointments)", description: "Agendamiento con bloqueo distribuido anti-doble reserva y cancelación" },
    { name: "Triaje Inteligente con IA", description: "Evaluación clínica ESI (Niveles 1-5) impulsada por Gemini AI" },
    { name: "Usuarios", description: "Consultas de perfiles de pacientes e historial" },
  ],
  paths: {
    "/health": {
      get: {
        tags: ["Salud del Sistema"],
        summary: "Healthcheck de infraestructura",
        description: "Verifica en tiempo real el estado de conectividad con PostgreSQL y Redis para balanceadores de carga (Nginx, AWS ALB, K8s).",
        responses: {
          200: {
            description: "Servicios operando correctamente",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "OK" },
                    timestamp: { type: "string", format: "date-time" },
                    uptime: { type: "number", example: 342.12 },
                    services: {
                      type: "object",
                      properties: {
                        database: { type: "string", example: "healthy" },
                        redis: { type: "string", example: "healthy" },
                      },
                    },
                  },
                },
              },
            },
          },
          503: {
            description: "Uno o más servicios críticos no están disponibles",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorProblemDetails" },
              },
            },
          },
        },
      },
    },

    "/auth/register": {
      post: {
        tags: ["Autenticación"],
        summary: "Registro de nuevo paciente",
        description: "Registra al paciente, hashea la contraseña con \`bcrypt\` (12 rondas), emite tokens JWT y encola asíncronamente un correo de bienvenida con BullMQ.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Usuario registrado exitosamente",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          400: {
            description: "Error de validación en los campos enviados",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorProblemDetails" },
              },
            },
          },
          409: {
            description: "Conflicto: El email, DNI o username ya están en uso",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorProblemDetails" },
              },
            },
          },
        },
      },
    },

    "/auth/login": {
      post: {
        tags: ["Autenticación"],
        summary: "Inicio de sesión",
        description: "Valida las credenciales contra la contraseña hasheada y retorna un Access Token (1h) y un Refresh Token (7d).",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Autenticación exitosa",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          401: {
            description: "Credenciales inválidas o contraseña incorrecta",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorProblemDetails" },
              },
            },
          },
        },
      },
    },

    "/auth/me": {
      get: {
        tags: ["Autenticación"],
        summary: "Obtener perfil del usuario en sesión",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Datos del perfil autenticado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserResponse" },
              },
            },
          },
          401: {
            description: "Token no provisto, inválido o expirado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorProblemDetails" },
              },
            },
          },
        },
      },
    },

    "/appointments/agendar": {
      post: {
        tags: ["Turnos Médicos (Appointments)"],
        summary: "Reserva atómica de turno (Anti-Race Conditions)",
        description: `
Adquiere un **Bloqueo Distribuido en Redis (Mutex)** para el slot solicitado \`[doctorId:date:time]\`.
Si otro usuario intenta reservar el mismo horario concurrentemente, la petición colisionada se rechaza con **HTTP 409 Conflict** en $<10\\text{ ms}$.
Tras persistir en PostgreSQL, encola de forma asíncrona un correo de confirmación mediante **BullMQ**.
        `,
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AppointmentRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Turno médico agendado y confirmado exitosamente",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AppointmentResponse" },
              },
            },
          },
          400: {
            description: "Formato de fecha u hora inválido",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorProblemDetails" },
              },
            },
          },
          409: {
            description: "El horario ya está ocupado o en proceso de reserva simultáneo",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorProblemDetails" },
              },
            },
          },
        },
      },
    },

    "/appointments": {
      get: {
        tags: ["Turnos Médicos (Appointments)"],
        summary: "Listar turnos con paginación y filtros",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 }, description: "Número de página" },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 }, description: "Resultados por página (máx. 100)" },
          { name: "date", in: "query", schema: { type: "string", format: "date" }, description: "Filtrar por fecha específica (YYYY-MM-DD)" },
          { name: "status", in: "query", schema: { type: "string", enum: ["confirmed", "cancelled", "completed", "pending"] }, description: "Filtrar por estado" },
          { name: "doctorId", in: "query", schema: { type: "integer" }, description: "Filtrar por ID de médico" },
        ],
        responses: {
          200: {
            description: "Listado paginado de turnos médicos",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/AppointmentResponse" },
                    },
                    total: { type: "integer", example: 150 },
                    page: { type: "integer", example: 1 },
                    limit: { type: "integer", example: 20 },
                    totalPages: { type: "integer", example: 8 },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/appointments/{id}": {
      get: {
        tags: ["Turnos Médicos (Appointments)"],
        summary: "Obtener detalle de un turno médico",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" }, description: "ID del turno" },
        ],
        responses: {
          200: {
            description: "Información detallada del turno",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AppointmentResponse" },
              },
            },
          },
          404: {
            description: "Turno no encontrado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorProblemDetails" },
              },
            },
          },
        },
      },
    },

    "/appointments/cancelar/{id}": {
      put: {
        tags: ["Turnos Médicos (Appointments)"],
        summary: "Cancelar un turno médico",
        description: "Actualiza el estado a \`cancelled\`, invalida la caché en Redis y despacha un correo de cancelación vía BullMQ.",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" }, description: "ID del turno a cancelar" },
        ],
        responses: {
          200: {
            description: "Turno cancelado exitosamente",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Turno cancelado exitosamente" },
                    appointment: { $ref: "#/components/schemas/AppointmentResponse" },
                  },
                },
              },
            },
          },
          404: {
            description: "Turno no encontrado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorProblemDetails" },
              },
            },
          },
        },
      },
    },

    "/triage/assess": {
      post: {
        tags: ["Triaje Inteligente con IA"],
        summary: "Evaluación clínica de síntomas (Estándar ESI 1-5)",
        description: `
Analiza los síntomas mediante el modelo **Google Gemini** bajo el protocolo **ESI**:
- **Niveles 1 y 2 (Emergencia):** Genera alerta crítica inmediata para derivación a Guardia de emergencias.
- **Niveles 3 a 5 (Urgente / No Urgente):** Identifica signos de alarma (*red flags*), sugiere cuidados inmediatos y recomienda el especialista adecuado.
- Si \`autoSchedule: true\`, busca automáticamente el próximo médico libre de dicha especialidad y crea el turno.
        `,
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TriageRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Evaluación médica completada",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TriageResponse" },
              },
            },
          },
          400: {
            description: "Descripción de síntomas insuficiente (mínimo 10 caracteres)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorProblemDetails" },
              },
            },
          },
          429: {
            description: "Límite de solicitudes de triaje alcanzado (Rate Limit)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorProblemDetails" },
              },
            },
          },
        },
      },
    },

    "/triage/history": {
      get: {
        tags: ["Triaje Inteligente con IA"],
        summary: "Historial de triajes del paciente",
        description: "Devuelve el historial clínico de todas las evaluaciones de triaje realizadas por el usuario autenticado.",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Historial de evaluaciones de triaje",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    total: { type: "integer", example: 3 },
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "integer", example: 5 },
                          symptoms: { type: "string", example: "Fiebre persistente de 38.5 y dolor de garganta" },
                          urgencyLevel: { type: "integer", example: 4 },
                          category: { type: "string", example: "semi-urgent" },
                          recommendedSpecialty: { type: "string", example: "Clínica Médica" },
                          createdAt: { type: "string", format: "date-time" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/users": {
      get: {
        tags: ["Usuarios"],
        summary: "Listar pacientes (Paginado)",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
        ],
        responses: {
          200: {
            description: "Listado de pacientes con turnos asociados",
          },
        },
      },
    },

    "/users/{id}": {
      get: {
        tags: ["Usuarios"],
        summary: "Obtener perfil completo de usuario por ID",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: {
          200: {
            description: "Datos del usuario",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserResponse" },
              },
            },
          },
          404: {
            description: "Usuario no encontrado",
          },
        },
      },
    },
  },
};
