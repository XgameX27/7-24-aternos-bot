# 🛡️ Aternos 7/24 Aktif Tutma Botu (Anti-AFK & Auto-Loop)

Bu proje, Aternos sunucularının oyuncu olmadığında otomatik olarak kapanmasını engellemek amacıyla tasarlanmış, **3 dakika oyunda kalıp zıplayan, 2 dakika oyundan çıkarak açlık barını sıfırlayan** akıllı ve hafif bir Mineflayer botudur. 

Tamamen ücretsiz bulut servisleri (Render & UptimeRobot) üzerinde çalışacak şekilde optimize edilmiştir, böylece bilgisayarınızı açık bırakmanıza gerek kalmaz.

---

## 🛠️ Kurulum Adımları

### 1. Adım: Kodları Hazırlama ve Düzenleme
1. Bu depoyu (repository) bilgisayarınıza indirin veya forklayın.
2. `server.js` dosyasını açarak en üstteki **`botArgs`** (host, port, username, version) ve **`AUTH_PASSWORD`** alanlarını kendi Aternos sunucunuza göre güncelleyin.

### 2. Adım: GitHub'a Yükleme
1. [GitHub](https://github.com/) üzerinde **Public (Herkese Açık)** yeni bir depo oluşturun.
2. `server.js` ve `package.json` dosyalarınızı bu depoya yükleyin (Commit & Push).

### 3. Adım: Render.com Üzerinde 7/24 Yayınlama (Hosting)
Botun arka planda kesintisiz çalışması için ücretsiz Render servisini kullanacağız:
1. [Render.com](https://render.com/) adresine gidin ve GitHub hesabınızla giriş yapın.
2. Panelden **New +** butonuna basıp **Web Service** seçeneğini seçin.
3. GitHub'a yüklediğiniz `aternos-loop-afk-bot` deposunu bulun ve yanındaki **Connect** butonuna tıklayın.
4. Ayarları aşağıdaki gibi yapılandırın:
   * **Name:** `aternos-bot` (İstediğinizi yazabilirsiniz)
   * **Runtime:** `Node`
   * **Build Command:** `npm install`
   * **Start Command:** `node server.js`
   * **Instance Type:** En alttaki **Free ($0/month)** seçeneğini işaretleyin.
5. **Create Web Service** butonuna tıklayın. Birkaç dakika içinde botunuz kurulacaktır.
6. Kurulum bittiğinde Render panelinin sol üst köşesinde size özel verilen web adresini (Örn: `https://proje-adi.onrender.com`) kopyalayın.

### 4. Adım: UptimeRobot ile Botu Uyanık Tutma
Render'ın ücretsiz planı, 15 dakika boyunca istek almazsa botu uyku moduna alır. Botun hiç uyumaması için:
1. [UptimeRobot.com](https://uptimerobot.com/) adresine gidin ve ücretsiz üye olun.
2. **Add New Monitor** butonuna tıklayın.
3. Ayarları şu şekilde yapın:
   * **Monitor Type:** `HTTP(s)`
   * **Friendly Name:** `Aternos Bot Tetikleyici`
   * **URL (or IP):** (3. adımda Render'dan kopyaladığınız `https://...` ile başlayan adresi yapıştırın)
   * **Monitoring Interval:** `Every 5 minutes` (Her 5 dakikada bir)
4. **Create Monitor** butonuna basarak işlemi tamamlayın.

---

## 🎮 Oyun İçi Güvenlik Tavsiyesi
Bot sunucuya giriş yaptığında Aternos'un AFK sistemini manipüle etmek için sürekli zıplayacak ve etrafına bakacaktır. 
* Botun dışarıdaki canavarlar (Zombi, İskelet vb.) tarafından öldürülmemesi veya haritada kaybolmaması için **oyuna girip botun etrafını 2x2'lik taş bir kulübe ile kapatıp üstünü örtmeniz** tavsiye edilir.

---

## 📈 Çalışma Mantığı
* **Giriş Dönemi (3 Dakika):** Bot sunucuya girer, şifresini yazar ve kulübede sürekli zıplayarak Aternos'un AFK sayaçlarını sıfırlar. Sunucu kapanamaz.
* **Çıkış Dönemi (2 Dakika):** 3 dakika sonunda bot güvenli şekilde çıkış yapar. Aternos'un 5 dakikalık kapanma sayacı başlar. Ancak sayaç daha 2. dakikasındayken bot tekrar içeri dalarak sayacı tamamen sıfırlar. Bu sayede açlık barı da her zaman %100 dolu kalır.