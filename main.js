// ============================================================
// EduSafe - Complete Authentication System
// ============================================================

// --- User Database (stored in localStorage) ---
const USERS_KEY = 'edusafe_users';
const SESSION_KEY = 'edusafe_session';

// Get all users from localStorage
function getUsers() {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
}

// Save users to localStorage
function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Get current session
function getSession() {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
}

// Save session
function saveSession(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

// Clear session (logout)
function clearSession() {
    localStorage.removeItem(SESSION_KEY);
}

// Check if user is logged in
function isLoggedIn() {
    return getSession() !== null;
}

// Get current user
function getCurrentUser() {
    return getSession();
}

// ============================================================
// 1. SPLASH PAGE - Auto-login check
// ============================================================
if (document.querySelector('#splashScreen')) {
    const getStartedBtn = document.getElementById('getStartedBtn');
    
    // Check if user is already logged in
    if (isLoggedIn()) {
        const user = getCurrentUser();
        // Auto-redirect to dashboard
        window.location.href = 'dashboard.html';
    } else {
        // User is not logged in, "Get Started" goes to login
        getStartedBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'login.html';
        });
    }
}

// ============================================================
// 2. SIGNUP PAGE
// ============================================================
if (document.querySelector('#signupForm')) {
    const signupForm = document.getElementById('signupForm');
    const nameInput = document.getElementById('signupName');
    const emailInput = document.getElementById('signupEmail');
    const passwordInput = document.getElementById('signupPassword');
    const confirmPasswordInput = document.getElementById('signupConfirmPassword');
    const roleTabs = document.querySelectorAll('.role-tab');
    let selectedRole = 'student';

    // Role tab selection
    roleTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            roleTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            selectedRole = this.dataset.role;
        });
    });

    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const name = nameInput.value.trim();
        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Validation
        if (!name || !email || !password || !confirmPassword) {
            alert('Please fill in all fields');
            return;
        }

        if (password.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        // Check if email already exists
        const users = getUsers();
        if (users.find(u => u.email === email)) {
            alert('An account with this email already exists. Please log in.');
            return;
        }

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            name: name,
            email: email,
            password: password, // In real app, this would be hashed!
            role: selectedRole,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        saveUsers(users);

        // Auto-login the user
        saveSession({
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role
        });

        // Redirect to email confirmation
        window.location.href = 'email-confirm.html';
    });
}

// ============================================================
// 3. LOGIN PAGE
// ============================================================
if (document.querySelector('#loginForm')) {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    const rememberMe = document.getElementById('rememberMe');

    // Check if there's a remembered email
    const rememberedEmail = localStorage.getItem('edusafe_remembered_email');
    if (rememberedEmail) {
        emailInput.value = rememberedEmail;
        rememberMe.checked = true;
    }

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value;

        if (!email || !password) {
            alert('Please enter both email and password');
            return;
        }

        // Find user
        const users = getUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            alert('Invalid email or password. Please try again or create an account.');
            return;
        }

        // Remember me
        if (rememberMe.checked) {
            localStorage.setItem('edusafe_remembered_email', email);
        } else {
            localStorage.removeItem('edusafe_remembered_email');
        }

        // Create session
        saveSession({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        });

        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    });
}

// ============================================================
// 4. DASHBOARD PAGE
// ============================================================
if (document.querySelector('#welcomeMessage')) {
    // Check if user is logged in
    if (!isLoggedIn()) {
        // No session, redirect to splash
        window.location.href = 'splash.html';
    }

    const user = getCurrentUser();
    
    // Update dashboard with user info
    document.getElementById('welcomeMessage').textContent = `Welcome back, ${user.name}`;
    
    // Update role badge
    const roleBadge = document.getElementById('userRole');
    if (roleBadge) {
        const roleMap = {
            'student': 'Student',
            'teacher': 'Teacher',
            'parent': 'Parent'
        };
        roleBadge.textContent = roleMap[user.role] || 'Student';
    }

    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            clearSession();
            window.location.href = 'splash.html';
        });
    }
}

// ============================================================
// 5. EMAIL CONFIRMATION PAGE
// ============================================================
if (document.querySelector('#confirmationEmail')) {
    const user = getCurrentUser();
    if (user) {
        document.getElementById('confirmationEmail').textContent = 
            `We sent a verification link to ${user.email}`;
    } else {
        // If no user, redirect to splash
        window.location.href = 'splash.html';
    }
}

// ============================================================
// 6. PROTECTED PAGES - Redirect if not logged in
// ============================================================
// Add this to any page that requires authentication
const protectedPages = ['dashboard.html', 'email-confirm.html'];
const currentPage = window.location.pathname.split('/').pop();

if (protectedPages.includes(currentPage)) {
    if (!isLoggedIn() && currentPage !== 'splash.html') {
        window.location.href = 'splash.html';
    }
}

console.log('🔐 EduSafe Authentication System Loaded');
console.log('📊 Current Session:', getSession());
console.log('👥 Total Users:', getUsers().length);