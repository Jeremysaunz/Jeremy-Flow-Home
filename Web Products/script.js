document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    let projects = [];
    const STORAGE_KEY = 'flowlab_projects';
    const LAST_ACTIVITY_KEY = 'flowlab_last_activity';

    // Default Demo Data (Only used if LocalStorage is empty)
    const defaultProjects = [
        {
            id: 'p1',
            title: 'E-Commerce Reform',
            url: 'https://example.com/ecommerce',
            image: 'https://images.unsplash.com/photo-1481487125483-e028bfa17d84?q=80&w=2000&auto=format&fit=crop',
            tag: 'Featured',
            description: 'Complete redesign of a fashion retailer platform.',
            size: 'large'
        },
        {
            id: 'p2',
            title: 'Dev Dashboard',
            url: 'https://example.com/dashboard',
            image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2000&auto=format&fit=crop',
            tag: 'Coding',
            description: 'Dev Dashboard',
            size: 'medium'
        },
        {
            id: 'p3',
            title: 'Media Kit',
            url: 'https://example.com/mediakit',
            image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=2000&auto=format&fit=crop',
            tag: 'Social',
            description: 'Media Kit',
            size: 'medium'
        },
        {
            id: 'p4',
            title: 'UI Kit',
            url: 'https://example.com/uikit',
            image: '',
            icon: 'fa-brands fa-figma',
            tag: '',
            description: 'V1.0.2',
            size: 'medium',
            isClean: true
        },
        {
            id: 'p5',
            title: 'Open Source',
            url: 'https://github.com/example',
            image: '',
            icon: 'fa-brands fa-github',
            tag: '',
            description: 'Contribute',
            size: 'medium',
            isClean: true
        },
        {
            id: 'p6',
            title: 'AI Integration',
            url: 'https://example.com/ai',
            image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2000&auto=format&fit=crop',
            tag: 'Future',
            description: 'Exploring new possibilities with LLMs.',
            size: 'wide'
        }
    ];

    // --- DOM ELEMENTS ---
    const bentoGrid = document.querySelector('.bento-grid');
    const sidebarList = document.getElementById('sidebar-product-list');
    const modal = document.getElementById('product-modal');
    const deleteModal = document.getElementById('delete-confirmation-modal');
    const productForm = document.getElementById('new-product-form');

    // Stats Elements
    const statTotalProjects = document.getElementById('stat-total-projects');
    const statLastActivity = document.getElementById('stat-last-activity');
    const statTotalViews = document.getElementById('stat-total-views');

    // --- INITIALIZATION ---
    function init() {
        loadProjects();
        renderProjects();
        updateStats();
        setupEventListeners();
        setupDateDisplay();
    }

    // --- CORE FUNCTIONS ---

    function loadProjects() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            projects = JSON.parse(stored);
        } else {
            projects = [...defaultProjects];
            saveProjects();
        }
    }

    function saveProjects() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
        updateLastActivity();
        renderProjects();
        updateStats();
    }

    function updateLastActivity() {
        const now = new Date();
        localStorage.setItem(LAST_ACTIVITY_KEY, now.toISOString());
    }

    function renderProjects() {
        bentoGrid.innerHTML = '';
        sidebarList.innerHTML = '';

        projects.forEach(project => {
            // 1. Create Grid Item
            const item = document.createElement('a');
            item.className = `bento-item ${project.size || 'medium'} ${project.isClean ? 'clean' : ''}`;
            item.href = project.url;
            item.target = "_blank";
            item.dataset.id = project.id; // Store ID for logic

            // Background Logic: use img + fallback when image URL exists, so we can show gradient if load fails
            if (!project.isClean) {
                if (!project.image) {
                    const hue = Math.floor(Math.random() * 360);
                    item.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.8)), linear-gradient(${hue}deg, #2b2b2b, #1a1a1a)`;
                }
            }

            // Content Logic
            let contentHTML = '';
            if (project.isClean) {
                contentHTML = `
                    <div class="item-content-center">
                        <div class="icon-circle"><i class="${project.icon || 'fa-solid fa-cube'}"></i></div>
                        <h3>${project.title}</h3>
                        <p>${project.description || ''}</p>
                    </div>
                `;
            } else {
                if (project.image) {
                    contentHTML = `
                        <div class="bento-bg-wrap">
                            <img class="bento-bg-img" src="${project.image.replace(/"/g, '&quot;')}" alt="" referrerpolicy="no-referrer" />
                            <div class="bento-bg-fallback"></div>
                        </div>
                    `;
                }
                contentHTML += `
                    <div class="item-content">
                        ${project.tag ? `<span class="tag">${project.tag}</span>` : ''}
                        <h3>${project.title}</h3>
                        <p>${project.description || project.url.replace(/^https?:\/\//, '')}</p>
                    </div>
                `;
            }

            // Add Edit Button
            contentHTML += `
                <div class="edit-btn" data-id="${project.id}">
                    <i class="fa-solid fa-pen"></i>
                </div>
            `;

            item.innerHTML = contentHTML;

            // When preview image fails to load, show gradient fallback
            if (!project.isClean && project.image) {
                const img = item.querySelector('.bento-bg-img');
                const fallback = item.querySelector('.bento-bg-fallback');
                if (img && fallback) {
                    img.addEventListener('error', () => {
                        img.style.display = 'none';
                        fallback.style.display = 'block';
                    });
                }
            }
            bentoGrid.appendChild(item);

            // 2. Create Sidebar Item
            const navItem = document.createElement('a');
            navItem.href = project.url;
            navItem.className = 'nav-item';
            navItem.target = "_blank";
            navItem.innerHTML = `<i class="fa-solid fa-link"></i><span>${project.title}</span>`;
            sidebarList.appendChild(navItem);
        });

        // Re-attach edit listeners
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                openEditModal(btn.dataset.id);
            });
        });
    }

    // --- STATS LOGIC ---
    function updateStats() {
        // Total Projects
        statTotalProjects.textContent = projects.length;

        // Last Activity
        const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
        if (lastActivity) {
            const date = new Date(lastActivity);
            statLastActivity.textContent = timeAgo(date);
        } else {
            statLastActivity.textContent = 'None';
        }

        // Total Views (Simulated Logic)
        updateTotalViews();
    }

    function timeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " mins ago";
        return "Just now";
    }

    // View Count Simulation
    function updateTotalViews() {
        const VIEWS_KEY = 'flowlab_total_views';
        let views = parseInt(localStorage.getItem(VIEWS_KEY)) || 1240;

        // Increment on load (Session visit)
        // Check if we already incremented this session to avoid refresh spamming? 
        // For "alive" feel, just incrementing on load is fine + random interval.

        const updateDisplay = () => {
            // Format with k if > 1000 (simple logic)
            const displayValue = views > 999 ? (views / 1000).toFixed(1) + 'k' : views;
            statTotalViews.textContent = displayValue;
        };

        // Initial display
        updateDisplay();

        // Simulate "Live" traffic
        if (!window.viewInterval) {
            window.viewInterval = setInterval(() => {
                // Random chance to increment
                if (Math.random() > 0.4) {
                    views += Math.floor(Math.random() * 3) + 1; // +1 to +3 views
                    localStorage.setItem(VIEWS_KEY, views);
                    updateDisplay();
                }
            }, 3000); // Check every 3 seconds
        }
    }

    // --- MODAL & FORM LOGIC ---
    let currentEditingId = null;

    function openEditModal(id) {
        currentEditingId = id;
        const project = projects.find(p => p.id === id);
        if (!project) return;

        document.getElementById('product-title').value = project.title;
        document.getElementById('product-url').value = project.url;
        document.getElementById('card-size').value = project.size || 'medium';

        modal.querySelector('h2').textContent = 'Edit Product';
        const submitBtn = productForm.querySelector('.submit-btn');
        submitBtn.textContent = 'Save Changes';

        // Show delete button
        document.getElementById('delete-btn').style.display = 'block';

        modal.style.display = 'block';
    }

    function resetModal() {
        modal.style.display = 'none';
        productForm.reset();
        currentEditingId = null;
        modal.querySelector('h2').textContent = 'Add New Product';
        productForm.querySelector('.submit-btn').textContent = 'Add Product';
        document.getElementById('delete-btn').style.display = 'none';
    }

    // --- EVENT LISTENERS ---
    function setupEventListeners() {
        // New Product Button
        document.getElementById('new-product-btn').addEventListener('click', () => {
            resetModal();
            modal.style.display = 'block';
        });

        // Close Buttons
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                modal.style.display = 'none';
                deleteModal.style.display = 'none';
            });
        });

        // Cancel Delete
        document.getElementById('cancel-delete-btn').addEventListener('click', () => {
            deleteModal.style.display = 'none';
        });

        // Delete Trigger (in Edit Modal)
        document.getElementById('delete-btn').addEventListener('click', () => {
            if (currentEditingId) {
                const project = projects.find(p => p.id === currentEditingId);
                document.getElementById('delete-target-name').textContent = project.title;
                deleteModal.style.display = 'block';
            }
        });

        // Confirm Delete Action
        document.getElementById('confirm-delete-btn').addEventListener('click', () => {
            if (currentEditingId) {
                projects = projects.filter(p => p.id !== currentEditingId);
                saveProjects();
                deleteModal.style.display = 'none';
                resetModal(); // Check if we need to close the edit modal too
            }
        });

        // Form Submit
        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = productForm.querySelector('.submit-btn');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Processing...';
            submitBtn.disabled = true;

            const title = document.getElementById('product-title').value;
            const url = document.getElementById('product-url').value;
            const size = document.getElementById('card-size').value;

            // Image Generation Strategy (Thum.io - Instant & Reliable)
            let image = '';

            // If editing, start with existing image
            if (currentEditingId) {
                const existing = projects.find(p => p.id === currentEditingId);
                if (existing) image = existing.image;
            }

            // Check if URL changed
            const isUrlChanged = currentEditingId ? (projects.find(p => p.id === currentEditingId)?.url !== url) : true;

            // Generate new screenshot URL if needed
            // Only generate if it's a valid http/https URL and actually changed
            if (isUrlChanged && url && url.startsWith('http')) {
                // Use Thum.io for direct image generation without async fetch
                // encodeURIComponent ensures special chars (e.g. #, ?, Korean) don't break the request
                image = `https://image.thum.io/get/width/600/crop/800/${encodeURIComponent(url)}`;
            }

            if (currentEditingId) {
                // UPDATE
                const index = projects.findIndex(p => p.id === currentEditingId);
                if (index !== -1) {
                    projects[index] = { ...projects[index], title, url, size, image };
                }
            } else {
                // CREATE
                const newProject = {
                    id: 'p' + Date.now(),
                    title,
                    url,
                    size,
                    image: image || '',
                    description: url.replace(/^https?:\/\//, ''),
                    tag: 'New'
                };
                projects.unshift(newProject);
            }

            saveProjects();
            resetModal();

            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        });

        // Search
        document.getElementById('project-search').addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            document.querySelectorAll('.bento-item').forEach(item => {
                const title = item.querySelector('h3').textContent.toLowerCase();
                if (title.includes(term)) {
                    item.style.display = 'block'; // or flex/grid logic
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }

    function setupDateDisplay() {
        const dateElement = document.getElementById('current-date');
        if (dateElement) {
            const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
            dateElement.textContent = new Date().toLocaleDateString('en-US', options);
        }
    }

    // Run Init
    init();

});
