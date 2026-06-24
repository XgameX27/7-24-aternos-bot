const express = require('express');
const mineflayer = require('mineflayer');
const { SocksClient } = require('socks'); // Doğrudan SOCKS istemcisini alıyoruz

// 1. RENDER UYUMASIN DİYE WEB SUNUCUSU
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Loop-Bot 7/24 Aktif ve Canlı!');
});

app.listen(PORT, () => {
    console.log(`[Web] Uyku önleyici web sunucusu ${PORT} portunda aktif.`);
});

// 2. ANA AYARLAR
const targetHost = 'capelin.aternos.host';
const targetPort = 55652;
const username = 'KayraLoopAFK';
const version = '1.21.1';

// Çalışan güncel bir SOCKS5 Proxy ayarı
const proxyOptions = {
    proxy: {
        host: '184.174.61.166', // Eğer timeout almaya devam edersen buraya taze bir SOCKS5 IP'si yazabilirsin
        port: 4145,
        type: 5
    },
    command: 'connect',
    destination: {
        host: targetHost,
        port: targetPort
    }
};

let bot;

function createBot() {
    console.log("[Loop-Bot] SOCKS5 Proxy tüneli oluşturuluyor...");

    // Önce Proxy üzerinden Aternos'a gizli bir soket (tünel) açıyoruz
    SocksClient.createConnection(proxyOptions, (err, info) => {
        if (err) {
            console.log(`[Loop-Bot] Proxy Tünel Hatası: ${err.message}. 2 dakika sonra tekrar denenecek.`);
            setTimeout(createBot, 120000);
            return;
        }

        console.log("[Loop-Bot] Tünel başarıyla açıldı! Bot içeri sızıyor...");

        // Mineflayer'a diyoruz ki: "Render IP'sini kullanma, sana verdiğim bu özel tünelden (stream) bağlan!"
        bot = mineflayer.createBot({
            stream: info.socket,
            username: username,
            version: version
        });

        // Oyuna başarıyla girildiğinde
        bot.once('spawn', () => {
            console.log("[Loop-Bot] Oyuna başarıyla girildi! Kayıt/Giriş yapılıyor...");

            setTimeout(() => {
                if (bot && bot.entity) {
                    bot.chat('/login bot1234');
                    console.log("[Loop-Bot] Giriş komutu gönderildi.");
                }
            }, 3000);

            // 3 Dakika sonra planlı çıkış
            setTimeout(() => {
                console.log("[Loop-Bot] Planlı çıkış süresi geldi. Sunucudan ayrılınıyor...");
                if (bot) bot.quit();
            }, 180000);
        });

        // Zıplama mekanizması (Hile korumasına takılmamak için yavaşlatılmış)
        bot.on('spawn', () => {
            const jumpInterval = setInterval(() => {
                if (bot && bot.entity) {
                    bot.setControlState('jump', true);
                    setTimeout(() => {
                        if (bot && bot.entity) bot.setControlState('jump', false);
                    }, 500);
                }
            }, 6000); // 6 saniyede bir sakin zıplama

            bot.once('end', () => {
                clearInterval(jumpInterval);
            });
        });

        // Bağlantı koptuğunda
        bot.on('end', () => {
            console.log("[Loop-Bot] Bağlantı koptu. 2 dakika planlı mola bekleniyor...");
            setTimeout(createBot, 120000);
        });

        bot.on('error', (err) => {
            console.log(`[Loop-Bot] Bot Hatası: ${err.message}`);
        });
    });
}

// Sistemi ilk kez tetikle
createBot();