import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Métricas personalizadas
const errorRate = new Rate('errors');
const loginSuccessRate = new Rate('login_success');
const ticketCreationRate = new Rate('ticket_creation_success');

const API_URL = 'https://stsweb-backend-964379250608.europe-west1.run.app';

// Configuración de las pruebas
export const options = {
  stages: [
    { duration: '1m', target: 10 },   // Warm up: 0 → 10 usuarios en 1 min
    { duration: '3m', target: 50 },   // Ramp up: 10 → 50 usuarios en 3 min
    { duration: '5m', target: 50 },   // Stay: 50 usuarios por 5 min
    { duration: '2m', target: 100 },  // Spike: 50 → 100 usuarios en 2 min
    { duration: '5m', target: 100 },  // Peak: 100 usuarios por 5 min
    { duration: '2m', target: 0 },    // Ramp down: 100 → 0 en 2 min
  ],
  thresholds: {
    'http_req_duration': ['p(95)<2000'], // 95% de requests < 2s
    'http_req_failed': ['rate<0.05'],     // <5% de fallos
    'errors': ['rate<0.1'],                // <10% de errores generales
  },
};

// Usuarios de prueba
const TEST_USERS = [
  { email: 'test1@swarco.com', password: 'Test1234!' },
  { email: 'test2@swarco.com', password: 'Test1234!' },
  { email: 'test3@swarco.com', password: 'Test1234!' },
];

function getRandomUser() {
  return TEST_USERS[Math.floor(Math.random() * TEST_USERS.length)];
}

// Función principal de test
export default function () {
  const user = getRandomUser();
  let token = null;

  // ============================================
  // TEST 1: Login
  // ============================================
  {
    const loginPayload = JSON.stringify({
      email: user.email,
      password: user.password,
    });

    const loginRes = http.post(`${API_URL}/api/auth/login`, loginPayload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: '10s',
    });

    const loginSuccess = check(loginRes, {
      'login status 200': (r) => r.status === 200,
      'login tiene token': (r) => {
        try {
          return JSON.parse(r.body).token !== undefined;
        } catch {
          return false;
        }
      },
      'login < 2s': (r) => r.timings.duration < 2000,
    });

    loginSuccessRate.add(loginSuccess);
    errorRate.add(!loginSuccess);

    if (loginSuccess) {
      token = JSON.parse(loginRes.body).token;
    } else {
      console.error(`Login falló: ${loginRes.status} - ${loginRes.body}`);
      return; // Si falla login, no continuar
    }
  }

  sleep(1);

  // ============================================
  // TEST 2: Get Dashboard (Listar Tickets)
  // ============================================
  {
    const dashboardRes = http.get(`${API_URL}/api/failures`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: '15s',
    });

    check(dashboardRes, {
      'dashboard status 200': (r) => r.status === 200,
      'dashboard es array': (r) => {
        try {
          return Array.isArray(JSON.parse(r.body));
        } catch {
          return false;
        }
      },
      'dashboard < 3s': (r) => r.timings.duration < 3000,
    });

    errorRate.add(dashboardRes.status !== 200);
  }

  sleep(2);

  // ============================================
  // TEST 3: Crear Ticket
  // ============================================
  {
    const ticketPayload = JSON.stringify({
      titulo: `Test Ticket ${Date.now()}`,
      descripcion: 'Test automatizado de carga',
      prioridad: 'Media',
      company: 'SWARCO',
      refCode: `TEST-${Math.random().toString(36).substr(2, 9)}`,
      serial: `SN-${Math.random().toString(36).substr(2, 9)}`,
      locationType: 'calle',
      locationVia: 'Test Street',
      locationSentido: 'Norte',
      locationPk: '10',
      locationProvince: 'Madrid',
      locationStation: 'Test Station',
    });

    const createRes = http.post(`${API_URL}/api/failures`, ticketPayload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: '20s',
    });

    const createSuccess = check(createRes, {
      'crear ticket status 201': (r) => r.status === 201 || r.status === 200,
      'crear ticket tiene ID': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.id !== undefined || body.requestNumber !== undefined;
        } catch {
          return false;
        }
      },
      'crear ticket < 5s': (r) => r.timings.duration < 5000,
    });

    ticketCreationRate.add(createSuccess);
    errorRate.add(!createSuccess);
  }

  sleep(2);

  // ============================================
  // TEST 4: Chatbot
  // ============================================
  {
    const chatPayload = JSON.stringify({
      message: '¿Cómo creo un ticket?',
      lang: 'es',
    });

    const chatRes = http.post(`${API_URL}/api/chatbot/ask`, chatPayload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: '5s',
    });

    check(chatRes, {
      'chatbot status 200': (r) => r.status === 200,
      'chatbot responde': (r) => {
        try {
          return JSON.parse(r.body).response !== undefined;
        } catch {
          return false;
        }
      },
      'chatbot < 1s': (r) => r.timings.duration < 1000,
    });

    errorRate.add(chatRes.status !== 200);
  }

  sleep(1);

  // ============================================
  // TEST 5: Analytics (SAT users only)
  // ============================================
  {
    const analyticsRes = http.get(`${API_URL}/api/analytics/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: '10s',
    });

    // Analytics puede fallar si no es SAT user, solo verificamos que responda
    check(analyticsRes, {
      'analytics responde': (r) => r.status === 200 || r.status === 403,
      'analytics < 5s': (r) => r.timings.duration < 5000,
    });
  }

  sleep(3);
}

// Test de teardown (se ejecuta al final)
export function teardown(data) {
  console.log('========================================');
  console.log('   RESUMEN DE PRUEBAS DE ESTRÉS');
  console.log('========================================');
}
