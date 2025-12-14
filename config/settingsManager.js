const fs = require('fs');
const path = require('path');
require('dotenv').config();

const settingsPath = path.join(__dirname, '../settings.json');

// Cache settings to reduce file I/O
let settingsCache = null;
let lastCacheUpdate = 0;
const CACHE_TTL = 60000; // 1 minute

function loadSettings() {
    try {
        if (!fs.existsSync(settingsPath)) {
            console.warn('⚠️ settings.json not found, using defaults/env');
            return {};
        }
        const data = fs.readFileSync(settingsPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading settings:', error);
        return {};
    }
}

function getSettingsWithCache() {
    const now = Date.now();
    if (!settingsCache || (now - lastCacheUpdate > CACHE_TTL)) {
        settingsCache = loadSettings();
        lastCacheUpdate = now;
    }
    return settingsCache;
}

function getSetting(key, defaultValue) {
    const settings = getSettingsWithCache();

    // Check in settings.json first
    if (settings && settings[key] !== undefined) {
        return settings[key];
    }

    // Check environment variables (convert key to UPPER_CASE)
    const envKey = key.toUpperCase();
    if (process.env[envKey] !== undefined) {
        return process.env[envKey];
    }

    return defaultValue;
}

function saveSettings(newSettings) {
    try {
        const currentSettings = loadSettings();
        const updatedSettings = { ...currentSettings, ...newSettings };

        fs.writeFileSync(settingsPath, JSON.stringify(updatedSettings, null, 2));

        // Update cache
        settingsCache = updatedSettings;
        lastCacheUpdate = Date.now();

        return true;
    } catch (error) {
        console.error('Error saving settings:', error);
        return false;
    }
}

module.exports = {
    getSetting,
    getSettingsWithCache,
    saveSettings
};
