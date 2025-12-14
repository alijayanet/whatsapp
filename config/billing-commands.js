const { logger } = require('./logger');

let sock = null;

function setSock(sockInstance) {
    sock = sockInstance;
}

async function handlePackagesCommand(remoteJid) {
    if (!sock) return;
    await sock.sendMessage(remoteJid, { text: 'Fitur daftar paket sedang dalam pengembangan.' });
}

async function handleListCustomersCommand(remoteJid, params) {
    if (!sock) return;
    await sock.sendMessage(remoteJid, { text: 'Fitur daftar pelanggan sedang dalam pengembangan.' });
}

async function handleBillingCheckCommand(remoteJid, phone) {
    if (!sock) return;
    await sock.sendMessage(remoteJid, { text: `Fitur cek tagihan untuk ${phone} sedang dalam pengembangan.` });
}

async function handleAssignPackageCommand(remoteJid, params) {
    if (!sock) return;
    await sock.sendMessage(remoteJid, { text: 'Fitur tetapkan paket sedang dalam pengembangan.' });
}

async function handleCreateInvoiceCommand(remoteJid, params) {
    if (!sock) return;
    await sock.sendMessage(remoteJid, { text: 'Fitur buat tagihan sedang dalam pengembangan.' });
}

async function handlePaymentCommand(remoteJid, arg) {
    if (!sock) return;
    await sock.sendMessage(remoteJid, { text: 'Fitur pembayaran sedang dalam pengembangan.' });
}

async function handleIsolirCommand(remoteJid, params) {
    if (!sock) return;
    await sock.sendMessage(remoteJid, { text: 'Fitur isolir sedang dalam pengembangan.' });
}

async function handleUnisolirCommand(remoteJid, params) {
    if (!sock) return;
    await sock.sendMessage(remoteJid, { text: 'Fitur unisolir sedang dalam pengembangan.' });
}

module.exports = {
    setSock,
    handlePackagesCommand,
    handleListCustomersCommand,
    handleBillingCheckCommand,
    handleAssignPackageCommand,
    handleCreateInvoiceCommand,
    handlePaymentCommand,
    handleIsolirCommand,
    handleUnisolirCommand
};
