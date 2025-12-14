const express = require('express');
const router = express.Router();
const customerManager = require('../config/customerManager');

// Middleware Auth
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.authenticated) {
        return next();
    }
    res.redirect('/login');
};

// --- AUTH ROUTES ---

// Login Page
router.get('/login', (req, res) => {
    if (req.session && req.session.authenticated) {
        return res.redirect('/customers');
    }
    res.render('login', { error: null });
});

// Process Login
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Ambil credential dari global appSettings (loaded from session/env)
    const adminUser = global.appSettings.adminUsername;
    const adminPass = global.appSettings.adminPassword;

    if (username === adminUser && password === adminPass) {
        req.session.authenticated = true;
        req.session.user = username;
        res.redirect('/customers');
    } else {
        res.render('login', { error: 'Username atau Password salah!' });
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/login');
    });
});

// --- PROTECTED ROUTES ---

// Redirect root to customers
router.get('/', isAuthenticated, (req, res) => {
    res.redirect('/customers');
});

// List Customers
router.get('/customers', isAuthenticated, (req, res) => {
    try {
        const customers = customerManager.getAllCustomers();
        res.render('customers/index', {
            customers,
            title: 'Daftar Pelanggan',
            error: null,
            success: req.query.success
        });
    } catch (error) {
        res.render('customers/index', {
            customers: [],
            title: 'Daftar Pelanggan',
            error: error.message,
            success: null
        });
    }
});

// Add Customer Form
router.get('/customers/add', isAuthenticated, (req, res) => {
    res.render('customers/form', {
        customer: {},
        title: 'Tambah Pelanggan',
        action: '/customers/add'
    });
});

// Process Add Customer
router.post('/customers/add', isAuthenticated, (req, res) => {
    try {
        const { name, whatsappNumber, pppoeUsername } = req.body;
        customerManager.createCustomer({
            name,
            whatsappNumber,
            pppoeUsername
        });
        res.redirect('/customers?success=Pelanggan berhasil ditambahkan');
    } catch (error) {
        res.render('customers/form', {
            customer: req.body,
            title: 'Tambah Pelanggan',
            action: '/customers/add',
            error: error.message
        });
    }
});

// Edit Customer Form
router.get('/customers/edit/:id', isAuthenticated, (req, res) => {
    try {
        const customer = customerManager.getCustomerById(req.params.id);
        if (!customer) {
            return res.redirect('/customers?error=Pelanggan tidak ditemukan');
        }
        res.render('customers/form', {
            customer,
            title: 'Edit Pelanggan',
            action: `/customers/edit/${req.params.id}`
        });
    } catch (error) {
        res.redirect(`/customers?error=${error.message}`);
    }
});

// Process Edit Customer
router.post('/customers/edit/:id', isAuthenticated, (req, res) => {
    try {
        const { name, whatsappNumber, pppoeUsername } = req.body;
        customerManager.updateCustomer(req.params.id, {
            name,
            whatsappNumber,
            pppoeUsername
        });
        res.redirect('/customers?success=Data pelanggan berhasil diperbarui');
    } catch (error) {
        const customer = req.body;
        customer.id = req.params.id;
        res.render('customers/form', {
            customer,
            title: 'Edit Pelanggan',
            action: `/customers/edit/${req.params.id}`,
            error: error.message
        });
    }
});

// Delete Customer
router.get('/customers/delete/:id', isAuthenticated, (req, res) => {
    try {
        customerManager.deleteCustomer(req.params.id);
        res.redirect('/customers?success=Pelanggan berhasil dihapus');
    } catch (error) {
        res.redirect(`/customers?error=${error.message}`);
    }
});

module.exports = router;
