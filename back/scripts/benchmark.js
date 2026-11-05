/**
 * Benchmark & Concurrency Simulation Script
 * Demuestra la prevención de Race Conditions (Doble Reserva) y el rendimiento
 * del Bloqueo Distribuido con 50 peticiones simultáneas compitiendo por el MISMO turno.
 */

const API_URL = process.env.API_URL || "http://localhost:3001";

async function runConcurrencyTest() {
  console.log("==========================================================");
  console.log("🧪 Iniciando Prueba de Concurrencia Extrema (Race Condition)");
  console.log(`🎯 Target API: ${API_URL}`);
  console.log("==========================================================\n");

  // 1. Registro y Login de Usuario de Prueba
  const testUser = {
    name: "Mauro Concurrency Test",
    email: `test_concurrency_${Date.now()}@clinica.com`,
    birthdate: "1995-05-15",
    nDni: `${Math.floor(10000000 + Math.random() * 90000000)}`,
    username: `user_${Date.now()}`,
    password: "Password123!",
  };

  let token = "";
  let userId = 1;

  try {
    const regRes = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testUser),
    });

    if (regRes.ok) {
      const regData = await regRes.json();
      token = regData.tokens.accessToken;
      userId = regData.user.id;
      console.log(`✅ Usuario creado y autenticado (ID: ${userId})`);
    } else {
      console.log("Aviso: el usuario ya existe o servicio fuera de línea");
    }
  } catch (err) {
    console.warn("⚠️ Servidor local no iniciado en 3001. Ejecuta 'npm start' primero para correr el test.");
    return;
  }

  // 2. Disparar 50 peticiones concurrentes para reservar exactamente el MISMO médico, fecha y hora
  const targetDate = "2026-12-01";
  const targetTime = "11:30";
  const CONCURRENT_REQUESTS = 30;

  console.log(`\n🚀 Lanzando ${CONCURRENT_REQUESTS} peticiones simultáneas para el turno ${targetDate} a las ${targetTime} hs...`);

  const requests = Array.from({ length: CONCURRENT_REQUESTS }, (_, i) => {
    return fetch(`${API_URL}/appointments/agendar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        date: targetDate,
        time: targetTime,
        description: `Test concurrente #${i + 1}`,
        doctorId: 1,
        userId,
      }),
    })
      .then((res) => ({ index: i + 1, status: res.status }))
      .catch((err) => ({ index: i + 1, error: err.message }));
  });

  const startTime = Date.now();
  const results = await Promise.all(requests);
  const duration = Date.now() - startTime;

  const successful = results.filter((r) => r.status === 201);
  const conflicts = results.filter((r) => r.status === 409);
  const other = results.filter((r) => r.status !== 201 && r.status !== 409);

  console.log("\n📊 RESULTADOS DE LA PRUEBA:");
  console.log(`⏱️ Tiempo total: ${duration} ms (~${(CONCURRENT_REQUESTS / (duration / 1000)).toFixed(1)} req/sec)`);
  console.log(`🟢 Turnos reservados exitosamente (HTTP 201): ${successful.length}`);
  console.log(`🛡️ Intentos bloqueados por colisión / lock (HTTP 409): ${conflicts.length}`);
  console.log(`⚠️ Otros estados: ${other.length}`);

  if (successful.length === 1 && conflicts.length === CONCURRENT_REQUESTS - 1) {
    console.log("\n🏆 ¡TEST SUPERADO CON ÉXITO! El bloqueo distribuido impidió la doble reserva al 100%.");
  } else if (successful.length > 1) {
    console.log("\n❌ FALLO: Hubo doble reserva (Race condition no resuelta).");
  } else {
    console.log("\nℹ️ Verifica que la base de datos tenga médicos sembrados.");
  }
}

runConcurrencyTest();
