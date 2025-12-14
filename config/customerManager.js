const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dataPath = path.join(__dirname, '../data/customers.json');

// Ensure data directory exists
const dataDir = path.dirname(dataPath);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Ensure file exists
if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, '[]', 'utf8');
}

function loadCustomers() {
    try {
        const data = fs.readFileSync(dataPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading customers:', error);
        return [];
    }
}

function saveCustomers(customers) {
    try {
        fs.writeFileSync(dataPath, JSON.stringify(customers, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Error saving customers:', error);
        return false;
    }
}

const customerManager = {
    getAllCustomers() {
        return loadCustomers();
    },

    getCustomerById(id) {
        const customers = loadCustomers();
        return customers.find(c => c.id === id);
    },

    createCustomer(data) {
        const customers = loadCustomers();

        // Simple validation
        if (!data.name || !data.pppoeUsername) {
            throw new Error('Name and PPPoE Username are required');
        }

        // Check duplicates
        if (customers.some(c => c.pppoeUsername.toLowerCase() === data.pppoeUsername.toLowerCase())) {
            throw new Error('PPPoE Username already exists');
        }

        const newCustomer = {
            id: uuidv4(),
            name: data.name,
            whatsappNumber: data.whatsappNumber || '',
            whatsappLid: data.whatsappLid || '', // Can be filled during creation or by REG command
            pppoeUsername: data.pppoeUsername,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        customers.push(newCustomer);
        saveCustomers(customers);
        return newCustomer;
    },

    updateCustomer(id, data) {
        const customers = loadCustomers();
        const index = customers.findIndex(c => c.id === id);

        if (index === -1) {
            throw new Error('Customer not found');
        }

        // Check duplicate PPPoE if changed
        if (data.pppoeUsername &&
            data.pppoeUsername.toLowerCase() !== customers[index].pppoeUsername.toLowerCase() &&
            customers.some(c => c.pppoeUsername.toLowerCase() === data.pppoeUsername.toLowerCase())) {
            throw new Error('PPPoE Username already exists');
        }

        const updatedCustomer = {
            ...customers[index],
            ...data,
            updatedAt: new Date().toISOString()
        };

        customers[index] = updatedCustomer;
        saveCustomers(customers);
        return updatedCustomer;
    },

    deleteCustomer(id) {
        const customers = loadCustomers();
        const filtered = customers.filter(c => c.id !== id);

        if (filtered.length === customers.length) {
            return false;
        }

        saveCustomers(filtered);
        return true;
    },

    // Cari customer berdasarkan berbagai kriteria (LID, No HP, PPPoE)
    findCustomer(criteria) {
        const customers = loadCustomers();

        // 1. By LID (Priority for Bot)
        if (criteria.lid) {
            return customers.find(c => {
                if (!c.whatsappLid) return false;
                // Check exact match or if stored LID starts with searched LID (followed by @)
                // This handles case where we search by number '628123' and stored is '628123@s.whatsapp.net'
                return c.whatsappLid === criteria.lid ||
                    c.whatsappLid.startsWith(criteria.lid + '@') ||
                    criteria.lid.startsWith(c.whatsappLid + '@');
            });
        }

        // 2. By Phone Number (Clean and partial match)
        if (criteria.phoneNumber) {
            const cleanPhone = criteria.phoneNumber.replace(/\D/g, '');
            // Simple match: check if stored number contains the search number or vice versa
            // Better: Exact match on cleaned numbers
            return customers.find(c => {
                const storedClean = (c.whatsappNumber || '').replace(/\D/g, '');
                return storedClean && (storedClean === cleanPhone || storedClean.endsWith(cleanPhone) || cleanPhone.endsWith(storedClean));
            });
        }

        // 3. By PPPoE Username
        if (criteria.pppoeUsername) {
            return customers.find(c => c.pppoeUsername.toLowerCase() === criteria.pppoeUsername.toLowerCase());
        }

        return null;
    },

    // Logic untuk REG command
    // keyword bisa berupa PPPoE Username atau No HP yang didaftarkan admin
    linkCustomerLid(keyword, lid) {
        const customers = loadCustomers();
        const cleanKeyword = keyword.trim();

        // Cari customer yang cocok dengan keyword
        let customerIndex = customers.findIndex(c =>
            c.pppoeUsername.toLowerCase() === cleanKeyword.toLowerCase() ||
            (c.whatsappNumber && c.whatsappNumber.replace(/\D/g, '') === cleanKeyword.replace(/\D/g, ''))
        );

        if (customerIndex === -1) {
            throw new Error('Data pelanggan tidak ditemukan periksa kembali Username atau Nomer anda.');
        }

        const customer = customers[customerIndex];

        // Cek jika LID sudah digunakan oleh customer LAIN (optional, prevent hijack logic needed?)
        // For now, allow re-register/update

        // Update LID
        customer.whatsappLid = lid;
        customer.updatedAt = new Date().toISOString();

        customers[customerIndex] = customer;
        saveCustomers(customers);

        return customer;
    }
};

module.exports = customerManager;
