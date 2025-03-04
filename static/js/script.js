// Variables globales
let currentUser = null;
let courses = [];
let teachers = [];
let students = [];
let payments = [];
let pendingRegistrations = [];

// Inicialización de datos de ejemplo
window.mockData = {
    students: [
        {
            nombre: 'Juan Pérez',
            dni: '12345678',
            curso: '1° A',
            responsable: 'María Pérez',
            telefono: '123-456-7890',
            estado: 'active'
        },
        {
            nombre: 'Ana García',
            dni: '87654321',
            curso: '2° B',
            responsable: 'Carlos García',
            telefono: '098-765-4321',
            estado: 'active'
        }
    ],
    teachers: [
        {
            id: 1,
            nombre: 'Prof. María López',
            materia: 'Matemáticas',
            cursos: '1° A, 2° B',
            telefono: '111-222-3333',
            email: 'maria.lopez@instituto.com',
            estado: 'active'
        },
        {
            id: 2,
            nombre: 'Prof. Juan Martínez',
            materia: 'Lengua',
            cursos: '1° B, 2° A',
            telefono: '444-555-6666',
            email: 'juan.martinez@instituto.com',
            estado: 'active'
        }
    ],
    payments: [
        {
            id: 1,
            fecha: '2024-03-01',
            alumno: 'Juan Pérez',
            concepto: 'Matrícula',
            monto: 5000,
            estado: 'pagado',
            metodoPago: 'Transferencia'
        },
        {
            id: 2,
            fecha: '2024-03-15',
            alumno: 'Ana García',
            concepto: 'Matrícula',
            monto: 5000,
            estado: 'pendiente',
            metodoPago: 'Efectivo'
        }
    ],
    systemUsers: [
        {
            id: 1,
            nombre: 'Administrador',
            email: 'admin@instituto.com',
            password: 'admin123',
            rol: 'admin',
            estado: 'active',
            ultimoAcceso: '2024-03-20 10:30'
        }
    ],
    pendingRegistrations: []
};

// Funciones de inicialización
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar modales
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        new bootstrap.Modal(modal);
    });

    // Event listeners para la gestión de cursos
    document.getElementById('manageCoursesBtn').addEventListener('click', showCoursesModal);
    document.getElementById('addCourseBtn').addEventListener('click', showAddCourseModal);
    document.getElementById('saveCourseBtn').addEventListener('click', saveCourse);

    // Cargar datos iniciales
    loadCourses();
});

// Funciones de autenticación
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Buscar usuario
    const user = window.mockData.systemUsers.find(u => u.email === email && u.password === password);
    
    if (user) {
        if (user.estado === 'active') {
            currentUser = user;
            document.getElementById('loginScreen').classList.add('d-none');
            document.getElementById('mainApp').classList.remove('d-none');
            document.getElementById('currentUser').textContent = user.nombre;
            
            // Mostrar/ocultar elementos según el rol
            const adminElements = document.querySelectorAll('.admin-only');
            adminElements.forEach(el => {
                el.classList.toggle('d-none', currentUser.rol !== 'admin');
            });

            // Si es administrador, cargar solicitudes pendientes
            if (currentUser.rol === 'admin') {
                loadPendingRegistrations();
            }

            // Cargar datos iniciales
            loadCourses();
        } else {
            alert('Su cuenta está inactiva. Por favor, contacte al administrador.');
        }
    } else {
        // Verificar si hay una solicitud pendiente
        const pendingRequest = window.mockData.pendingRegistrations.find(r => r.email === email);
        if (pendingRequest) {
            alert('Su solicitud de registro está pendiente de aprobación. Por favor, espere la notificación por correo electrónico.');
        } else {
            alert('Correo electrónico o contraseña incorrectos');
        }
    }
});

// Recuperación de contraseña
document.getElementById('forgotPassword').addEventListener('click', function(e) {
    e.preventDefault();
    const modal = new bootstrap.Modal(document.getElementById('recoverPasswordModal'));
    modal.show();
});

document.getElementById('sendRecoveryBtn').addEventListener('click', function() {
    const email = document.getElementById('recoverEmail').value;
    const user = window.mockData.systemUsers.find(u => u.email === email);
    
    if (user) {
        // Generar nueva contraseña aleatoria
        const newPassword = Math.random().toString(36).slice(-8);
        user.password = newPassword;
        
        // Simular envío de correo (en un sistema real, aquí se enviaría un correo)
        alert(`Se ha generado una nueva contraseña para ${user.nombre}:\n${newPassword}\n\nPor favor, cámbiela al iniciar sesión.`);
        
        bootstrap.Modal.getInstance(document.getElementById('recoverPasswordModal')).hide();
        document.getElementById('recoverPasswordForm').reset();
    } else {
        alert('No se encontró ningún usuario con ese correo electrónico');
    }
});

// Navegación
document.querySelectorAll('.nav-link[data-page]').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const pageId = this.getAttribute('data-page');
        
        // Actualizar navegación activa
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
        
        // Mostrar página seleccionada
        document.querySelectorAll('.content-page').forEach(page => {
            page.classList.add('d-none');
        });
        document.getElementById(pageId).classList.remove('d-none');
    });
});

// Cerrar sesión
document.getElementById('logoutBtn').addEventListener('click', function() {
    currentUser = null;
    document.getElementById('mainApp').classList.add('d-none');
    document.getElementById('loginScreen').classList.remove('d-none');
});

// Funciones para la gestión de cursos
function loadCourses() {
    // Simular carga de cursos desde una API
    courses = [
        { id: 1, name: '1° A', level: 'básico', capacity: 30, status: 'active' },
        { id: 2, name: '1° B', level: 'básico', capacity: 30, status: 'active' },
        { id: 3, name: '2° A', level: 'intermedio', capacity: 30, status: 'active' },
        { id: 4, name: '2° B', level: 'intermedio', capacity: 30, status: 'active' },
        { id: 5, name: '3° A', level: 'avanzado', capacity: 30, status: 'active' },
        { id: 6, name: '3° B', level: 'avanzado', capacity: 30, status: 'active' }
    ];
    updateCoursesTable();
    updateCourseSelects();
}

function showCoursesModal() {
    const coursesModal = new bootstrap.Modal(document.getElementById('coursesModal'));
    coursesModal.show();
}

function showAddCourseModal() {
    document.getElementById('courseModalTitle').textContent = 'Nuevo Curso';
    document.getElementById('courseForm').reset();
    document.getElementById('courseId').value = '';
    const courseModal = new bootstrap.Modal(document.getElementById('courseModal'));
    courseModal.show();
}

function showEditCourseModal(courseId) {
    const course = courses.find(c => c.id === courseId);
    if (course) {
        document.getElementById('courseModalTitle').textContent = 'Editar Curso';
        document.getElementById('courseId').value = course.id;
        document.getElementById('courseName').value = course.name;
        document.getElementById('courseLevel').value = course.level;
        document.getElementById('courseCapacity').value = course.capacity;
        document.getElementById('courseStatus').value = course.status;
        const courseModal = new bootstrap.Modal(document.getElementById('courseModal'));
        courseModal.show();
    }
}

function saveCourse() {
    const courseId = document.getElementById('courseId').value;
    const courseData = {
        name: document.getElementById('courseName').value,
        level: document.getElementById('courseLevel').value,
        capacity: parseInt(document.getElementById('courseCapacity').value),
        status: document.getElementById('courseStatus').value
    };

    if (courseId) {
        // Actualizar curso existente
        const index = courses.findIndex(c => c.id === parseInt(courseId));
        if (index !== -1) {
            courses[index] = { ...courses[index], ...courseData };
        }
    } else {
        // Crear nuevo curso
        const newId = Math.max(...courses.map(c => c.id), 0) + 1;
        courses.push({ id: newId, ...courseData });
    }

    updateCoursesTable();
    updateCourseSelects();
    
    // Cerrar modal
    const courseModal = bootstrap.Modal.getInstance(document.getElementById('courseModal'));
    courseModal.hide();
}

function deleteCourse(courseId) {
    if (confirm('¿Está seguro de que desea eliminar este curso?')) {
        courses = courses.filter(c => c.id !== courseId);
        updateCoursesTable();
        updateCourseSelects();
    }
}

function updateCoursesTable() {
    const tbody = document.getElementById('coursesTable');
    tbody.innerHTML = '';

    courses.forEach(course => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${course.name}</td>
            <td>${course.level}</td>
            <td>${course.capacity}</td>
            <td>
                <span class="badge ${course.status === 'active' ? 'bg-success' : 'bg-danger'}">
                    ${course.status === 'active' ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-primary me-1" onclick="showEditCourseModal(${course.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteCourse(${course.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function updateCourseSelects() {
    // Actualizar select de filtro de docentes
    const teacherFilter = document.getElementById('teacherMatterFilter');
    teacherFilter.innerHTML = '<option value="">Todos los cursos</option>';
    courses.forEach(course => {
        teacherFilter.innerHTML += `<option value="${course.id}">${course.name}</option>`;
    });

    // Actualizar select de filtro de estudiantes
    const studentFilter = document.getElementById('studentCourseFilter');
    studentFilter.innerHTML = '<option value="">Todos los cursos</option>';
    courses.forEach(course => {
        studentFilter.innerHTML += `<option value="${course.id}">${course.name}</option>`;
    });

    // Actualizar select de curso en el modal de estudiantes
    const studentCourse = document.getElementById('studentCourse');
    studentCourse.innerHTML = '<option value="">Seleccionar curso...</option>';
    courses.forEach(course => {
        studentCourse.innerHTML += `<option value="${course.id}">${course.name}</option>`;
    });
}

// Funciones globales para manejo de usuarios
function editUser(id) {
    const user = window.mockData.systemUsers.find(u => u.id === id);
    if (user) {
        document.getElementById('userModalTitle').textContent = 'Editar Usuario';
        document.getElementById('userId').value = user.id;
        document.getElementById('userName').value = user.nombre;
        document.getElementById('userUsername').value = user.email;
        document.getElementById('userEmail').value = user.email;
        document.getElementById('userRole').value = user.rol;
        document.getElementById('userStatus').value = user.estado;
        
        // Limpiar campos de contraseña
        document.getElementById('userPassword').value = '';
        document.getElementById('userConfirmPassword').value = '';
        
        const modal = new bootstrap.Modal(document.getElementById('userModal'));
        modal.show();
    }
}

function resetPassword(id) {
    const user = window.mockData.systemUsers.find(u => u.id === id);
    if (user) {
        if (confirm('¿Está seguro de restablecer la contraseña de ' + user.nombre + '?')) {
            // Generar una contraseña aleatoria
            const newPassword = Math.random().toString(36).slice(-8);
            user.password = newPassword;
            alert('Contraseña restablecida para: ' + user.nombre + '\nNueva contraseña: ' + newPassword);
        }
    }
}

function deleteUser(id) {
    if (confirm('¿Está seguro de eliminar este usuario?')) {
        window.mockData.systemUsers = window.mockData.systemUsers.filter(u => u.id !== id);
        loadUsers();
    }
}

// Funciones globales para manejo de docentes
function editTeacher(id) {
    const teacher = window.mockData.teachers.find(t => t.id === id);
    if (teacher) {
        document.getElementById('teacherModalTitle').textContent = 'Editar Docente';
        document.getElementById('teacherId').value = teacher.id;
        document.getElementById('teacherName').value = teacher.nombre;
        document.getElementById('teacherMatter').value = teacher.materia;
        document.getElementById('teacherCourses').value = teacher.cursos;
        document.getElementById('teacherPhone').value = teacher.telefono;
        document.getElementById('teacherEmail').value = teacher.email;
        
        const modal = new bootstrap.Modal(document.getElementById('teacherModal'));
        modal.show();
    }
}

function deleteTeacher(id) {
    if (confirm('¿Está seguro de eliminar este docente?')) {
        window.mockData.teachers = window.mockData.teachers.filter(t => t.id !== id);
        loadTeachers();
        updateDashboard();
    }
}

// Funciones globales para manejo de alumnos
function editStudent(dni) {
    // Verificar que el modal existe
    const modalElement = document.getElementById('studentModal');
    if (!modalElement) {
        console.error('El modal de estudiante no existe en el DOM');
        return;
    }

    // Verificar que todos los elementos necesarios existen
    const elements = {
        title: document.getElementById('studentModalTitle'),
        id: document.getElementById('studentId'),
        name: document.getElementById('studentName'),
        dni: document.getElementById('studentDni'),
        course: document.getElementById('studentCourse'),
        responsible: document.getElementById('studentResponsible'),
        phone: document.getElementById('studentPhone')
    };

    // Verificar si algún elemento no existe
    for (const [key, element] of Object.entries(elements)) {
        if (!element) {
            console.error(`El elemento ${key} no existe en el DOM`);
            return;
        }
    }

    // Buscar el estudiante
    const student = window.mockData.students.find(s => s.dni === dni);
    if (!student) {
        console.error('No se encontró el estudiante');
        return;
    }

    // Si todos los elementos existen, proceder con la edición
    elements.title.textContent = 'Editar Alumno';
    elements.id.value = student.dni;
    elements.name.value = student.nombre;
    elements.dni.value = student.dni;
    elements.course.value = student.curso;
    elements.responsible.value = student.responsable;
    elements.phone.value = student.telefono;
    
    // Crear una nueva instancia del modal
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
}

function deleteStudent(dni) {
    if (confirm('¿Está seguro de eliminar este alumno?')) {
        window.mockData.students = window.mockData.students.filter(s => s.dni !== dni);
        loadStudents();
        updateDashboard();
    }
}

// Funciones globales para manejo de pagos
function editPayment(id) {
    const payment = window.mockData.payments.find(p => p.id === id);
    if (payment) {
        document.getElementById('paymentModalTitle').textContent = 'Editar Pago';
        document.getElementById('paymentId').value = payment.id;
        
        // Cargar lista de alumnos en el select
        const studentSelect = document.getElementById('paymentStudent');
        studentSelect.innerHTML = '<option value="">Seleccionar alumno...</option>';
        window.mockData.students.forEach(student => {
            const option = document.createElement('option');
            option.value = student.nombre;
            option.textContent = student.nombre;
            if (student.nombre === payment.alumno) {
                option.selected = true;
            }
            studentSelect.appendChild(option);
        });
        
        document.getElementById('paymentConcept').value = payment.concepto;
        document.getElementById('paymentAmount').value = payment.monto;
        document.getElementById('paymentStatus').value = payment.estado;
        document.getElementById('paymentMethod').value = payment.metodoPago;
        
        const modal = new bootstrap.Modal(document.getElementById('paymentModal'));
        modal.show();
    }
}

function deletePayment(id) {
    if (confirm('¿Está seguro de eliminar este pago?')) {
        window.mockData.payments = window.mockData.payments.filter(p => p.id !== id);
        loadPayments();
        updateDashboard();
    }
}

function printReceipt(id) {
    const payment = window.mockData.payments.find(p => p.id === id);
    if (payment) {
        // Buscar datos completos del estudiante
        const student = window.mockData.students.find(s => s.nombre === payment.alumno);
        
        // Generar número de recibo único
        const receiptNumber = `REC-${String(payment.id).padStart(6, '0')}`;
        
        // Actualizar contenido del recibo
        document.getElementById('receiptNumber').textContent = receiptNumber;
        document.getElementById('receiptDate').textContent = new Date().toLocaleDateString('es-ES');
        
        // Datos del estudiante
        if (student) {
            document.getElementById('receiptStudent').innerHTML = `
                <div class="student-info">
                    <p><strong>Nombre y Apellido:</strong> ${student.nombre}</p>
                    <p><strong>Curso:</strong> ${student.curso}</p>
                </div>
            `;
        } else {
            document.getElementById('receiptStudent').innerHTML = `
                <div class="student-info">
                    <p><strong>Nombre y Apellido:</strong> ${payment.alumno}</p>
                </div>
            `;
        }
        
        document.getElementById('receiptConcept').textContent = payment.concepto;
        document.getElementById('receiptAmount').textContent = `$${payment.monto.toLocaleString('es-ES')}`;
        document.getElementById('receiptTotal').textContent = `$${payment.monto.toLocaleString('es-ES')}`;
        document.getElementById('receiptMethod').textContent = payment.metodoPago;
        
        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('receiptModal'));
        modal.show();
    }
}

// Funciones para cargar datos
function updateDashboard() {
    // Datos de ejemplo
    document.getElementById('totalStudents').textContent = window.mockData.students.length;
    document.getElementById('totalTeachers').textContent = window.mockData.teachers.length;
    
    const pagosDelMes = window.mockData.payments.filter(p => p.estado === 'pagado').reduce((sum, p) => sum + p.monto, 0);
    document.getElementById('monthlyPayments').textContent = `$${pagosDelMes.toLocaleString()}`;
    
    const pendientes = window.mockData.payments.filter(p => p.estado === 'pendiente').length;
    document.getElementById('pendingPayments').textContent = pendientes;

    // Remover eventos anteriores
    document.querySelectorAll('.dashboard-card').forEach(card => {
        const newCard = card.cloneNode(true);
        card.parentNode.replaceChild(newCard, card);
    });

    // Agregar eventos click a las tarjetas
    document.querySelectorAll('.dashboard-card').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            showDetailsModal(type);
        });
    });
}

function showDetailsModal(type) {
    // Eliminar modal existente si hay uno
    const existingModal = document.getElementById('detailsModal');
    if (existingModal) {
        existingModal.remove();
    }

    let title = '';
    let content = '';
    
    switch(type) {
        case 'students':
            title = 'Lista de Alumnos';
            content = `
                <table class="table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Curso</th>
                            <th>Responsable</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${window.mockData.students.map(s => `
                            <tr>
                                <td>${s.nombre}</td>
                                <td>${s.curso}</td>
                                <td>${s.responsable}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            break;
        case 'teachers':
            title = 'Lista de Docentes';
            content = `
                <table class="table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Materia</th>
                            <th>Cursos</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${window.mockData.teachers.map(t => `
                            <tr>
                                <td>${t.nombre}</td>
                                <td>${t.materia}</td>
                                <td>${t.cursos}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            break;
        case 'payments':
            title = 'Pagos del Mes';
            content = `
                <table class="table">
                    <thead>
                        <tr>
                            <th>Alumno</th>
                            <th>Concepto</th>
                            <th>Monto</th>
                            <th>Fecha</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${window.mockData.payments.filter(p => p.estado === 'pagado').map(p => `
                            <tr>
                                <td>${p.alumno}</td>
                                <td>${p.concepto}</td>
                                <td>$${p.monto.toLocaleString()}</td>
                                <td>${p.fecha}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            break;
        case 'pending':
            title = 'Pagos Pendientes';
            content = `
                <table class="table">
                    <thead>
                        <tr>
                            <th>Alumno</th>
                            <th>Concepto</th>
                            <th>Monto</th>
                            <th>Fecha</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${window.mockData.payments.filter(p => p.estado === 'pendiente').map(p => `
                            <tr>
                                <td>${p.alumno}</td>
                                <td>${p.concepto}</td>
                                <td>$${p.monto.toLocaleString()}</td>
                                <td>${p.fecha}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            break;
    }

    // Crear y mostrar el modal
    const modalHtml = `
        <div class="modal fade" id="detailsModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Agregar nuevo modal
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('detailsModal'));
    modal.show();
}

function loadStudents() {
    const tbody = document.getElementById('studentsTable');
    if (!tbody) return; // Si no existe la tabla, salimos de la función
    
    tbody.innerHTML = '';
    
    window.mockData.students.forEach(student => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${student.nombre}</td>
            <td>${student.dni}</td>
            <td>${student.curso}</td>
            <td>${student.responsable}</td>
            <td>${student.telefono}</td>
            <td>
                <button class="btn btn-sm btn-primary me-1" onclick="editStudent('${student.dni}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteStudent('${student.dni}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Agregar evento de búsqueda solo si los elementos existen
    const searchInput = document.getElementById('studentSearch');
    const searchButton = document.getElementById('searchStudentBtn');

    if (searchButton) {
        searchButton.addEventListener('click', function() {
            filterStudents();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                filterStudents();
            }
        });
    }
}

function filterStudents() {
    const searchTerm = document.getElementById('studentSearch').value.toLowerCase();
    const courseFilter = document.getElementById('studentCourseFilter').value;
    const statusFilter = document.getElementById('studentStatusFilter').value;

    const filteredStudents = window.mockData.students.filter(student => {
        const matchesSearch = student.nombre.toLowerCase().includes(searchTerm) ||
                            student.dni.toLowerCase().includes(searchTerm);
        const matchesCourse = !courseFilter || student.curso === courseFilter;
        const matchesStatus = !statusFilter || student.estado === statusFilter;
        return matchesSearch && matchesCourse && matchesStatus;
    });

    const tbody = document.getElementById('studentsTable');
    tbody.innerHTML = '';
    
    if (filteredStudents.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">No se encontraron alumnos que coincidan con la búsqueda</td>
            </tr>
        `;
        return;
    }

    filteredStudents.forEach(student => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${student.nombre}</td>
            <td>${student.dni}</td>
            <td>${student.curso}</td>
            <td>${student.responsable}</td>
            <td>${student.telefono}</td>
            <td>
                <button class="btn btn-sm btn-primary me-1" onclick="editStudent('${student.dni}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteStudent('${student.dni}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function loadTeachers() {
    const tbody = document.getElementById('teachersTable');
    tbody.innerHTML = '';
    
    // Cargar materias únicas en el filtro
    const materias = [...new Set(window.mockData.teachers.map(t => t.materia))];
    const matterFilter = document.getElementById('teacherMatterFilter');
    materias.forEach(materia => {
        const option = document.createElement('option');
        option.value = materia;
        option.textContent = materia;
        matterFilter.appendChild(option);
    });
    
    window.mockData.teachers.forEach(teacher => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${teacher.nombre}</td>
            <td>${teacher.materia}</td>
            <td>${teacher.cursos}</td>
            <td>${teacher.telefono}</td>
            <td>${teacher.email}</td>
            <td>
                <button class="btn btn-sm btn-primary me-1" onclick="editTeacher(${teacher.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteTeacher(${teacher.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Agregar eventos de filtrado
    document.getElementById('teacherSearch').addEventListener('input', filterTeachers);
    document.getElementById('teacherMatterFilter').addEventListener('change', filterTeachers);
    document.getElementById('teacherStatusFilter').addEventListener('change', filterTeachers);
}

function filterTeachers() {
    const searchTerm = document.getElementById('teacherSearch').value.toLowerCase();
    const materia = document.getElementById('teacherMatterFilter').value;
    const estado = document.getElementById('teacherStatusFilter').value;

    const filteredTeachers = window.mockData.teachers.filter(teacher => {
        const matchesSearch = teacher.nombre.toLowerCase().includes(searchTerm) ||
                            teacher.materia.toLowerCase().includes(searchTerm);
        const matchesMateria = !materia || teacher.materia === materia;
        const matchesEstado = !estado || teacher.estado === estado;
        return matchesSearch && matchesMateria && matchesEstado;
    });

    const tbody = document.getElementById('teachersTable');
    tbody.innerHTML = '';
    
    filteredTeachers.forEach(teacher => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${teacher.nombre}</td>
            <td>${teacher.materia}</td>
            <td>${teacher.cursos}</td>
            <td>${teacher.telefono}</td>
            <td>${teacher.email}</td>
            <td>
                <button class="btn btn-sm btn-primary me-1" onclick="editTeacher(${teacher.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteTeacher(${teacher.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function loadPayments() {
    const tbody = document.getElementById('paymentsTable');
    tbody.innerHTML = '';
    
    window.mockData.payments.forEach(payment => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${payment.fecha}</td>
            <td>${payment.alumno}</td>
            <td>${payment.concepto}</td>
            <td>$${payment.monto.toLocaleString()}</td>
            <td><span class="badge bg-${getStatusColor(payment.estado)}">${payment.estado}</span></td>
            <td>${payment.metodoPago}</td>
            <td>
                <button class="btn btn-sm btn-primary me-1" onclick="editPayment(${payment.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-success me-1" onclick="printReceipt(${payment.id})">
                    <i class="fas fa-print"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deletePayment(${payment.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Agregar eventos de filtrado
    document.getElementById('paymentSearch').addEventListener('input', filterPayments);
    document.getElementById('paymentStatusFilter').addEventListener('change', filterPayments);
    document.getElementById('paymentDateFilter').addEventListener('change', filterPayments);
    document.getElementById('paymentMonthFilter').addEventListener('change', filterPayments);
}

function filterPayments() {
    const searchTerm = document.getElementById('paymentSearch').value.toLowerCase();
    const status = document.getElementById('paymentStatusFilter').value;
    const date = document.getElementById('paymentDateFilter').value;
    const month = document.getElementById('paymentMonthFilter').value;

    const filteredPayments = window.mockData.payments.filter(payment => {
        const matchesSearch = payment.alumno.toLowerCase().includes(searchTerm);
        const matchesStatus = !status || payment.estado === status;
        const matchesDate = !date || payment.fecha === date;
        const matchesMonth = !month || payment.fecha.startsWith(month);
        return matchesSearch && matchesStatus && matchesDate && matchesMonth;
    });

    const tbody = document.getElementById('paymentsTable');
    tbody.innerHTML = '';
    
    if (filteredPayments.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">No se encontraron pagos que coincidan con la búsqueda</td>
            </tr>
        `;
        return;
    }

    filteredPayments.forEach(payment => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${payment.fecha}</td>
            <td>${payment.alumno}</td>
            <td>${payment.concepto}</td>
            <td>$${payment.monto.toLocaleString()}</td>
            <td><span class="badge bg-${getStatusColor(payment.estado)}">${payment.estado}</span></td>
            <td>${payment.metodoPago}</td>
            <td>
                <button class="btn btn-sm btn-primary me-1" onclick="editPayment(${payment.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-success me-1" onclick="printReceipt(${payment.id})">
                    <i class="fas fa-print"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deletePayment(${payment.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function loadUsers() {
    const tbody = document.getElementById('usersTable');
    tbody.innerHTML = '';
    
    window.mockData.systemUsers.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.nombre}</td>
            <td>${user.email}</td>
            <td>${user.rol}</td>
            <td>${user.email}</td>
            <td><span class="badge bg-${user.estado === 'active' ? 'success' : 'danger'}">${user.estado}</span></td>
            <td>${user.ultimoAcceso}</td>
            <td>
                <button class="btn btn-sm btn-primary me-1" onclick="editUser(${user.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-warning me-1" onclick="resetPassword(${user.id})">
                    <i class="fas fa-key"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Agregar eventos de filtrado
    document.getElementById('userSearch').addEventListener('input', filterUsers);
    document.getElementById('userRoleFilter').addEventListener('change', filterUsers);
    document.getElementById('userStatusFilter').addEventListener('change', filterUsers);
}

function filterUsers() {
    const searchTerm = document.getElementById('userSearch').value.toLowerCase();
    const rol = document.getElementById('userRoleFilter').value;
    const estado = document.getElementById('userStatusFilter').value;

    const filteredUsers = window.mockData.systemUsers.filter(user => {
        const matchesSearch = user.nombre.toLowerCase().includes(searchTerm) ||
                            user.email.toLowerCase().includes(searchTerm);
        const matchesRol = !rol || user.rol === rol;
        const matchesEstado = !estado || user.estado === estado;
        return matchesSearch && matchesRol && matchesEstado;
    });

    const tbody = document.getElementById('usersTable');
    tbody.innerHTML = '';
    
    filteredUsers.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.nombre}</td>
            <td>${user.email}</td>
            <td>${user.rol}</td>
            <td>${user.email}</td>
            <td><span class="badge bg-${user.estado === 'active' ? 'success' : 'danger'}">${user.estado}</span></td>
            <td>${user.ultimoAcceso}</td>
            <td>
                <button class="btn btn-sm btn-primary me-1" onclick="editUser(${user.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-warning me-1" onclick="resetPassword(${user.id})">
                    <i class="fas fa-key"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function getStatusColor(status) {
    switch(status) {
        case 'pagado': return 'success';
        case 'pendiente': return 'warning';
        case 'vencido': return 'danger';
        default: return 'secondary';
    }
}

// Eventos para botones de agregar
document.getElementById('addTeacherBtn').addEventListener('click', function() {
    document.getElementById('teacherModalTitle').textContent = 'Nuevo Docente';
    document.getElementById('teacherForm').reset();
    document.getElementById('teacherId').value = '';
    
    const modal = new bootstrap.Modal(document.getElementById('teacherModal'));
    modal.show();
});

document.getElementById('addPaymentBtn').addEventListener('click', function() {
    document.getElementById('paymentModalTitle').textContent = 'Nuevo Pago';
    document.getElementById('paymentForm').reset();
    document.getElementById('paymentId').value = '';
    
    // Establecer la fecha actual como valor predeterminado
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('paymentDate').value = today;
    
    // Cargar lista de alumnos en el select
    const studentSelect = document.getElementById('paymentStudent');
    studentSelect.innerHTML = '<option value="">Seleccionar alumno...</option>';
    window.mockData.students.forEach(student => {
        const option = document.createElement('option');
        option.value = student.nombre;
        option.textContent = student.nombre;
        studentSelect.appendChild(option);
    });
    
    const modal = new bootstrap.Modal(document.getElementById('paymentModal'));
    modal.show();
});

document.getElementById('addUserBtn').addEventListener('click', function() {
    document.getElementById('userModalTitle').textContent = 'Nuevo Usuario';
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    
    const modal = new bootstrap.Modal(document.getElementById('userModal'));
    modal.show();
});

// Eventos para guardar en modales
document.getElementById('saveTeacherBtn').addEventListener('click', function() {
    const id = document.getElementById('teacherId').value;
    const teacherData = {
        nombre: document.getElementById('teacherName').value,
        materia: document.getElementById('teacherMatter').value,
        cursos: document.getElementById('teacherCourses').value,
        telefono: document.getElementById('teacherPhone').value,
        email: document.getElementById('teacherEmail').value,
        estado: 'active'
    };

    if (id) {
        // Editar docente existente
        const index = window.mockData.teachers.findIndex(t => t.id === parseInt(id));
        if (index !== -1) {
            window.mockData.teachers[index] = { ...window.mockData.teachers[index], ...teacherData };
        }
    } else {
        // Agregar nuevo docente
        teacherData.id = window.mockData.teachers.length + 1;
        window.mockData.teachers.push(teacherData);
    }

    bootstrap.Modal.getInstance(document.getElementById('teacherModal')).hide();
    loadTeachers();
    updateDashboard();
});

document.getElementById('savePaymentBtn').addEventListener('click', function() {
    const id = document.getElementById('paymentId').value;
    const paymentData = {
        alumno: document.getElementById('paymentStudent').value,
        fecha: document.getElementById('paymentDate').value,
        concepto: document.getElementById('paymentConcept').value,
        monto: parseFloat(document.getElementById('paymentAmount').value),
        estado: document.getElementById('paymentStatus').value,
        metodoPago: document.getElementById('paymentMethod').value
    };

    if (id) {
        // Editar pago existente
        const index = window.mockData.payments.findIndex(p => p.id === parseInt(id));
        if (index !== -1) {
            window.mockData.payments[index] = { ...window.mockData.payments[index], ...paymentData };
        }
    } else {
        // Agregar nuevo pago
        paymentData.id = window.mockData.payments.length + 1;
        window.mockData.payments.push(paymentData);
    }

    bootstrap.Modal.getInstance(document.getElementById('paymentModal')).hide();
    loadPayments();
    updateDashboard();
});

document.getElementById('saveUserBtn').addEventListener('click', function() {
    const id = document.getElementById('userId').value;
    const password = document.getElementById('userPassword').value;
    const confirmPassword = document.getElementById('userConfirmPassword').value;
    const email = document.getElementById('userEmail').value;
    
    // Validar contraseñas si se están cambiando
    if (password || confirmPassword) {
        if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }
    }

    const userData = {
        nombre: document.getElementById('userName').value,
        email: email,
        rol: document.getElementById('userRole').value,
        estado: document.getElementById('userStatus').value,
        ultimoAcceso: new Date().toLocaleString()
    };

    // Solo actualizar contraseña si se proporcionó una nueva
    if (password) {
        userData.password = password;
    }

    if (id) {
        // Editar usuario existente
        const index = window.mockData.systemUsers.findIndex(u => u.id === parseInt(id));
        if (index !== -1) {
            // Mantener la contraseña existente si no se proporciona una nueva
            if (!password) {
                userData.password = window.mockData.systemUsers[index].password;
            }
            window.mockData.systemUsers[index] = { ...window.mockData.systemUsers[index], ...userData };
        }
    } else {
        // Agregar nuevo usuario
        if (!password) {
            // Generar contraseña aleatoria para nuevos usuarios
            userData.password = Math.random().toString(36).slice(-8);
            alert(`Se ha generado una contraseña para el nuevo usuario:\n${userData.password}\n\nPor favor, compártala con el usuario.`);
        }
        userData.id = window.mockData.systemUsers.length + 1;
        window.mockData.systemUsers.push(userData);
    }

    bootstrap.Modal.getInstance(document.getElementById('userModal')).hide();
    loadUsers();
});

document.getElementById('exportPaymentsBtn').addEventListener('click', function() {
    // Crear CSV con los datos de pagos
    const headers = ['Fecha', 'Alumno', 'Concepto', 'Monto', 'Estado', 'Método de Pago'];
    const csvContent = [
        headers.join(','),
        ...window.mockData.payments.map(p => [
            p.fecha,
            p.alumno,
            p.concepto,
            p.monto,
            p.estado,
            p.metodoPago
        ].join(','))
    ].join('\n');

    // Crear y descargar archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'pagos.csv';
    link.click();
});

// Eventos para botones de agregar
const addStudentBtn = document.getElementById('addStudentBtn');
const studentForm = document.getElementById('studentForm');
const saveStudentBtn = document.getElementById('saveStudentBtn');
const studentModal = document.getElementById('studentModal');

// Inicializar el modal de estudiantes
if (studentModal) {
    const modalInstance = new bootstrap.Modal(studentModal);

    // Evento para el botón de nuevo alumno
    if (addStudentBtn) {
        addStudentBtn.addEventListener('click', function() {
            // Limpiar el formulario
            if (studentForm) {
                studentForm.reset();
            }
            document.getElementById('studentId').value = '';
            document.getElementById('studentModalTitle').textContent = 'Nuevo Alumno';
            
            // Mostrar el modal
            modalInstance.show();
        });
    }

    // Evento para guardar alumno
    if (saveStudentBtn) {
        saveStudentBtn.addEventListener('click', function() {
            const id = document.getElementById('studentId').value;
            const name = document.getElementById('studentName').value;
            const dni = document.getElementById('studentDni').value;
            const course = document.getElementById('studentCourse').value;
            const responsible = document.getElementById('studentResponsible').value;
            const phone = document.getElementById('studentPhone').value;

            if (!name || !dni || !course || !responsible || !phone) {
                alert('Por favor complete todos los campos');
                return;
            }

            if (id) {
                // Editar alumno existente
                const studentIndex = window.mockData.students.findIndex(s => s.dni === id);
                if (studentIndex !== -1) {
                    window.mockData.students[studentIndex] = {
                        ...window.mockData.students[studentIndex],
                        nombre: name,
                        dni: dni,
                        curso: course,
                        responsable: responsible,
                        telefono: phone
                    };
                }
            } else {
                // Agregar nuevo alumno
                const newStudent = {
                    id: Date.now().toString(),
                    nombre: name,
                    dni: dni,
                    curso: course,
                    responsable: responsible,
                    telefono: phone,
                    estado: 'active'
                };
                window.mockData.students.push(newStudent);
            }

            // Cerrar el modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('studentModal'));
            modal.hide();

            // Limpiar el formulario
            document.getElementById('studentForm').reset();
            document.getElementById('studentId').value = '';

            // Actualizar la tabla
            loadStudents();
        });
    }
} else {
    console.error('El modal de estudiantes no se encontró en el DOM');
}

// Inicialización
updateDashboard();

// Eventos de registro
document.getElementById('registerLink').addEventListener('click', function(e) {
    e.preventDefault();
    const modal = new bootstrap.Modal(document.getElementById('registerModal'));
    modal.show();
});

document.getElementById('saveRegisterBtn').addEventListener('click', function() {
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    const name = document.getElementById('registerName').value;
    const role = document.getElementById('registerRole').value;

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
    }

    // Validar que el correo no esté ya registrado
    if (window.mockData.systemUsers.some(user => user.email === email)) {
        alert('Este correo electrónico ya está registrado');
        return;
    }

    // Crear solicitud de registro
    const registrationRequest = {
        id: window.mockData.pendingRegistrations.length + 1,
        nombre: name,
        email: email,
        password: password,
        rol: role,
        fechaSolicitud: new Date().toLocaleString(),
        estado: 'pendiente'
    };

    // Agregar solicitud a la lista de pendientes
    window.mockData.pendingRegistrations.push(registrationRequest);

    // Cerrar modal y mostrar mensaje de éxito
    bootstrap.Modal.getInstance(document.getElementById('registerModal')).hide();
    document.getElementById('registerForm').reset();
    
    alert('Su solicitud de registro ha sido enviada. El administrador la revisará y le notificará por correo electrónico.');
    
    // Limpiar campos de inicio de sesión
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
});

// Función para cargar solicitudes pendientes
function loadPendingRegistrations() {
    const tbody = document.getElementById('pendingRegistrationsTable');
    tbody.innerHTML = '';
    
    window.mockData.pendingRegistrations.forEach(request => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${request.nombre}</td>
            <td>${request.email}</td>
            <td>${request.rol === 'teacher' ? 'Docente' : 'Estudiante'}</td>
            <td>${request.fechaSolicitud}</td>
            <td>
                <button class="btn btn-sm btn-success me-1" onclick="approveRegistration(${request.id})">
                    <i class="fas fa-check"></i> Aprobar
                </button>
                <button class="btn btn-sm btn-danger" onclick="rejectRegistration(${request.id})">
                    <i class="fas fa-times"></i> Rechazar
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Función para aprobar registro
function approveRegistration(id) {
    const request = window.mockData.pendingRegistrations.find(r => r.id === id);
    if (request) {
        // Crear nuevo usuario
        const newUser = {
            id: window.mockData.systemUsers.length + 1,
            nombre: request.nombre,
            email: request.email,
            password: request.password,
            rol: request.rol,
            estado: 'active',
            ultimoAcceso: new Date().toLocaleString()
        };

        // Agregar usuario al sistema
        window.mockData.systemUsers.push(newUser);

        // Eliminar solicitud de pendientes
        window.mockData.pendingRegistrations = window.mockData.pendingRegistrations.filter(r => r.id !== id);

        // Actualizar tabla de solicitudes pendientes
        loadPendingRegistrations();

        alert(`Usuario ${request.nombre} aprobado exitosamente.`);
    }
}

// Función para rechazar registro
function rejectRegistration(id) {
    const request = window.mockData.pendingRegistrations.find(r => r.id === id);
    if (request) {
        if (confirm(`¿Está seguro de rechazar la solicitud de registro de ${request.nombre}?`)) {
            // Eliminar solicitud de pendientes
            window.mockData.pendingRegistrations = window.mockData.pendingRegistrations.filter(r => r.id !== id);

            // Actualizar tabla de solicitudes pendientes
            loadPendingRegistrations();

            alert(`Solicitud de registro de ${request.nombre} rechazada.`);
        }
    }
}

// Evento para el enlace del perfil
document.getElementById('profileLink').addEventListener('click', function(e) {
    e.preventDefault();
    showProfileModal();
});

function showProfileModal() {
    if (!currentUser) return;

    // Llenar el formulario con los datos actuales del usuario
    document.getElementById('profileName').value = currentUser.nombre;
    document.getElementById('profileEmail').value = currentUser.email;
    document.getElementById('profilePhone').value = currentUser.telefono || '';
    document.getElementById('profileAddress').value = currentUser.direccion || '';
    document.getElementById('profileBirthDate').value = currentUser.fechaNacimiento || '';
    
    // Limpiar campos de contraseña
    document.getElementById('profileCurrentPassword').value = '';
    document.getElementById('profileNewPassword').value = '';
    document.getElementById('profileConfirmPassword').value = '';

    // Mostrar el modal
    const modal = new bootstrap.Modal(document.getElementById('profileModal'));
    modal.show();
}

// Evento para guardar cambios del perfil
document.getElementById('saveProfileBtn').addEventListener('click', function() {
    if (!currentUser) return;

    const currentPassword = document.getElementById('profileCurrentPassword').value;
    const newPassword = document.getElementById('profileNewPassword').value;
    const confirmPassword = document.getElementById('profileConfirmPassword').value;

    // Validar contraseña actual si se intenta cambiar la contraseña
    if (newPassword || confirmPassword) {
        if (currentPassword !== currentUser.password) {
            alert('La contraseña actual es incorrecta');
            return;
        }
        if (newPassword !== confirmPassword) {
            alert('Las nuevas contraseñas no coinciden');
            return;
        }
    }

    // Actualizar datos del usuario
    const userIndex = window.mockData.systemUsers.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        const updatedUser = {
            ...window.mockData.systemUsers[userIndex],
            nombre: document.getElementById('profileName').value,
            email: document.getElementById('profileEmail').value,
            telefono: document.getElementById('profilePhone').value,
            direccion: document.getElementById('profileAddress').value,
            fechaNacimiento: document.getElementById('profileBirthDate').value
        };

        // Actualizar contraseña si se proporcionó una nueva
        if (newPassword) {
            updatedUser.password = newPassword;
        }

        // Actualizar el usuario en el sistema
        window.mockData.systemUsers[userIndex] = updatedUser;
        currentUser = updatedUser;

        // Actualizar el nombre mostrado en la interfaz
        document.getElementById('currentUser').textContent = updatedUser.nombre;

        // Cerrar el modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('profileModal'));
        modal.hide();

        // Mostrar mensaje de éxito
        alert('Perfil actualizado exitosamente');
    }
});