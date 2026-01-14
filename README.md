# Hotel Booking System 

**[21070006001] [Ahmet Kemal Biliciler]**

Mikroservis mimarisi ile geliştirilmiş, AWS entegrasyonlu otel rezervasyon sistemi.

## Project Links

| Link | URL |
|------|-----|
| Frontend (Customer) | https://hotel-frontend-xlry.onrender.com |
| Admin Panel | https://admin-lbn4.onrender.com |
| API Gateway | https://tvhn5liy45.execute-api.eu-north-1.amazonaws.com/prod |
| Hotel Service| http://51.21.220.93/|
| Notification Service | http://13.61.184.188|
| Video Presentation | https://drive.google.com/file/d/1HkxVoWYWebzEYR9Bg9S6I8lKi7eEzIuz/view?usp=sharing |

**Test Credentials:**
- Admin: `kemalbiliciler35@gmail.com` / `Test1234.`
- User: `kemalbiliciler35@gmail.com` / `Test1234.`

## Proje Hakkında

Bu sistem, kullanıcıların otel arayıp rezervasyon yapmasını sağlar. Admin panelinden otel yönetimi, oda tanımlama ve fiyatlandırma yapılır. ML modeli ile fiyat önerileri sunar, asenkron bildirim sistemi ile rezervasyon onayları gönderilir.

## Mimari Tasarım (Architecture)

```
hotel-project/
├── hotel-service/
│   └── src/
│       ├── index.js              # Ana Express server, ML model eğitimi
│       ├── controllers/
│       │   ├── admin.controller.js    # Hotel/room/availability yönetimi
│       │   └── public.controller.js   # Arama ve rezervasyon
│       ├── services/
│       │   ├── ml.service.js          # Fiyat tahmin modeli (LinearRegression)
│       │   ├── queue.service.js       # AWS SQS mesaj gönderimi
│       │   ├── admin.service.js       # DB CRUD işlemleri
│       │   └── public.service.js      # Arama (cache'li) ve rezervasyon
│       ├── middlewares/
│       │   ├── authMiddleware.js      # JWT doğrulama
│       │   └── requireAdmin.js        # RBAC kontrolü
│       └── db/
│           └── index.js               # PostgreSQL pool
├── notification-service/
│   └── src/
│       ├── index.js                   # Background worker server
│       └── services/
│           ├── sqsWorker.js           # SQS mesaj dinleyici
│           └── capacityCheck.js       # Cron job (00:00 UTC)
├── frontend/                          # React customer app
└── admin-client/                      # React admin panel
```

### Neden Bu Yapı?

**Mikroservis Ayrımı:**  
Hotel Service real-time istekleri handle ederken, Notification Service arka planda mesaj işler. Birbirinden bağımsız scale edilebilir ve hata izolasyonu sağlar.

**Service Pattern:**  
ML, Queue, Admin ve Public servisleri ayrı dosyalarda. Bir servis değiştiğinde diğerleri etkilenmez (örn: SQS yerine RabbitMQ geçişi).

**Caching Layer:**  
`node-cache` ile search sonuçları 10 dakika RAM'de tutulur. Aynı arama 300ms yerine 5ms'de yanıt verir (%90 performans artışı).


## Varsayımlar (Assumptions)

**Tek Oda Rezervasyonu:** Bir rezervasyon = bir oda. Müşteri birden fazla oda isterse birden fazla istek göndermeli.

**Email Service Fallback:** Notification service'de email gönderimi başarısız olursa hata fırlatılmaz, sadece console'a log yazılır. Rezervasyon yine de tamamlanır.

**Pagination Default:** Search endpoint'i pagination yapar ancak frontend şu an limit/offset parametrelerini kullanmıyor. Default 10 sonuç döner.

## Karşılaşılan Sorunlar (Issues Encountered)

### 1. ML Model Tutarsız Fiyat Tahminleri
**Problem:** İlk kullandığımız dataset'te model tutarlı fiyatlar öneremiyordu.

**Çözüm:** Daha iyi bir dataset'e geçtik ve veri önişleme adımları ekledik.

### 2. Cache Key Collision
**Problem:** hasDiscount parametresi cache key'e dahil değildi, giriş yapmış ve yapmamış kullanıcılar aynı fiyatları görüyordu.

**Çözüm:** Cache key'e hasDiscount parametresini ekledik: `${city}_${startDate}_${endDate}_${guests}_${hasDiscount}_${limit}_${offset}`

### 3. SQS Mesaj Polling Sürekli Çalışma
**Problem:** Notification service başlangıçta SQS_QUEUE_URL tanımlı olmasa bile polling fonksiyonu çağrılıyor ve sürekli hata logları basıyordu.

**Çözüm:** pollMessages fonksiyonuna QUEUE_URL kontrolü ekledik. Tanımlı değilse polling başlamıyor ve warning log basılıyor.


## Data Models (ER Diagram)

```mermaid
erDiagram
    HOTELS ||--o{ ROOMS : has
    ROOMS ||--o{ AVAILABILITY : defines
    ROOMS ||--o{ RESERVATIONS : receives
    
    HOTELS {
        int id PK
        varchar name
        varchar city
        float latitude
        float longitude
    }
    
    ROOMS {
        int id PK
        int hotel_id FK
        varchar type
        int capacity
    }
    
    AVAILABILITY {
        int id PK
        int room_id FK
        date start_date
        date end_date
        int available_count
        decimal price
    }
    
    RESERVATIONS {
        int id PK
        int room_id FK
        varchar user_id
        date start_date
        date end_date
    }
```

## Teknoloji Stack

**Backend:** Node.js, Express.js, PostgreSQL (Neon), AWS SDK (Cognito, SQS), ml-regression, node-cache, node-cron  
**Frontend:** React 19, Vite, TailwindCSS, React Router, react-oidc-context, Leaflet  
**Cloud:** AWS (API Gateway, Cognito, SQS), Docker

## Kurulum

```bash
# Install dependencies
cd hotel-service && npm install
cd ../notification-service && npm install
cd ../frontend && npm install
cd ../admin-client && npm install


# Run services
cd hotel-service && npm run dev       # Port 3000
cd notification-service && npm start  # Port 3001
cd frontend && npm run dev            # Port 5173
cd admin-client && npm run dev        # Port 5174
```

### Environment Variables

**hotel-service/.env:**
```env
PORT=3000
DATABASE_URL=postgresql://user:pass@host/db
AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
SQS_QUEUE_URL=https://sqs.eu-north-1.amazonaws.com/.../queue
COGNITO_USER_POOL_ID=eu-north-1_xxx
COGNITO_CLIENT_ID=xxx
```

**notification-service/.env:**
```env
PORT=3001
DATABASE_URL=postgresql://user:pass@host/db
AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
SQS_QUEUE_URL=https://sqs.eu-north-1.amazonaws.com/.../queue
EMAIL_USER=your@gmail.com
EMAIL_PASS=app_password
```

## API Endpoints

| Endpoint | Method | Auth | Açıklama |
|----------|--------|------|----------|
| `/api/v1/hotels/search` | GET | Optional | Otel ara (city, startDate, endDate, guests) |
| `/api/v1/reservations` | POST | Required | Rezervasyon oluştur |
| `/api/v1/admin/hotels` | POST | Admin | Yeni otel ekle |
| `/api/v1/admin/hotels/:id/rooms` | POST | Admin | Otele oda ekle |
| `/api/v1/admin/rooms/:id/availability` | POST | Admin | Oda müsaitliği tanımla |
| `/api/v1/admin/predict-price` | GET | Admin | ML fiyat tahmini al |
| `/health` | GET | Admin | Sunucu durumu |
