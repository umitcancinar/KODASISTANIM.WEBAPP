# ⚡ KODASİSTANİM | Professional IDE & AI Assistant

![KODASİSTANİM Banner](https://raw.githubusercontent.com/umitcancinar/KODASISTANIM.WEBAPP/main/README.png)

---
[![Kişisel Web Sitem](https://img.shields.io/badge/Kişisel_Web_Sitem-Ziyaret_Et-blue?style=for-the-badge&logo=googlechrome)](https://umitcancinar.me)

[![Canlı Demo](https://img.shields.io/badge/Canlı-Demoyu%20İncele-blue?style=for-the-badge&logo=googlechrome)](https://kodasistanim.netlify.app)


**KODASİSTANİM**, tarayıcı üzerinden çalışan, modern, hızlı ve yapay zeka ile güçlendirilmiş profesyonel bir kod editörüdür (IDE). Geliştiricilerin kod yazarken karşılaştıkları hataları çözmelerine, kod yapılarını anlamalarına ve daha verimli çalışmalarına olanak tanıyan tam donanımlı bir ortam sunar.

Sistemin kalbinde, dünya standartlarında **Monaco Editor** (VS Code'un çekirdeği) ve gelişmiş **Groq Llama-3.3-70B** yapay zeka modeli yatmaktadır.

---

## 🌟 Öne Çıkan Özellikler

### 💻 Gelişmiş Kod Editörü (Monaco)
- **Çoklu Dil Desteği:** C, C++, Python, Java, JavaScript, Ruby, Swift, Go ve daha fazlası.
- **Akıllı Otomatik Tamamlama:** Kod yazarken değişkenleri ve fonksiyonları otomatik tamamlar.
- **Syntax Highlighting:** Cyberpunk esintili modern ve göz yormayan karanlık tema.
- **Minimap:** Uzun kod dosyalarında hızlı gezinme imkanı.

### 🤖 Akıllı Yapay Zeka Asistanı
Sadece kod yazmakla kalmazsınız, yanınızda her an sorularınızı cevaplayacak uzman bir yazılım eğitmeni bulunur.
- **Gerçek Zamanlı Sohbet Hafızası:** Asistan, önceki konuşmalarınızı hatırlar ve bağlam kopmadan size destek verir.
- **Eğitmen Karakteri:** Size direkt cevabı (kodu) verip geçmek yerine mantığını açıklar, öğretir ve isterseniz kodu sunar.
- **Tek Tıkla Koda Uygula (🚀):** Yapay zekanın ürettiği kod bloklarını tek bir tıkla sisteminize kopyalayabilir veya doğrudan editörünüzdeki kod ile anında değiştirebilirsiniz.

![AI Asistan Görünümü](https://raw.githubusercontent.com/umitcancinar/KODASISTANIM.WEBAPP/main/readme2.png)

### ⚙️ Güçlü Altyapı ve Güvenlik
- **Netlify Serverless Backend:** Güvenlik nedeniyle yapay zeka API anahtarı (Groq) uygulamanın ön yüzünde saklanmaz. İstekler güvenli bir şekilde `netlify/functions` üzerinden arka plana (Backend) iletilir.
- **Bulut Tabanlı Derleme (JDoodle):** Yazdığınız kodlar, tarayıcıyı yormadan güvenli bulut sunucularında (JDoodle API) derlenir ve sonuçları anında terminalinize yansıtılır.
- **Güvenli LocalStorage:** Kişisel tercihleriniz ve (varsa) kendi özel API anahtarlarınız sadece kendi tarayıcınızda kayıtlı tutulur.

---

## 🛠️ Kurulum & Yerel Geliştirme (Local Development)

Projeyi kendi bilgisayarınızda çalıştırmak oldukça basittir. 

1. **Repoyu Klonlayın:**
```bash
git clone https://github.com/umitcancinar/KODASISTANIM.WEBAPP.git
cd KODASISTANIM.WEBAPP
```

2. **Backend API Kurulumu (Netlify CLI):**
Yapay zeka asistanının lokalde (kendi bilgisayarınızda) çalışabilmesi için Netlify CLI'a ihtiyacınız olacak.
```bash
npm install netlify-cli -g
```

3. **Ortam Değişkenleri (.env):**
Proje ana dizininde `.env` (gizli) bir dosya oluşturun ve Groq API anahtarınızı içine girin.
```text
GROQ_API_KEY=sizin_groq_api_anahtariniz_gsk_...
```

4. **Projeyi Başlatın:**
```bash
netlify dev
```
Bu sayede hem ön yüz (HTML/CSS/JS) sunulacak hem de arka yüz servisleri (`/api/chat`) başarıyla tetiklenebilecektir.

---

## 🎨 Tasarım & Kullanıcı Deneyimi
- **Glassmorphism Arayüz:** Modern, şeffaf ve bulanık (blur) cam efektleriyle desteklenen menüler.
- **Responsive Dizayn:** Tam ekran ve akıcı bir çalışma deneyimi.
- **Neon Efektler:** Hover geçişleri, tıklanabilir butonlar ve aktif sekmelerde özel parlama (glow) animasyonları.

---

💬 **Bana Ulaşın:** Projelerim hakkında konuşmak, işbirliği yapmak veya sadece yazılım üzerine sohbet etmek isterseniz bana [websitem](https://umitcancinar.me) üzerinden ulaşabilirsiniz.
