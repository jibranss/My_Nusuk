import { Elysia, t } from 'elysia';

// Tipe Data User / Jamaah
interface User {
  id: string;
  fullName: string;
  email: string;
  password: string; // Dalam produksi, gunakan hashing (argon2/bcrypt)
  passportNumber: string;
  nationality: string;
}

// Tipe Data Izin Ziarah
interface Permit {
  id: string;
  userId: string;
  title: string;
  scheduleDate: string;
  timeSlot: string;
  status: 'ACTIVE' | 'USED' | 'CANCELED';
  qrToken: string;
}

// Data Store In-Memory
const users: User[] = [
  {
    id: 'USR-888',
    fullName: 'Muhammad Raja Jibran',
    email: 'jibran@example.com',
    password: 'password123',
    passportNumber: 'A12345678',
    nationality: 'Indonesia'
  }
];

const permits: Permit[] = [
  {
    id: 'PRM-001',
    userId: 'USR-888',
    title: 'Izin Masuk Raudhah (Pria)',
    scheduleDate: '2026-11-10',
    timeSlot: '14:00 - 14:30 WIB',
    status: 'ACTIVE',
    qrToken: 'NUSUK-VERIFY-PRM-001-SECURE'
  }
];

export const app = new Elysia()
  .get('/', () => Bun.file('public/index.html'))

  .group('/api/v1', (app) =>
    app
      // --- 1. ENDPOINT AUTHENTICATION ---
      // POST /api/v1/auth/register
      .post(
        '/auth/register',
        ({ body, set }) => {
          const { fullName, email, password, passportNumber, nationality } = body;

          const existingUser = users.find((u) => u.email === email);
          if (existingUser) {
            set.status = 400;
            return { success: false, message: 'Email sudah terdaftar!' };
          }

          const newUser: User = {
            id: `USR-${Date.now().toString().slice(-4)}`,
            fullName,
            email,
            password,
            passportNumber,
            nationality: nationality || 'Indonesia'
          };

          users.push(newUser);
          set.status = 201;

          return {
            success: true,
            message: 'Registrasi berhasil! Silakan login.',
            data: { id: newUser.id, fullName: newUser.fullName, email: newUser.email }
          };
        },
        {
          body: t.Object({
            fullName: t.String(),
            email: t.String(),
            password: t.String(),
            passportNumber: t.String(),
            nationality: t.Optional(t.String())
          })
        }
      )

      // POST /api/v1/auth/login
      .post(
        '/auth/login',
        ({ body, set }) => {
          const { email, password } = body;
          const user = users.find((u) => u.email === email && u.password === password);

          if (!user) {
            set.status = 401;
            return { success: false, message: 'Email atau password salah!' };
          }

          return {
            success: true,
            message: 'Login berhasil!',
            data: {
              id: user.id,
              fullName: user.fullName,
              email: user.email,
              passportNumber: user.passportNumber,
              nationality: user.nationality
            }
          };
        },
        {
          body: t.Object({
            email: t.String(),
            password: t.String()
          })
        }
      )

      // --- 2. ENDPOINT PERMITS ---
      .get('/permits', ({ query }) => {
        const userId = query.userId;
        const filteredPermits = userId ? permits.filter((p) => p.userId === userId) : permits;

        return {
          success: true,
          message: 'Daftar izin ziarah berhasil diambil',
          data: filteredPermits
        };
      })

      .post(
        '/permits',
        ({ body, set }) => {
          const { userId, title, scheduleDate, timeSlot } = body;

          const newPermit: Permit = {
            id: `PRM-00${permits.length + 1}`,
            userId,
            title,
            scheduleDate,
            timeSlot,
            status: 'ACTIVE',
            qrToken: `NUSUK-VERIFY-PRM-00${permits.length + 1}-${Date.now()}`
          };

          permits.push(newPermit);
          set.status = 201;

          return {
            success: true,
            message: 'Izin ziarah berhasil diterbitkan!',
            data: newPermit
          };
        },
        {
          body: t.Object({
            userId: t.String(),
            title: t.String(),
            scheduleDate: t.String(),
            timeSlot: t.String()
          })
        }
      )
  )

  .listen(3000);

console.log('🚀 Server Nusuk API Engine berjalan di http://localhost:3000');