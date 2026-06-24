const mineflayer = require('mineflayer');
const http = require('http'); // Bot dışarıdayken Render/Glitch sitesini uyanık tutan can damarımız

// --- AYARLAR ---
const botArgs = {
    host: 'oceanking337.aternos.me', // Sunucu IP adresi
    port: 32697,                      // Sunucu portu
    username: 'KayraLoopAFK',         // Botun sunucudaki adı
    version: '1.21.1'                 // Minecraft sürümü
};

const AUTH_PASSWORD = 'bot1234';    // Sunucu giriş şifresi

// ⏱️ ATERNOS SAVAR SÜRE AYARLARI (Milisaniye Cinsinden)
const STAY_ONLINE_TIME = 3 * 60 * 1000;  // Oyunda 3 dakika kalacak ve zıplayacak
const STAY_OFFLINE_TIME = 2 * 60 * 1000; // Dışarıda 2 dakika bekleyip açlık sıfırlayacak

let bot;
let jumpInterval = null;
let disconnectTimeout = null;
let isIntentionallyDisconnecting = false;

// --- SİTENİN UYUMASINI ENGELLEYEN WEB SUNUCUSU ---
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Aternos 7/24 Botu Arka Planda Sorunsuz Calisiyor!');
});
server.listen(process.env.PORT || 3000, () => {
    console.log('[Web] Uyku önleyici web sunucusu aktif edildi.');
});

function createBot() {
    console.log(`[Loop-Bot] Sunucuya bağlanılıyor...`);
    isIntentionallyDisconnecting = false;
    bot = mineflayer.createBot(botArgs);

    bot.on('spawn', () => {
        console.log(`[Loop-Bot] Oyuna girildi! 3 dakikalık zıplama serüveni başladı.`);

        // Sunucu giriş şifresi komutu (Varsa)
        if (AUTH_PASSWORD && AUTH_PASSWORD !== 'SifrenizBuraya') {
            setTimeout(() => bot.chat(`/login ${AUTH_PASSWORD}`), 1500);
        }

        // --- ZIPLAMA VE DÖNME DÖNGÜSÜ (Her 2 saniyede bir zıplar) ---
        if (jumpInterval) clearInterval(jumpInterval);
        jumpInterval = setInterval(() => {
            if (!bot || !bot.entity) return;

            // Zıplama eylemi
            bot.setControlState('jump', true);
            setTimeout(() => {
                if (bot) bot.setControlState('jump', false);
            }, 400);

            // Sağa sola bakış (Aternos AFK algılayıcısını tamamen kör eder)
            const randomYaw = Math.random() * Math.PI * 2;
            bot.look(randomYaw, 0);
        }, 2000);

        // --- ⏱️ 3 DAKİKA SONRA OYUNDAN ATMA SİSTEMİ ⏱️ ---
        if (disconnectTimeout) clearTimeout(disconnectTimeout);
        disconnectTimeout = setTimeout(() => {
            console.log(`[Loop-Bot] 3 dakika doldu. Açlık sıfırlamak için çıkış yapılıyor...`);

            isIntentionallyDisconnecting = true; // Planlı çıkış kilidini aç

            if (jumpInterval) clearInterval(jumpInterval);
            bot.quit(); // Oyundan çıkış yap
        }, STAY_ONLINE_TIME);
    });

    // Bağlantı koptuğunda tetiklenen döngü
    bot.on('end', (reason) => {
        if (jumpInterval) clearInterval(jumpInterval);
        if (disconnectTimeout) clearTimeout(disconnectTimeout);

        if (isIntentionallyDisconnecting) {
            // Bizim emrimizle çıktıysa tam 2 dakika dışarıda beklesin
            console.log(`[Loop-Bot] Planlı çıkış başarılı. 2 dakika dışarıda bekleniyor...`);
            setTimeout(createBot, STAY_OFFLINE_TIME);
        } else {
            // İnternet kopması gibi beklenmedik bir durumda 5 saniye içinde hemen geri girsin sunucuyu kurtarsın
            console.log(`[Loop-Bot] Beklenmedik düşme (${reason}). 5 saniye sonra acil bağlanılıyor...`);
            setTimeout(createBot, 5000);
        }
    });

    bot.on('error', (err) => {
        console.log(`[Loop-Bot] Hata: ${err.message}`);
    });
}

// Botu ilk kez çalıştır
createBot();