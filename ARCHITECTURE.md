# Hotel Booking System - Teknik Dokümantasyon

Bu proje, mikroservis mimarisi kullanılarak geliştirilmiş, AWS entegrasyonuna sahip bir Otel Rezervasyon Sistemi'dir. Aşağıda sistemin çalışma mantığı, kullanılan teknolojiler ve mikroservislerin görevleri detaylandırılmıştır.

## 🏗 Mimari Genel Bakış

Sistem iki ana mikroservis ve bir mesaj kuyruğu yapısından oluşmaktadır:
1.  **Hotel Service:** Tüm iş mantığının (işlemler, aramalar, admin görevleri) yönetildiği ana servis.
2.  **Notification Service:** Arka plan görevlerini (mesaj işleme ve zamanlanmış görevler) yöneten yardımcı servis.
3.  **AWS SQS (Simple Queue Service):** Servisler arası asenkron iletişimi sağlayan mesaj kuyruğu.

---

## 🚀 Servis Detayları

### 1. Hotel Service (Port: 3000)
Sistemin ana motorudur ve aşağıdaki özellikleri sunar:

*   **Otel ve Oda Yönetimi:** Admin yetkisine sahip kullanıcılar otel ekleyebilir, odaların doluluk durumlarını ve fiyatlarını tarihlere göre tanımlayabilir.
*   **Arama ve Filtreleme:** Şehir, tarih aralığı ve kişi sayısına göre arama yapılabilir. Sonuçlar SQL seviyesinde filtrelenir ve sadece müsait odalar getirilir.
*   **Fiyat Tahmin Modeli (Machine Learning):** 
    *   Kaggle'dan alınan `hotel_prices.csv` veri seti kullanılarak sunucu başlangıcında bir **Multivariate Linear Regression** modeli eğitilir.
    *   Şehir ve tarih bilgisine göre piyasa fiyat tahmini yapar.
*   **Önbellekleme (Caching):** Sık yapılan aramalar `node-cache` kütüphanesi kullanılarak RAM üzerinde 10 dakika boyunca saklanır, bu da arama hızını %90 artırır.
*   **Rezervasyon Sistemi:** Kullanıcılar rezervasyon yaptığında veritabanı güncellenir (kapasite düşürülür) ve asenkron olarak **AWS SQS** üzerinden bir bildirim mesajı oluşturulur.
*   **Versiyonlama ve Sayfalama:** API `/api/v1/` altında versiyonlanmıştır ve arama sonuçlarında `limit/offset` ile sayfalama desteği sunar.

### 2. Notification Service (Port: 3001)
Kullanıcı deneyimini kesintiye uğratmadan arka planda çalışan servistir:

*   **SQS Worker (Mesaj İşleyici):** `hotel-service` tarafından SQS kuyruğuna atılan rezervasyon mesajlarını gerçek zamanlı olarak dinler. Gelen mesajları ayrıştırarak kullanıcıya rezervasyon onay mesajı (simülasyon) gönderir.
*   **Nightly Capacity Check (Cron Job):** `node-cron` kullanılarak her gece saat 00:00'da çalışır.
    *   Gelecek bir ay içindeki tüm otellerin doluluk oranlarını kontrol eder.
    *   Kapasitesi %20'nin altına düşen kritik durumlar için adminlere uyarı verir.

---

## 🔐 Güvenlik ve Kimlik Doğrulama
*   **AWS Cognito:** Kullanıcı yönetimi ve kimlik doğrulama tamamen AWS Cognito IAM servisi üzerinden yapılır.
*   **JWT Validation:** Servisler yerel şifre tutmaz, sadece gelen JWT (JSON Web Token) erişim anahtarlarını doğrular.
*   **Role-Based Access Control (RBAC):** Admin endpoint'leri sadece `ADMIN` yetkisine sahip kullanıcılar tarafından erişilebilir.

---

## ☁️ Bulut Entegrasyonu ve Deployment
*   **Veritabanı:** Neon PostgreSQL (Managed Cloud Database) kullanılarak veriler bulutta saklanır.
*   **Mesajlaşma:** AWS SQS kullanılarak servisler arası kopukluk (decoupling) sağlanmıştır.
*   **Docker:** Her servis için optimize edilmiş `Dockerfile` dosyaları hazırdır.
*   **API Gateway:** AWS API Gateway ile tüm servisler tek bir uç nokta üzerinden yönetilebilir (Örn: `/hotel/` ve `/notification/` rotaları).

## 🛠 Kullanılan Teknolojiler
*   **Backend:** Node.js, Express.js
*   **Database:** PostgreSQL (pg)
*   **Cloud:** AWS SDK (SQS, Cognito)
*   **ML:** ml-regression, csv-parser
*   **Scheduling:** node-cron
*   **Caching:** node-cache
