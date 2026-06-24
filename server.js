const express = require('express');
const mineflayer = require('mineflayer');
const socks = require('socks');

// 1. RENDER UYUMASIN DİYE WEB SUNUCUSU
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Loop-Bot 7/24 Aktif ve Canlı!');
});

app.listen(PORT, () => {
    console.log(`[Web] Uyku önleyici web sunucusu ${PORT} portunda aktif.`);
});

// 2. BOT VE PROXY AYARLARI
const botArgs = {
    host: 'capelin.aternos.host', // Sunucu adresin
    port: 55652,                  // Sunucu portun
    username: 'KayraLoopAFK',     // Botunun ismi
    version: '1.21.1',            // Minecraft sürümün

    // Aternos engelini aşmak için proxy tüneli (SOCKS5)
    // Eğer bu proxy zamanla yavaşlarsa internetten "free socks5 proxy list" bakıp değiştirebilirsin
    proxy: {
        host: '184.174.61.166',
        port: 4145,
        type: 5
    }
};

let bot;

function createBot() {
    console.log("[Loop-Bot] Proxy üzerinden sunucuya bağlanılıyor...");

    bot = mineflayer.createBot(botArgs);

    // Oyuna başarıyla girildiğinde
    bot.once('spawn', () => {
        console.log("[Loop-Bot] Oyuna başarıyla girildi! Kayıt/Giriş yapılıyor...");

        // Sunucu komutunu güvenli gönderelim
        setTimeout(() => {
            if (bot && bot.entity) {
                bot.chat('/login bot1234');
                console.log("[Loop-Bot] Giriş komutu gönderildi.");
            }
        }, 2000);

        // İçeride kalma süresini başlatan sayaç (Hızlı gir-çık yapmaması için)
        setTimeout(() => {
            console.log("[Loop-Bot] Planlı çıkış süresi geldi. Sunucudan ayrılınıyor...");
            if (bot) bot.quit();
        }, 180000); // İçeride 3 dakika (180000 ms) kalır
    });

    // Zıplama mekanizması (Anti-cheat tekmelesin diye her 5 saniyede bir zıplar)
    bot.on('spawn', () => {
        const jumpInterval = setInterval(() => {
            if (bot && bot.entity) {
                bot.setControlState('jump', true);
                setTimeout(() => {
                    if (bot && bot.entity) bot.setControlState('jump', false);
                }, 500);
            }
        }, 5000); // 5 saniyede bir zıplama paketleri atar

        bot.once('end', () => {
            clearInterval(jumpInterval);
        });
    });

    // Bağlantı koptuğunda ya da hata verdiğinde
    bot.on('end', () => {
        console.log("[Loop-Bot] Bağlantı koptu. 2 dakika dışarıda bekleniyor (Planlı mola)...");
        setTimeout(createBot, 120000); // 2 dakika dışarıda bekleyip (120000 ms) tekrar girer
    });

    bot.on('error', (err) => {
        console.log(`[Loop-Bot] Hata Oluştu: ${err.message}`);
    });
}

// Sistemi ilk kez tetikle
createBot();