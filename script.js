class HomeworkTracker {
    constructor() {
        this.books = []; // 使用内存存储
        this.currentBookId = null;
        this.isEditMode = false;
        this.editingPageNumber = null;
        
        this.initializeElements();
        this.bindEvents();
        this.renderBookList();
        
        // 添加示例数据（可选）
        this.addSampleData();
    }

    initializeElements() {
        // 页面元素
        this.homePage = document.getElementById('homePage');
        this.bookDetailPage = document.getElementById('bookDetailPage');
        
        // 首页元素
        this.bookList = document.getElementById('bookList');
        this.createBookBtn = document.getElementById('createBookBtn');
        this.createBookModal = document.getElementById('createBookModal');
        this.createBookForm = document.getElementById('createBookForm');
        this.cancelCreateBtn = document.getElementById('cancelCreateBtn');
        
        // 详情页元素
        this.backBtn = document.getElementById('backBtn');
        this.bookTitle = document.getElementById('bookTitle');
        this.editModeBtn = document.getElementById('editModeBtn');
        this.remainingPages = document.getElementById('remainingPages');
        this.progressFill = document.getElementById('progressFill');
        this.pagesGrid = document.getElementById('pagesGrid');
        
        // 编辑模态框元素
        this.editPageModal = document.getElementById('editPageModal');
        this.editPageNumber = document.getElementById('editPageNumber');
        this.savePageStatusBtn = document.getElementById('savePageStatusBtn');
        this.cancelEditBtn = document.getElementById('cancelEditBtn');
    }

    bindEvents() {
        // 首页事件
        this.createBookBtn.addEventListener('click', () => this.showCreateBookModal());
        this.cancelCreateBtn.addEventListener('click', () => this.hideCreateBookModal());
        this.createBookForm.addEventListener('submit', (e) => this.createBook(e));
        
        // 详情页事件
        this.backBtn.addEventListener('click', () => this.showHomePage());
        this.editModeBtn.addEventListener('click', () => this.toggleEditMode());
        
        // 编辑模态框事件
        this.savePageStatusBtn.addEventListener('click', () => this.savePageStatus());
        this.cancelEditBtn.addEventListener('click', () => this.hideEditPageModal());
        
        // 模态框外部点击关闭
        this.createBookModal.addEventListener('click', (e) => {
            if (e.target === this.createBookModal) this.hideCreateBookModal();
        });
        
        this.editPageModal.addEventListener('click', (e) => {
            if (e.target === this.editPageModal) this.hideEditPageModal();
        });
    }

    // 页面导航
    showHomePage() {
        this.homePage.classList.add('active');
        this.bookDetailPage.classList.remove('active');
        this.renderBookList();
    }

    showBookDetailPage(bookId) {
        this.currentBookId = bookId;
        this.isEditMode = false;
        this.editModeBtn.textContent = '编辑';
        
        const book = this.books.find(b => b.id === bookId);
        if (!book) return;

        this.bookTitle.textContent = book.name;
        this.updateProgressInfo(book);
        this.renderPagesGrid(book);
        
        this.homePage.classList.remove('active');
        this.bookDetailPage.classList.add('active');
    }

    // 作业本管理
    showCreateBookModal() {
        this.createBookModal.classList.add('active');
    }

    hideCreateBookModal() {
        this.createBookModal.classList.remove('active');
        this.createBookForm.reset();
    }

    createBook(e) {
        e.preventDefault();
        
        const name = document.getElementById('bookName').value.trim();
        const totalPages = parseInt(document.getElementById('totalPages').value);
        
        if (!name || totalPages < 1) {
            alert('请填写有效的作业本名称和页数');
            return;
        }

        const newBook = {
            id: Date.now().toString(),
            name: name,
            totalPages: totalPages,
            pages: Array(totalPages).fill().map((_, index) => ({
                number: index + 1,
                status: 'not-started'
            })),
            createdAt: new Date().toISOString()
        };

        this.books.push(newBook);
        this.hideCreateBookModal();
        this.renderBookList();
    }

    deleteBook(bookId) {
        if (confirm('确定要删除这个作业本吗？')) {
            this.books = this.books.filter(book => book.id !== bookId);
        this.renderBookList();
        }
    }

    // 进度信息更新
    updateProgressInfo(book) {
        const completedPages = book.pages.filter(page => page.status === 'completed').length;
        const remainingPages = book.totalPages - completedPages;
        const progressPercentage = (completedPages / book.totalPages) * 100;

        this.remainingPages.textContent = remainingPages;
        this.progressFill.style.width = `${progressPercentage}%`;
    }

    // 页面网格渲染
    renderPagesGrid(book) {
        this.pagesGrid.innerHTML = '';
        
        book.pages.forEach(page => {
            const pageElement = document.createElement('div');
            pageElement.className = `page-item ${page.status}`;
            pageElement.textContent = page.number;
            pageElement.title = `第 ${page.number} 页 - ${page.status === 'completed' ? '已完成' : '未开始'}`;
            
            if (this.isEditMode) {
                pageElement.addEventListener('click', () => this.showEditPageModal(page.number));
            }
            
            this.pagesGrid.appendChild(pageElement);
        });
    }

    // 编辑模式
    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        this.editModeBtn.textContent = this.isEditMode ? '完成编辑' : '编辑';
        
        const book = this.books.find(b => b.id === this.currentBookId);
        if (book) {
            this.renderPagesGrid(book);
        }
    }

    // 页面状态编辑
    showEditPageModal(pageNumber) {
        if (!this.isEditMode) return;
        
        this.editingPageNumber = pageNumber;
        this.editPageNumber.textContent = pageNumber;
        
        const book = this.books.find(b => b.id === this.currentBookId);
        const page = book.pages.find(p => p.number === pageNumber);
        
        // 重置状态按钮
        document.querySelectorAll('.status-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.status === page.status) {
                btn.classList.add('active');
            }
        });
        
        this.editPageModal.classList.add('active');
    }

    hideEditPageModal() {
        this.editPageModal.classList.remove('active');
        this.editingPageNumber = null;
    }

    savePageStatus() {
        if (!this.editingPageNumber) return;
        
        const selectedStatus = document.querySelector('.status-btn.active')?.dataset.status;
        if (!selectedStatus) {
            alert('请选择页面状态');
            return;
        }

        const book = this.books.find(b => b.id === this.currentBookId);
        const page = book.pages.find(p => p.number === this.editingPageNumber);
        
        if (page) {
            page.status = selectedStatus;
            this.updateProgressInfo(book);
            this.renderPagesGrid(book);
            this.hideEditPageModal();
        }
    }

    // 作业本列表渲染
    renderBookList() {
        this.bookList.innerHTML = '';
        
        if (this.books.length === 0) {
            this.bookList.innerHTML = `
                <div class="no-books">
                    <p>还没有作业本，点击"新建作业本"开始使用</p>
                </div>
            `;
            return;
        }

        this.books.forEach(book => {
            const completedPages = book.pages.filter(page => page.status === 'completed').length;
            const progressPercentage = (completedPages / book.totalPages) * 100;
            
            const bookElement = document.createElement('div');
            bookElement.className = 'book-item';
            bookElement.innerHTML = `
                <h3>${book.name}</h3>
                <div class="book-info">
                    <p>总页数: ${book.totalPages}</p>
                    <p>已完成: ${completedPages} 页</p>
                    <p>创建时间: ${new Date(book.createdAt).toLocaleDateString()}</p>
                </div>
                <div class="progress">
                    <div class="progress-bar" style="width: ${progressPercentage}%"></div>
                </div>
                <div class="book-actions" style="margin-top: 15px; display: flex; gap: 10px;">
                    <button class="btn-primary" onclick="tracker.showBookDetailPage('${book.id}')">查看详情</button>
                    <button class="btn-secondary" onclick="tracker.deleteBook('${book.id}')">删除</button>
                </div>
            `;
            
            this.bookList.appendChild(bookElement);
        });
    }

    // 添加示例数据
    addSampleData() {
        if (this.books.length === 0) {
            this.books.push({
                id: 'sample1',
                name: '数学作业本',
                totalPages: 50,
                pages: Array(50).fill().map((_, index) => ({
                    number: index + 1,
                    status: index < 15 ? 'completed' : 'not-started'
                })),
                createdAt: new Date().toISOString()
            });
            
            this.books.push({
                id: 'sample2',
                name: '语文作业本',
                totalPages: 30,
                pages: Array(30).fill().map((_, index) => ({
                    number: index + 1,
                    status: index < 5 ? 'completed' : 'not-started'
                })),
                createdAt: new Date().toISOString()
            });
        }
    }

    // 导出数据
    exportData() {
        const dataStr = JSON.stringify(this.books, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `作业统计数据_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(link.href);
    }

    // 导入数据
    importData(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const importedBooks = JSON.parse(e.target.result);
                
                // 验证数据格式
                if (!Array.isArray(importedBooks) || !importedBooks.every(book => 
                    book.id && book.name && book.totalPages && Array.isArray(book.pages)
                )) {
                    throw new Error('无效的数据格式');
                }
                
                this.books = importedBooks;
                this.renderBookList();
                this.hideImportDataModal();
                alert('数据导入成功！');
                
            } catch (error) {
                alert('导入失败：' + error.message);
            }
        };
        
        reader.readAsText(file);
    }

    // 导入数据模态框控制
    showImportDataModal() {
        document.getElementById('importDataModal').classList.add('active');
    }

    hideImportDataModal() {
        document.getElementById('importDataModal').classList.remove('active');
        document.getElementById('importFile').value = '';
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.tracker = new HomeworkTracker();
    
    // 绑定导入导出按钮事件
    document.getElementById('exportDataBtn').addEventListener('click', () => {
        window.tracker.exportData();
    });
    
    document.getElementById('importDataBtn').addEventListener('click', () => {
        window.tracker.showImportDataModal();
    });
    
    document.getElementById('cancelImportBtn').addEventListener('click', () => {
        window.tracker.hideImportDataModal();
    });
    
    document.getElementById('confirmImportBtn').addEventListener('click', () => {
        const fileInput = document.getElementById('importFile');
        if (fileInput.files.length > 0) {
            window.tracker.importData(fileInput.files[0]);
        } else {
            alert('请选择要导入的文件');
        }
    });
    
    // 动态绑定状态按钮事件
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('status-btn')) {
            document.querySelectorAll('.status-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
        }
    });
});