const DEMO_MODE = false;
const API_BASE_URL = "https://ctdt-manager-backend.onrender.com/api";

class UniversityApp {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        console.log('🎓 University Management System starting...');
        this.checkAuth();
    }

    checkAuth() {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
            this.currentUser = JSON.parse(userData);
            this.showDashboard();
        } else {
            this.showLogin();
        }
    }

    /* ================= API ================= */

    async makeRequest(endpoint, options = {}) {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        };

        try {
            const res = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers
            });

            if (!res.ok) {
                if (res.status === 401) {
                    this.logout(false);
                    throw new Error('Phiên đăng nhập hết hạn');
                }
                throw new Error(`HTTP ${res.status}`);
            }

            return await res.json();
        } catch (err) {
            console.error(err);
            this.showMessage('Lỗi kết nối server', 'danger');
            throw err;
        }
    }

    /* ================= AUTH ================= */

    showLogin() {
        document.getElementById('app').innerHTML = `
        <div class="auth-container">
            <div class="auth-card">
                <h3 class="text-center mb-4">Đăng nhập hệ thống</h3>
                <form id="loginForm">
                    <input class="form-control mb-3" id="username" placeholder="Username" required />
                    <input type="password" class="form-control mb-3" id="password" placeholder="Password" required />
                    <button class="btn btn-primary w-100">Đăng nhập</button>
                </form>
            </div>
        </div>
        `;

        document.getElementById('loginForm').addEventListener('submit', e => {
            e.preventDefault();
            this.handleLogin();
        });
    }

    async handleLogin() {
        const username = usernameInput();
        const password = passwordInput();

        if (DEMO_MODE) {
            const demoUsers = {
                admin: { username: 'admin', full_name: 'Nguyễn Văn Admin', role: 'admin' },
                manager: { username: 'manager', full_name: 'Trần Thị Quản Lý', role: 'manager' },
                user1: { username: 'user1', full_name: 'Lê Văn Người Dùng', role: 'user' }
            };

            if (demoUsers[username] && password === 'admin123') {
                localStorage.setItem('token', 'demo-token');
                localStorage.setItem('user', JSON.stringify(demoUsers[username]));
                this.currentUser = demoUsers[username];
                this.showDashboard();
                return;
            }
            return this.showMessage('Sai tài khoản demo', 'danger');
        }

        const result = await this.makeRequest('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });

        if (result.success) {
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
            this.currentUser = result.user;
            this.showDashboard();
        } else {
            this.showMessage(result.message, 'danger');
        }
    }

    /* ================= DASHBOARD ================= */

    showDashboard() {
        const user = this.currentUser;

        document.getElementById('app').innerHTML = `
        <div class="d-flex">
            <div class="sidebar">
                <h5 class="text-center mt-3">${user.full_name}</h5>
                <nav class="nav flex-column p-3">
                    <a class="nav-link" onclick="app.showDashboard()">Trang chủ</a>
                    <a class="nav-link" onclick="app.showCourses()">Khóa/Hệ/Ngành học</a>
                    ${(user.role === 'admin' || user.role === 'manager')
                        ? `<a class="nav-link" onclick="app.showAddCourse()">Thêm Ngành học</a>`
                        : ''}
                    <hr>
                    <a class="nav-link text-danger" onclick="app.logout()">Đăng xuất</a>
                </nav>
            </div>

            <div class="main-content p-4 flex-grow-1">
                <h3>Chào mừng ${user.full_name}</h3>
                <div class="row mt-4">
                    <div class="col-md-4">
                        <div class="card p-3">
                            <h5>Tổng khóa học</h5>
                            <h2 id="totalCourses">0</h2>
                        </div>
                    </div>
                </div>
                <div id="content" class="mt-4"></div>
            </div>
        </div>
        `;

        this.loadDashboardData();
    }

    async loadDashboardData() {
        try {
            const res = await this.makeRequest('/api/courses');
            document.getElementById('totalCourses').textContent = res?.data?.length || 0;
        } catch {
            document.getElementById('totalCourses').textContent = 0;
        }
    }

    /* ================= COURSES ================= */

    async showCourses() {
        const res = await this.makeRequest('/api/courses');
        const html = (res.data || []).map(c => `
            <div class="card mb-3 p-3">
                <h5>${c.name}</h5>
                <small>${c.code}</small>
            </div>
        `).join('');

        document.getElementById('content').innerHTML = html || 'Chưa có khóa học';
    }

    showAddCourse() {
        document.getElementById('content').innerHTML = `
        <form id="courseForm">
            <input class="form-control mb-2" id="code" placeholder="Mã ngành học" required />
            <input class="form-control mb-2" id="name" placeholder="Tên ngành học" required />
            <button class="btn btn-success">Lưu</button>
        </form>
        `;

        document.getElementById('courseForm').addEventListener('submit', async e => {
            e.preventDefault();
            await this.makeRequest('/api/courses', {
                method: 'POST',
                body: JSON.stringify({
                    code: codeInput(),
                    name: nameInput()
                })
            });
            this.showCourses();
        });
    }

    /* ================= UTIL ================= */

    logout(confirmAsk = true) {
        if (!confirmAsk || confirm('Bạn chắc chắn muốn đăng xuất?')) {
            localStorage.clear();
            this.currentUser = null;
            this.showLogin();
        }
    }

    showMessage(msg, type = 'info') {
        alert(msg);
    }
}

/* ================= HELPERS ================= */

const usernameInput = () => document.getElementById('username')?.value;
const passwordInput = () => document.getElementById('password')?.value;
const codeInput = () => document.getElementById('code')?.value;
const nameInput = () => document.getElementById('name')?.value;

/* ================= START ================= */

const app = new UniversityApp();
window.app = app;
