import { Elysia, t } from 'elysia';

interface Permit {
  id: string;
  userId: string;
  title: string;
  scheduleDate: string;
  timeSlot: string;
  status: 'ACTIVE' | 'USED' | 'CANCELED';
  qrToken: string;
}

// Database In-Memory Izin Ziarah
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
  // Melayani tampilan frontend dari public/index.html
  .get('/', () => Bun.file('public/index.html'))

  // API Endpoints Nusuk
  .group('/api/v1/permits', (app) =>
    app
      .get('', () => ({
        success: true,
        message: 'Daftar izin ziarah berhasil diambil',
        data: permits
      }))
      .post(
        '',
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