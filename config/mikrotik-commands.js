// mikrotik-commands.js - Module for handling Mikrotik commands via WhatsApp
const { logger } = require('./logger');
const { 
    addHotspotUser,
    addPPPoESecret,
    setPPPoEProfile,
    getResourceInfo,
    getActiveHotspotUsers,
    getActivePPPoEConnections,
    getInactivePPPoEUsers,
    deleteHotspotUser,
    deletePPPoESecret
} = require('./mikrotik');

let sock = null;

// Fungsi untuk set instance sock
function setSock(sockInstance) {
    sock = sockInstance;
}

// Handler untuk menambah user hotspot
async function handleAddHotspotUser(remoteJid, params) {
    if (!sock) {
        console.error('Sock instance not set');
        return;
    }

    if (params.length < 2) {
        await sock.sendMessage(remoteJid, { 
            text: `❌ *Format Salah!*\n\n` +
                  `Format yang benar:\n` +
                  `addhotspot [username] [password] [profile]\n\n` +
                  `Contoh:\n` +
                  `• addhotspot user123 pass123\n` +
                  `• addhotspot user123 pass123 default`
        });
        return;
    }

    const [username, password, profile = "default"] = params;
    const result = await addHotspotUser(username, password, profile);

    await sock.sendMessage(remoteJid, { 
        text: `${result && result.success ? '✅' : '❌'} ${result && result.message ? result.message : 'Terjadi kesalahan'}\n\n` +
              `Username: ${username}\n` +
              `Profile: ${profile}`
    });
}

// Handler untuk menambah secret PPPoE
async function handleAddPPPoESecret(remoteJid, params) {
    if (!sock) {
        console.error('Sock instance not set');
        return;
    }

    if (params.length < 2) {
        await sock.sendMessage(remoteJid, { 
            text: `❌ *Format Salah!*\n\n` +
                  `Format yang benar:\n` +
                  `addpppoe [username] [password] [profile] [ip]\n\n` +
                  `Contoh:\n` +
                  `• addpppoe user123 pass123\n` +
                  `• addpppoe user123 pass123 default\n` +
                  `• addpppoe user123 pass123 default 10.0.0.1`
        });
        return;
    }

    const [username, password, profile = "default", localAddress = ""] = params;
    const result = await addPPPoESecret(username, password, profile, localAddress);

    await sock.sendMessage(remoteJid, { 
        text: `${result && result.success ? '✅' : '❌'} ${result && result.message ? result.message : 'Terjadi kesalahan'}\n\n` +
              `Username: ${username}\n` +
              `Profile: ${profile}\n` +
              `IP: ${localAddress || 'Menggunakan IP dari pool'}`
    });
}

// Handler untuk mengubah profile PPPoE
async function handleChangePPPoEProfile(remoteJid, params) {
    if (!sock) {
        console.error('Sock instance not set');
        return;
    }

    if (params.length < 2) {
        await sock.sendMessage(remoteJid, { 
            text: `❌ *Format Salah!*\n\n` +
                  `Format yang benar:\n` +
                  `setprofile [username] [new-profile]\n\n` +
                  `Contoh:\n` +
                  `setprofile user123 premium`
        });
        return;
    }

    const [username, newProfile] = params;
    const result = await setPPPoEProfile(username, newProfile);

    await sock.sendMessage(remoteJid, { 
        text: `${result && result.success ? '✅' : '❌'} ${result && result.message ? result.message : 'Terjadi kesalahan'}\n\n` +
              `Username: ${username}\n` +
              `Profile Baru: ${newProfile}`
    });
}

// Handler untuk monitoring resource
async function handleResourceInfo(remoteJid) {
    if (!sock) {
        console.error('Sock instance not set');
        return;
    }
    const result = await getResourceInfo();
    if (!result.success || !result.data) {
        await sock.sendMessage(remoteJid, { text: `❌ ${result.message}` });
        return;
    }
    const data = result.data;
    await sock.sendMessage(remoteJid, { 
        text: `📊 *INFO RESOURCE ROUTER*\n\n` +
              `💻 *CPU*\n` +
              `• Load: ${data.cpuLoad}%\n` +
              `• Count: ${data.cpuCount}\n` +
              `• Frequency: ${data.cpuFrequency} MHz\n\n` +
              `💾 *MEMORY*\n` +
              `• Total: ${data.totalMemory} MB\n` +
              `• Free: ${data.memoryFree} MB\n` +
              `• Used: ${data.memoryUsed} MB\n` +
              `• Usage: ${data.totalMemory ? ((data.memoryUsed/data.totalMemory)*100).toFixed(1) : 0}%\n\n` +
              `💿 *DISK*\n` +
              `• Total: ${data.totalDisk} MB\n` +
              `• Free: ${data.diskFree} MB\n` +
              `• Used: ${data.diskUsed} MB\n` +
              `• Usage: ${data.totalDisk ? ((data.diskUsed/data.totalDisk)*100).toFixed(1) : 0}%\n\n` +
              `📶 *TRAFFIC* (${process.env.MAIN_INTERFACE || 'ether1'})\n` +
              `• RX: ${data.trafficRX} Mbps\n` +
              `• TX: ${data.trafficTX} Mbps\n\n` +
              `⏰ *UPTIME*\n` +
              `• ${data.uptime}\n\n` +
              `🔧 *BOARD*\n` +
              `• Model: ${data.model}\n` +
              `• Serial: ${data.serialNumber}\n` +
              `• Board: ${data.boardName}\n` +
              `• Architecture: ${data.architecture}\n` +
              `• Firmware: ${data.firmware}\n` +
              `• Bad Blocks: ${data.badBlocks}\n` +
              `• Voltage: ${data.voltage}\n` +
              `• Temperature: ${data.temperature}`
    });
}

// Handler untuk melihat user hotspot aktif
async function handleActiveHotspotUsers(remoteJid) {
    if (!sock) {
        console.error('Sock instance not set');
        return;
    }
    const result = await getActiveHotspotUsers();
    if (!result.success) {
        await sock.sendMessage(remoteJid, { text: `❌ ${result.message}` });
        return;
    }
    const users = result.data;
    let message = '👥 *DAFTAR USER HOTSPOT AKTIF*\n\n';
    if (!users || users.length === 0) {
        message += 'Tidak ada user hotspot yang aktif';
    } else {
        message += `Total: ${users.length} user\n\n`;
        users.forEach((user, index) => {
            if (index < 20) {
                message += `${index + 1}. *User: ${user.user || 'N/A'}*\n` +
                          `   • IP: ${user.address || 'N/A'}\n` +
                          `   • Uptime: ${user.uptime || 'N/A'}\n`;
                if (user['bytes-in'] && user['bytes-out']) {
                    const bytesIn = parseInt(user['bytes-in']) || 0;
                    const bytesOut = parseInt(user['bytes-out']) || 0;
                    message += `   • Download: ${(bytesIn/1024/1024).toFixed(2)} MB\n` +
                              `   • Upload: ${(bytesOut/1024/1024).toFixed(2)} MB\n`;
                }
                message += '\n';
            }
        });
        if (users.length > 20) {
            message += `... dan ${users.length - 20} user lainnya`;
        }
    }
    await sock.sendMessage(remoteJid, { text: message });
}

// Handler untuk melihat koneksi PPPoE aktif
async function handleActivePPPoE(remoteJid) {
    if (!sock) {
        console.error('Sock instance not set');
        return;
    }
    const result = await getActivePPPoEConnections();
    if (!result.success) {
        await sock.sendMessage(remoteJid, { text: `❌ ${result.message}` });
        return;
    }
    const connections = result.data;
    let message = '📡 *DAFTAR KONEKSI PPPoE AKTIF*\n\n';
    if (!connections || connections.length === 0) {
        message += 'Tidak ada koneksi PPPoE yang aktif';
    } else {
        message += `Total: ${connections.length} koneksi\n\n`;
        const maxDisplay = 20;
        const displayConnections = connections.slice(0, maxDisplay);
        displayConnections.forEach((conn, index) => {
            message += `${index + 1}. *User: ${conn.name || 'N/A'}*\n`;
            if (conn.service) message += `   • Service: ${conn.service}\n`;
            if (conn.address) message += `   • IP: ${conn.address}\n`;
            if (conn.uptime) message += `   • Uptime: ${conn.uptime}\n`;
            if (conn.caller) message += `   • Caller ID: ${conn.caller}\n`;
            message += '\n';
        });
        if (connections.length > maxDisplay) {
            message += `... dan ${connections.length - maxDisplay} koneksi lainnya`;
        }
    }
    await sock.sendMessage(remoteJid, { text: message });
}

// Handler untuk menghapus user hotspot
async function handleDeleteHotspotUser(remoteJid, params) {
    if (!sock) {
        console.error('Sock instance not set');
        return;
    }

    if (params.length < 1) {
        await sock.sendMessage(remoteJid, { 
            text: `❌ *Format Salah!*\n\n` +
                  `Format yang benar:\n` +
                  `delhotspot [username]\n\n` +
                  `Contoh:\n` +
                  `• delhotspot user123`
        });
        return;
    }

    const [username] = params;
    const result = await deleteHotspotUser(username);

    await sock.sendMessage(remoteJid, { 
        text: `${result && result.success ? '✅' : '❌'} ${result && result.message ? result.message : 'Terjadi kesalahan'}\n\n` +
              `Username: ${username}`
    });
}

// Handler untuk menghapus PPPoE secret
async function handleDeletePPPoESecret(remoteJid, params) {
    if (!sock) {
        console.error('Sock instance not set');
        return;
    }

    if (params.length < 1) {
        await sock.sendMessage(remoteJid, { 
            text: `❌ *Format Salah!*\n\n` +
                  `Format yang benar:\n` +
                  `delpppoe [username]\n\n` +
                  `Contoh:\n` +
                  `• delpppoe user123`
        });
        return;
    }

    const [username] = params;
    const result = await deletePPPoESecret(username);

    await sock.sendMessage(remoteJid, { 
        text: `${result && result.success ? '✅' : '❌'} ${result && result.message ? result.message : 'Terjadi kesalahan'}\n\n` +
              `Username: ${username}`
    });
}

// Handler untuk melihat user PPPoE offline
async function handleOfflineUsers(remoteJid) {
    if (!sock) {
        console.error('Sock instance not set');
        return;
    }

    // Kirim pesan sedang memproses
    await sock.sendMessage(remoteJid, { 
        text: `⏳ *Memproses Permintaan*\n\nSedang mengambil daftar user PPPoE offline...`
    });
    
    const result = await getInactivePPPoEUsers();

    if (result && result.success) {
        let message = `📊 *DAFTAR USER PPPoE OFFLINE*\n\n`;
        message += `Total User: ${result.totalSecrets}\n`;
        message += `User Aktif: ${result.totalActive} (${((result.totalActive/result.totalSecrets)*100).toFixed(2)}%)\n`;
        message += `User Offline: ${result.totalInactive} (${((result.totalInactive/result.totalSecrets)*100).toFixed(2)}%)\n\n`;
        
        if (result.data.length === 0) {
            message += 'Tidak ada user PPPoE yang offline';
        } else {
            // Batasi jumlah user yang ditampilkan untuk menghindari pesan terlalu panjang
            const maxUsers = 30;
            const displayUsers = result.data.slice(0, maxUsers);
            
            displayUsers.forEach((user, index) => {
                message += `${index + 1}. *${user.name}*${user.comment ? ` (${user.comment})` : ''}\n`;
            });
            
            if (result.data.length > maxUsers) {
                message += `\n... dan ${result.data.length - maxUsers} user lainnya`;
            }
        }
        
        await sock.sendMessage(remoteJid, { text: message });
    } else {
        await sock.sendMessage(remoteJid, { 
            text: `❌ Gagal mendapatkan daftar user PPPoE offline: ${result ? result.message : 'Terjadi kesalahan'}`
        });
    }
}

module.exports = {
    setSock,
    handleAddHotspotUser,
    handleAddPPPoESecret,
    handleChangePPPoEProfile,
    handleResourceInfo,
    handleActiveHotspotUsers,
    handleActivePPPoE,
    handleDeleteHotspotUser,
    handleDeletePPPoESecret,
    handleOfflineUsers
};
