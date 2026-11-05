# TurnoClínica API 🏥📅

API RESTful desarrollada con **TypeScript**, **Node.js**, **Express** y **TypeORM** con **PostgreSQL**, diseñada para la gestión de usuarios, profesionales y reserva de turnos médicos en línea.

---

## 🛠️ Tecnologías Utilizadas

- **Lenguaje:** TypeScript
- **Entorno:** Node.js
- **Framework Web:** Express.js
- **ORM:** TypeORM
- **Base de Datos:** PostgreSQL
- **Arquitectura:** Capas modulares (Rutas, Controladores, Servicios, Entidades y DTOs)

---

## ✨ Funcionalidades Principales

- **Gestión y Registro de Usuarios:**
  - Registro de pacientes con validaciones y credenciales seguras.
  - Autenticación y verificación de credenciales de acceso.
  - Consulta de perfil de usuario y listado de sus turnos históricos y activos.

- **Sistema Integral de Turnos (Appointments):**
  - Reserva y agendamiento de turnos especificando fecha, hora y paciente.
  - Consulta de turnos con filtrado por identificador y estado (`active` / `cancelled`).
  - Cancelación de turnos médicos programados.

- **Arquitectura y Modelado de Datos:**
  - Relación 1:1 entre Usuarios y Credenciales.
  - Relación 1:N entre Usuarios y Turnos Médicos.
  - Manejo centralizado de errores y respuestas HTTP consistentes.

---

## 📋 Requisitos Previos

- [Node.js](https://nodejs.org/) (versión 18 o superior)
- [PostgreSQL](https://www.postgresql.org/) (versión 14 o superior)
- Gestor de paquetes `npm`

---

## 🚀 Instalación y Puesta en Marcha

### 1. Clonar el repositorio
```bash
git clone [https://github.com/mauro8778/TurnoClinica-Back.git](https://github.com/mauro8778/TurnoClinica-Back.git)
cd TurnoClinica-Back
