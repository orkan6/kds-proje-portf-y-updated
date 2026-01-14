
# KDS Portföy Yönetim Sistemi

Bu proje, yatırımcıların portföylerini oluşturup takip edebilecekleri, detaylı risk ve getiri analizleri yapabilecekleri ve portföy optimizasyon araçlarına erişebilecekleri web tabanlı bir **Karar Destek Sistemi (KDS)** projesidir.

Proje, MVC mimarisi kullanılarak geliştirilmiştir.

##  Özellikler

### 1. Portföy Yönetimi (CRUD)
*   Yeni portföy oluşturma (Hisse senedi ve emtia ekleme).
*   Mevcut portföyleri listeleme, detaylarını görüntüleme.
*   Portföy güncelleme ve silme işlemleri.
*   **İş Kuralı:** Toplam varlık ağırlığı %100'ü geçemez.

### 2. Gelişmiş Finansal Analiz
*   **Risk Metrikleri:** Beta, Alfa, Sharpe Oranı, Treynor Oranı, Volatilite.
*   **Performans Grafiği:** Portföyün S&P 500 endeksine göre tarihsel performans karşılaştırması.
*   **Korelasyon Matrisi:** Portföydeki varlıkların birbiriyle olan ilişkisinin analizi.
*   **İş Kuralı:** Veri tabanı tarihçesine uygun olarak Haziran 2024 sonrasına ait veri gösterilmez.

### 3. Optimizasyon ve Simülasyon
*   **Modern Portföy Teorisi (MPT):** Etkin Sınır (Efficient Frontier) hesaplaması.
*   **Yatırım Tavsiyesi:** Portföyde bulunmayan ve korelasyonu düşük varlık önerileri.
*   **İş Kuralı:** Halihazırda portföyde bulunan varlıklar tekrar önerilmez.

### 4. Piyasa Verileri
*   S&P 500 hisse senetleri ve emtia verileri (Altın, Gümüş, Petrol vb.).
*   Tarihsel fiyat hareketleri ve sektörel analizler.

## Teknolojiler

*   **Backend:** Node.js, Express.js
*   **Veritabanı:** MySQL 
*   **Frontend:** HTML, CSS, JavaScript
*   **Kütüphaneler:**
    *   `chart.js` (Grafik çizimi)
    *   `date-fns` (Tarih işlemleri)
    *   `dotenv` (Konfigürasyon yönetimi)

##  Kurulum

npm install

npm start
  
