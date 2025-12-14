const express = require('express');
const path = require('path');
const axios = require('axios');
require('dotenv').config();
const { logger } = require('./config/logger');
const whatsapp = require('./config/whatsapp');
const { monitorPPPoEConnections } = require('./config/mikrotik');
const fs = require('fs');

// Inisialisasi aplikasi Express minimal (hanya untuk health check)
const app = express();

// Middleware dasar
const session = require('express-session');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup Session
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret_key_wa_only_bot_12345',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 jam
}));

// Setup View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Web Routes
const webRoutes = require('./routes/web');
app.use('/', webRoutes);

// Konstanta
const VERSION = '1.0.0';

// Variabel global untuk menyimpan status koneksi WhatsApp
global.whatsappStatus = {
    connected: false,
    qrCode: null,
    phoneNumber: null,
    connectedSince: null,
    status: 'disconnected'
};

// Variabel global untuk menyimpan semua pengaturan dari .env
global.appSettings = {
    // Server
    port: process.env.PORT || '3501',
    host: process.env.HOST || 'localhost',

    // Admin
    adminUsername: process.env.ADMIN_USERNAME || 'admin',
    adminPassword: process.env.ADMIN_PASSWORD || 'admin',

    // GenieACS
    genieacsUrl: process.env.GENIEACS_URL || 'http://localhost:7557',
    genieacsUsername: process.env.GENIEACS_USERNAME || '',
    genieacsPassword: process.env.GENIEACS_PASSWORD || '',
    genieApiUrl: process.env.GENIE_API_URL || '',

    // Mikrotik
    mikrotikHost: process.env.MIKROTIK_HOST || '',
    mikrotikPort: process.env.MIKROTIK_PORT || '8728',
    mikrotikUser: process.env.MIKROTIK_USER || '',
    mikrotikPassword: process.env.MIKROTIK_PASSWORD || '',

    // WhatsApp
    adminNumber: process.env.ADMIN_NUMBER || '',
    technicianNumbers: process.env.TECHNICIAN_NUMBERS || '',
    reconnectInterval: process.env.RECONNECT_INTERVAL || '5000',
    maxReconnectRetries: process.env.MAX_RECONNECT_RETRIES || '5',
    whatsappSessionPath: process.env.WHATSAPP_SESSION_PATH || './whatsapp-session',
    whatsappKeepAlive: process.env.WHATSAPP_KEEP_ALIVE === 'true',
    whatsappRestartOnError: process.env.WHATSAPP_RESTART_ON_ERROR === 'true',

    // Monitoring
    pppoeMonitorInterval: process.env.PPPOE_MONITOR_INTERVAL || '60000',
    rxPowerWarning: process.env.RX_POWER_WARNING || '-25',
    rxPowerCritical: process.env.RX_POWER_CRITICAL || '-27',

    // Company Info
    companyHeader: process.env.COMPANY_HEADER || 'ISP Monitor',
    footerInfo: process.env.FOOTER_INFO || '',
};

// Pastikan direktori sesi WhatsApp ada
const sessionDir = process.env.WHATSAPP_SESSION_PATH || './whatsapp-session';
if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
    logger.info(`Direktori sesi WhatsApp dibuat: ${sessionDir}`);
}

// Route untuk health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        version: VERSION,
        whatsapp: global.whatsappStatus.status
    });
});

// Route untuk mendapatkan status WhatsApp
app.get('/whatsapp/status', (req, res) => {
    res.json({
        status: global.whatsappStatus.status,
        connected: global.whatsappStatus.connected,
        phoneNumber: global.whatsappStatus.phoneNumber,
        connectedSince: global.whatsappStatus.connectedSince
    });
});

// Import PPPoE monitoring modules
const pppoeMonitor = require('./config/pppoe-monitor');
const pppoeCommands = require('./config/pppoe-commands');

// Import GenieACS commands module
const genieacsCommands = require('./config/genieacs-commands');

// Import MikroTik commands module
const mikrotikCommands = require('./config/mikrotik-commands');

// Inisialisasi WhatsApp dan PPPoE monitoring
try {
    whatsapp.connectToWhatsApp().then(sock => {
        if (sock) {
            // Set sock instance untuk whatsapp
            whatsapp.setSock(sock);

            // Set sock instance untuk PPPoE monitoring
            pppoeMonitor.setSock(sock);
            pppoeCommands.setSock(sock);

            // Set sock instance untuk GenieACS commands
            genieacsCommands.setSock(sock);

            // Set sock instance untuk MikroTik commands
            mikrotikCommands.setSock(sock);

            logger.info('WhatsApp connected successfully');

            // Initialize PPPoE monitoring jika MikroTik dikonfigurasi
            if (process.env.MIKROTIK_HOST && process.env.MIKROTIK_USER && process.env.MIKROTIK_PASSWORD) {
                pppoeMonitor.initializePPPoEMonitoring().then(() => {
                    logger.info('PPPoE monitoring initialized');
                }).catch(err => {
                    logger.error('Error initializing PPPoE monitoring:', err);
                });
            }
        }
    }).catch(err => {
        logger.error('Error connecting to WhatsApp:', err);
    });

    // Mulai monitoring PPPoE lama jika dikonfigurasi (fallback)
    if (process.env.MIKROTIK_HOST && process.env.MIKROTIK_USER && process.env.MIKROTIK_PASSWORD) {
        monitorPPPoEConnections().catch(err => {
            logger.error('Error starting legacy PPPoE monitoring:', err);
        });
    }
} catch (error) {
    logger.error('Error initializing services:', error);
}

// Fungsi untuk memulai server dengan penanganan port yang sudah digunakan
function startServer(portToUse) {
    logger.info(`Mencoba memulai server pada port ${portToUse}...`);

    // Coba port alternatif jika port utama tidak tersedia
    try {
        const server = app.listen(portToUse, () => {
            logger.info(`Server berhasil berjalan pada port ${portToUse}`);
            logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
            // Update global.appSettings.port dengan port yang berhasil digunakan
            global.appSettings.port = portToUse.toString();
        }).on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                logger.warn(`PERINGATAN: Port ${portToUse} sudah digunakan, mencoba port alternatif...`);
                // Coba port alternatif (port + 1000)
                const alternativePort = portToUse + 1000;
                logger.info(`Mencoba port alternatif: ${alternativePort}`);

                // Buat server baru dengan port alternatif
                const alternativeServer = app.listen(alternativePort, () => {
                    logger.info(`Server berhasil berjalan pada port alternatif ${alternativePort}`);
                    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
                    // Update global.appSettings.port dengan port yang berhasil digunakan
                    global.appSettings.port = alternativePort.toString();
                }).on('error', (altErr) => {
                    logger.error(`ERROR: Gagal memulai server pada port alternatif ${alternativePort}:`, altErr.message);
                    process.exit(1);
                });
            } else {
                logger.error('Error starting server:', err);
                process.exit(1);
            }
        });
    } catch (error) {
        logger.error(`Terjadi kesalahan saat memulai server:`, error);
        process.exit(1);
    }
}

// Pastikan port menggunakan nilai langsung dari .env
// Reload dotenv untuk memastikan kita mendapatkan nilai terbaru dari file .env
require('dotenv').config();
port = parseInt(process.env.PORT, 10);
logger.info(`Attempting to start server on configured port: ${port}`);

// Mulai server dengan port dari konfigurasi
startServer(port);

// Tambahkan perintah untuk menambahkan nomor pelanggan ke tag GenieACS
const { addCustomerTag } = require('./config/customerTag');

// Export app untuk testing
module.exports = app;
