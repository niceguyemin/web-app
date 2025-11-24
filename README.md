# Danışan Takip Sistemi

Danışan takip ve ön muhasebe uygulaması. [Next.js](https://nextjs.org) 16 ile geliştirilmiştir.

## Teknoloji Stack

- **Framework**: Next.js 16.0.3 (Turbopack)
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Authentication**: NextAuth v5 (Beta)
- **UI Components**: Radix UI
- **Styling**: Tailwind CSS

## Başlangıç

### Gereksinimler
- Node.js 20+
- PostgreSQL veritabanı

### Kurulum

1. Repo'yu klonla:
```bash
git clone https://github.com/niceguyemin/web-app.git
cd web-app
```

2. Bağımlılıkları yükle:
```bash
npm install
```

3. Environment değişkenlerini ayarla:
```bash
cp .env.example .env.local
# .env.local dosyasını düzenle ve gerçek değerleri ekle
```

4. Veritabanını setup et:
```bash
npx prisma migrate dev
npm run seed  # Admin kullanıcı ve örnek veriler
```

5. Development sunucusunu başlat:
```bash
npm run dev
```

Tarayıcıda [http://localhost:3000](http://localhost:3000) açarak erişebilirsin.

## Vercel'de Deployment

### 1. Vercel'e bağlan

```bash
npm i -g vercel
vercel login
```

### 2. Projeni Vercel'e bağla

```bash
vercel link
```

### 3. Environment Variables ayarla

Vercel Dashboard'da (Settings > Environment Variables):

```
DATABASE_URL=postgresql://...
AUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret
```

### 4. Deploy et

```bash
vercel deploy --prod
```

veya GitHub'a push et - Vercel otomatik deploy edecek.

### 5. ⚠️ İLK DEPLOYMENT SONRASI - Database Seed

Vercel'e ilk deploy ettikten sonra, terminal'de şu komutu çalıştır:

```bash
vercel env pull  # Ortam değişkenlerini .env.local'a indir
npm run seed     # Admin user ve default data'yı oluştur
```

**VEYA** Vercel Functions kullanarak otomatikleştir:

```bash
# Terminal'den (Vercel CLI ile)
npx prisma db seed --preview
```

## Veritabanı Migrasyonu

### Local'de

```bash
# Yeni migration oluştur
npx prisma migrate dev --name add_new_feature

# Mevcut migrasyonları apply et
npx prisma migrate deploy

# Database seed'le (admin user oluştur)
npm run seed
```

### Production (Vercel)

Migrations otomatik apply olur deployment sırasında. Seed'i elle çalıştırmalısın (yukardaki adımlara bak).

## Kullanıcı Giriş

Varsayılan admin kullanıcısı:
- **Kullanıcı Adı**: admin
- **Şifre**: admin123

> ⚠️ Production'da şifreyi değiştir!

## API Endpoints

- `POST /api/login` - Kullanıcı giriş
- `GET /api/auth/session` - Mevcut session bilgisi
- `POST /api/auth/signout` - Çıkış

## Dosya Yapısı

```
web-app/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── login/             # Login page
│   ├── clients/           # Danışanlar sayfası
│   ├── accounting/        # Muhasebe sayfası
│   └── page.tsx           # Dashboard
├── components/            # Reusable React components
├── lib/                   # Utilities ve helpers
│   ├── auth.ts           # NextAuth setup
│   └── prismadb.ts       # Prisma client
├── prisma/               # Database schema
└── public/               # Static files
```

## Development

```bash
# Development server (Turbopack ile hızlı reload)
npm run dev

# Build production
npm run build

# Production'da çalıştır
npm start

# Linter çalıştır
npm run lint

# Veritabanında değişiklikleri görmek için
npx prisma studio
```

## Troubleshooting

### CSRF Token Error
Eğer login yapılırken CSRF hatası alırsan:
- `.env` dosyasında `AUTH_SECRET` ve `NEXTAUTH_SECRET` doğru mı kontrol et
- Tarayıcı cookies'ini sil ve tekrar dene

### Database Connection Error
- `DATABASE_URL` doğru mu kontrol et
- Neon dashboard'da veritabanı active mi kontrol et
- SSL sertifikası var mı: `?sslmode=require` eklenmiş mi

## Lisans

MIT

## İletişim

Proje detayları için GitHub repository'yi ziyaret et:
https://github.com/niceguyemin/web-app
