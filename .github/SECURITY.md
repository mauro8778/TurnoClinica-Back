# 🛡️ Política de Seguridad & Cyber-Defense

## Versiones Soportadas

| Versión | Soportada | Estado de Parches de Seguridad |
| :--- | :--- | :--- |
| **2.0.x (Actual)** | :white_check_mark: | Actualizaciones activas y parches continuos |
| < 2.0.0 | :x: | Obsoleta (Migrar a la versión 2.0.0) |

---

## 🔒 Arquitectura de Seguridad Implementada

Este repositorio implementa defensas multicapa alineadas con el estándar **OWASP Top 10** y las guías de seguridad hospitalaria:

### 1. Protección contra Inyecciones (SQLi, NoSQLi, Command Injection)
- Uso estricto de **TypeORM Data Mapper** con consultas parametrizadas. Ninguna entrada del usuario se concatena directamente en sentencias SQL.
- Middleware **HPP (HTTP Parameter Pollution)** para prevenir manipulación maliciosa de parámetros en query strings.

### 2. Autenticación y Autorización
- Contraseñas protegidas mediante algoritmos de derivación de claves con **Bcrypt** ($12$ rondas de costo).
- Tokens **JWT (JSON Web Tokens)** firmados criptográficamente con tiempo de expiración corto ($1\text{ hora}$) y revocación en lista negra respaldada en **Redis**.
- El campo `password` está excluido de todas las consultas (`select: false`) para evitar su fuga en respuestas JSON o logs.

### 3. Mitigación de Denegación de Servicio (DoS / DDoS)
- **Rate Limiting Distribuido:** Control de tasa de peticiones con ventana deslizante en **Redis** (`express-rate-limit` + `rate-limit-redis`).
- Límites estrictos en el tamaño de payloads JSON entrantes ($1\text{ MB}$).
- Bloqueos distribuidos atómicos con TTL para evitar el agotamiento de recursos ante reservas concurrentes masivas.

### 4. Cabeceras de Seguridad HTTP (Defense-in-Depth)
- Configuración con **Helmet**:
  - `X-Content-Type-Options: nosniff` (previene MIME sniffing).
  - `X-Frame-Options: SAMEORIGIN` (previene Clickjacking).
  - `Strict-Transport-Security (HSTS)` (fuerza HTTPS).
  - `X-XSS-Protection` habilitado.

### 5. Escaneo Continuo en CI/CD (DevSecOps)
- **Dependabot:** Monitoreo semanal automatizado de dependencias y vulnerabilidades en npm y Docker.
- **CodeQL (SAST):** Análisis estático de código en cada Pull Request para detectar vulnerabilidades en tiempo de desarrollo.
- **Gitleaks:** Escaneo automatizado de credenciales, claves privadas y tokens para prevenir fugas accidentales.

---

## 🚨 Reporte Responsable de Vulnerabilidades

Si descubres una vulnerabilidad de seguridad en este proyecto:
1. **NO abras un Issue público** para evitar la divulgación prematura.
2. Envía un correo con los detalles técnicos a: **maurodiaz8778@gmail.com**
3. Incluye:
   - Descripción de la vulnerabilidad.
   - Pasos para reproducirla (Proof of Concept).
   - Impacto potencial.
