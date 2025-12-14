const FALLBACK_VERSION = [2, 3000, 1014615654];

async function getVersion() {
    return FALLBACK_VERSION;
}

module.exports = {
    getVersion,
    FALLBACK_VERSION
};
