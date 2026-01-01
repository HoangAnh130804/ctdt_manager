const DEMO_MODE = true;
const API_BASE_URL = "https://ctdt-manager-backend.onrender.com";

// Main App
class UniversityApp {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        console.log('🎓 University Management System starting...');
        this.checkAuth();
        this.setupEventListeners();
    }

    checkAuth() {
        const token = localStorage.getItem('token');
        if (token) {
            const userData = localStorage.getItem('user');
            if (userData) {
                this.currentUser = JSON.parse(userData);
                this.showDashboard();
            } else {
                this.showLogin();
            }
        } else {
            this.showLogin();
        }
    }

    setupEventListeners() {
        // Event listeners will be added dynamically
    }

    async makeRequest(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const token = localStorage.getItem('token');
        
        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options.headers
        };

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            if (!response.ok) {
                if (response.status === 401) {
                    // Token expired or invalid
                    localStorage.clear();
                    this.showLogin();
                    throw new Error('Phiên đăng nhập đã hết hạn');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request error:', error);
            this.showMessage(error.message || 'Lỗi kết nối server', 'error');
            throw error;
        }
    }

    showLogin() {
        document.getElementById('app').innerHTML = `
            <div class="auth-container">
                <div class="auth-card">
                    <div class="text-center mb-4">
                        <i class="fas fa-university fa-3x text-primary mb-3"></i>
                        <h3>Đăng Nhập Hệ Thống</h3>
                        <p class="text-muted">Quản lý đào tạo đại học</p>
                    </div>
                    
                    <form id="loginForm">
                        <div class="mb-3">
                            <label class="form-label">Tên đăng nhập hoặc Email</label>
                            <input type="text" class="form-control" id="username" 
                                   placeholder="Nhập tên đăng nhập hoặc email" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Mật khẩu</label>
                            <input type="password" class="form-control" id="password" 
                                   placeholder="Nhập mật khẩu" required>
                        </div>
                        
                        <button type="submit" class="btn btn-primary w-100 mb-3">
                            <i class="fas fa-sign-in-alt me-2"></i>Đăng nhập
                        </button>
                        
                        <div class="alert alert-info">
                            <small>
                                <strong>Tài khoản demo:</strong><br>
                                👨‍💼 Admin: admin / admin123<br>
                                👩‍💼 Manager: manager / admin123<br>
                                👤 User: user1 / admin123
                            </small>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Add login form handler
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // 👉 DEMO MODE
    if (DEMO_MODE) {
        const demoUsers = {
            admin: {
                username: 'admin',
                full_name: 'Nguyễn Văn Admin',
                role: 'quản trị viên'
            },
            manager: {
                username: 'manager',
                full_name: 'Trần Thị Quản Lý',
                role: 'quản trị'
            },
            user1: {
                username: 'user1',
                full_name: 'Lê Văn Người Dùng',
                role: 'người dùng'
            }
        };

        if (demoUsers[username] && password === 'admin123') {
            localStorage.setItem('token', 'demo-token');
            localStorage.setItem('user', JSON.stringify(demoUsers[username]));
            this.currentUser = demoUsers[username];
            this.showMessage('Đăng nhập demo thành công!', 'success');
            this.showDashboard();
        } else {
            this.showMessage('Sai tài khoản hoặc mật khẩu demo', 'danger');
        }
        return;
    }

    // 👉 REAL API (sau này dùng)
    try {
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
    } catch (error) {
        this.showMessage('Lỗi đăng nhập', 'danger');
    }
});

    }

    showDashboard() {
        const user = this.currentUser;
        
        document.getElementById('app').innerHTML = `
            <div class="d-flex">
                <!-- Sidebar -->
                <div class="sidebar">
                    <div class="p-4 text-center">
                        <i class="fas fa-user-circle fa-3x mb-3"></i>
                        <h5>${user.full_name}</h5>
                        <small class="text-light">
                            ${user.role === 'admin' ? 'Quản trị viên' : 
                              user.role === 'manager' ? 'Quản lý' : 'Người dùng'}
                        </small>
                    </div>
                    
                    <nav class="nav flex-column px-3">
                        <a href="#" class="nav-link text-white active" onclick="app.showHome()">
                            <i class="fas fa-home me-2"></i>Trang chủ
                        </a>
                        <a href="#" class="nav-link text-white" onclick="app.showCourses()">
                            <i class="fas fa-graduation-cap me-2"></i>Khóa học
                        </a>
                        ${user.role === 'admin' || user.role === 'manager' ? `
                        <a href="#" class="nav-link text-white" onclick="app.showAddCourse()">
                            <i class="fas fa-plus-circle me-2"></i>Thêm khóa học
                        </a>
                        ` : ''}
                        <hr class="text-white-50">
                        <a href="#" class="nav-link text-white" onclick="app.logout()">
                            <i class="fas fa-sign-out-alt me-2"></i>Đăng xuất
                        </a>
                    </nav>
                </div>
                
                <!-- Main Content -->
                <div class="main-content flex-grow-1">
                    <div id="content">
                        <h3 class="mb-4">Chào mừng, ${user.full_name}!</h3>
                        
                        <div class="row">
                            <div class="col-md-4 mb-3">
                                <div class="card bg-primary text-white">
                                    <div class="card-body">
                                        <h5 class="card-title">Tổng khóa học</h5>
                                        <h2 id="totalCourses">0</h2>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4 mb-3">
                                <div class="card bg-success text-white">
                                    <div class="card-body">
                                        <h5 class="card-title">Tổng CTĐT</h5>
                                        <h2 id="totalPrograms">0</h2>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Hoạt động gần đây</h5>
                                <p class="text-muted">Hệ thống đã sẵn sàng sử dụng</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Load dashboard data
        this.loadDashboardData();
    }

    async loadDashboardData() {
        try {
            const result = await this.makeRequest('/dashboard');
            console.log('Dashboard data:', result);
            
            if (result.success && result.data) {
                if (document.getElementById('totalCourses')) {
                    document.getElementById('totalCourses').textContent = result.data.courses ?? 0;
                }
                if (document.getElementById('totalPrograms')) {
                    document.getElementById('totalPrograms').textContent = result.data.programs ?? 0;
                }
                if (document.getElementById('pendingPrograms')) {
                    document.getElementById('pendingPrograms').textContent = result.data.programs ?? 0;
                }
                if (document.getElementById('approvedPrograms')) {
                    document.getElementById('approvedPrograms').textContent = result.data.programs ?? 0;
                }
            }
        } catch (error) {
            console.warn('Dashboard API chưa có, dùng số mặc định');
        
            document.getElementById('totalCourses').textContent = 0;
            document.getElementById('totalPrograms').textContent = 0;
            document.getElementById('pendingPrograms').textContent = 0;
            document.getElementById('approvedPrograms').textContent = 0;
        }
    }

    async showCourses() {
        try {
            const result = await this.makeRequest('/api/courses');
            
            let coursesHTML = '';
            if (result.success && result.data && result.data.length > 0) {
                coursesHTML = result.data.map(course => `
                    <div class="card mb-3">
                        <div class="card-body">
                            <h5 class="card-title">${course.name}</h5>
                            <h6 class="card-subtitle mb-2 text-muted">Mã: ${course.code}</h6>
                            <p class="card-text">${course.description || 'Không có mô tả'}</p>
                            <span class="badge bg-info">${course.type}</span>
                            <span class="badge bg-secondary ms-2">${course.duration} năm</span>
                        </div>
                    </div>
                `).join('');
            } else {
                coursesHTML = '<p class="text-muted">Chưa có khóa học nào</p>';
            }
            
            document.getElementById('content').innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h3>Danh sách khóa học</h3>
                    ${this.currentUser.role === 'admin' || this.currentUser.role === 'manager' ? `
                    <button class="btn btn-primary" onclick="app.showAddCourse()">
                        <i class="fas fa-plus me-2"></i>Thêm khóa học
                    </button>
                    ` : ''}
                </div>
                ${coursesHTML}
            `;
        } catch (error) {
            console.error('Error loading courses:', error);
            this.showMessage('Không thể tải danh sách khóa học', 'error');
        }
    }

    showAddCourse() {
        document.getElementById('content').innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h4 class="mb-0"><i class="fas fa-plus-circle me-2"></i>Thêm khóa học mới</h4>
                </div>
                <div class="card-body">
                    <form id="addCourseForm">
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Mã khóa học *</label>
                                <input type="text" class="form-control" id="courseCode" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Tên khóa học *</label>
                                <input type="text" class="form-control" id="courseName" required>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Loại *</label>
                                <select class="form-select" id="courseType" required>
                                    <option value="">Chọn loại...</option>
                                    <option value="Khóa">Khóa</option>
                                    <option value="Hệ">Hệ</option>
                                    <option value="Ngành học">Ngành học</option>
                                </select>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Thời gian (năm)</label>
                                <input type="number" class="form-control" id="courseDuration" value="4" min="1" max="10">
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label">Mô tả</label>
                            <textarea class="form-control" id="courseDescription" rows="3"></textarea>
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label">Khoa/Phòng</label>
                            <input type="text" class="form-control" id="courseDepartment">
                        </div>
                        
                        <button type="submit" class="btn btn-success">
                            <i class="fas fa-save me-2"></i>Lưu khóa học
                        </button>
                        <button type="button" class="btn btn-secondary ms-2" onclick="app.showCourses()">
                            <i class="fas fa-times me-2"></i>Hủy
                        </button>
                    </form>
                </div>
            </div>
        `;

        // Add form handler
        document.getElementById('addCourseForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const courseData = {
                code: document.getElementById('courseCode').value,
                name: document.getElementById('courseName').value,
                type: document.getElementById('courseType').value,
                duration: parseInt(document.getElementById('courseDuration').value) || 4,
                description: document.getElementById('courseDescription').value,
                department: document.getElementById('courseDepartment').value
            };

            try {
                const result = await this.makeRequest('/api/courses', {
                    method: 'POST',
                    body: JSON.stringify(courseData)
                });

                if (result.success) {
                    this.showMessage('Thêm khóa học thành công!', 'success');
                    setTimeout(() => this.showCourses(), 1000);
                } else {
                    this.showMessage(result.message, 'error');
                }
            } catch (error) {
                this.showMessage('Lỗi khi thêm khóa học', 'error');
            }
        });
    }

    showHome() {
        this.showDashboard();
    }

    logout() {
        if (confirm('Bạn có chắc muốn đăng xuất?')) {
            localStorage.clear();
            this.currentUser = null;
            this.showLogin();
            this.showMessage('Đã đăng xuất thành công', 'info');
        }
    }

    showMessage(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-bg-${type} border-0 position-fixed bottom-0 end-0 m-3`;
        toast.style.zIndex = '9999';
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Show toast
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        // Remove after hide
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }
}

// Initialize app
const app = new UniversityApp();
window.app = app; // Make app globally available
