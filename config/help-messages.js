const { getSetting } = require('./settingsManager');

function getCompanyHeader() {
    return getSetting('company_header', 'ALIJAYA DIGITAL NETWORK');
}

function getFooterInfo() {
    return getSetting('footer_info', 'Powered by Alijaya Digital Network');
}

function getAdminHelpMessage() {
    const header = getCompanyHeader();
    return `📱 *${header} - MENU ADMIN* 📱

*MANAJEMEN INTERFACE*
• *interfaces* - Cek semua interface
• *enableif [nama]* - Aktifkan interface
• *disableif [nama]* - Matikan interface

*MANAJEMEN PPPoE*
• *users* - Cek ringkasan user
• *addpppoe [user] [pass] [profile]* - Buat akun PPPoE
• *delpppoe [user]* - Hapus akun PPPoE
• *pppoe* - Cek user PPPoE aktif
• *setprofile [user] [profile]* - Ganti profil user
• *offline* - Cek user PPPoE offline

*MANAJEMEN HOTSPOT*
• *hotspot* - Cek user hotspot aktif
• *addhotspot [user] [pass]* - Buat akun hotspot
• *delhotspot [user]* - Hapus akun hotspot

*MONITORING & SYSTEM*
• *resource* - Cek penggunaan CPU/RAM
• *traffic* - Cek trafik interface
• *logs [topik]* - Cek log sistem
• *ping [host]* - Test koneksi
• *reboot* - Restart router

*BILLING*
• *tagihan* - Cek tagihan
• *cekmutasi* - Cek mutasi bank

*LAINNYA*
• *status* - Cek status bot
• *admin* - Menu ini

${getFooterInfo()}`;
}

function getCustomerHelpMessage() {
    const header = getCompanyHeader();
    return `👋 Halo! Selamat datang di layanan *${header}*

Berikut adalah perintah yang bisa Anda gunakan:

*WIFI & INTERNET*
• *status* - Cek status koneksi Anda
• *gantiwifi [nama_baru]* - Ganti nama WiFi
• *gantipass [password_baru]* - Ganti password WiFi

*BANTUAN*
• *menu* - Menampilkan menu ini
• *info* - Informasi layanan

Jika Anda mengalami gangguan, silakan hubungi teknisi kami.

${getFooterInfo()}`;
}

function getGeneralHelpMessage() {
    return getCustomerHelpMessage();
}

module.exports = {
    getAdminHelpMessage,
    getCustomerHelpMessage,
    getGeneralHelpMessage
};
