const CONTACT_EMAIL = 'contact@anasalqaysi.tech';
const FORM_ENDPOINT = 'https://formsubmit.co/ajax/ca5739aa2f14d0de06a690aa6c86d82d';

const query = (selector, parent = document) => parent.querySelector(selector);
const queryAll = (selector, parent = document) => [...parent.querySelectorAll(selector)];

function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function sanitizeUrl(rawUrl) {
    if (!rawUrl || typeof rawUrl !== 'string') return '';
    const trimmed = rawUrl.trim();
    if (trimmed.startsWith('/') || trimmed.startsWith('./') || trimmed.startsWith('assets/')) {
        return trimmed.replace(/[<>"']/g, '');
    }
    try {
        const parsed = new URL(trimmed, window.location.href);
        if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
            return parsed.href;
        }
    } catch {
        // Invalid URL
    }
    return '';
}

function initTheme() {
    const themeToggle = query('#themeToggle');
    if (!themeToggle) return;

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const nextTheme = currentTheme === 'light' ? 'dark' : 'light';

        document.documentElement.setAttribute('data-theme', nextTheme);
        try {
            localStorage.setItem('theme', nextTheme);
        } catch {
            // Private browsing modes can block localStorage; the visual toggle still works.
        }
    });
}

function initMobileMenu() {
    const menuToggle = query('#menuToggle');
    const mobileMenu = query('#mobileMenu');
    if (!menuToggle || !mobileMenu) return;

    const closeMenu = () => {
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    };

    menuToggle.addEventListener('click', () => {
        const isOpen = !mobileMenu.classList.contains('active');
        menuToggle.classList.toggle('active', isOpen);
        menuToggle.setAttribute('aria-expanded', String(isOpen));
        mobileMenu.classList.toggle('active', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    queryAll('.mobile-link', mobileMenu).forEach((link) => {
        link.addEventListener('click', closeMenu);
    });
}

function initNavbar() {
    const navbar = query('#navbar');
    if (!navbar) return;

    const updateNavbar = () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    };

    updateNavbar();
    window.addEventListener('scroll', updateNavbar, { passive: true });
}

function initScrollReveal() {
    const elements = queryAll(
        '.expertise-card, .project-card, .contact-form, .section-header, .step-card, .footer-freelance'
    );

    if (!elements.length) return;
    if (!('IntersectionObserver' in window)) {
        elements.forEach((element) => element.classList.add('reveal', 'revealed'));
        return;
    }

    const observer = new IntersectionObserver((entries, currentObserver) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('revealed');
            currentObserver.unobserve(entry.target);
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    elements.forEach((element) => {
        element.classList.add('reveal');
        observer.observe(element);
    });
}

function initProjectSlider() {
    if (typeof Swiper !== 'function' || !query('.project-swiper')) return;

    new Swiper('.project-swiper', {
        loop: true,
        initialSlide: 0,
        effect: 'fade',
        fadeEffect: { crossFade: true },
        autoplay: false,
        pagination: {
            el: '.swiper-pagination',
            clickable: true
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev'
        }
    });
}

function initContactForm() {
    const form = query('#contactForm');
    if (!form) return;

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const button = query('.btn-submit', form);
        const name = query('#name')?.value.trim() || '';
        const phone = query('#phone')?.value.trim() || '';
        const message = query('#msg')?.value.trim() || '';
        if (!button) return;

        const subject = `طلب تواصل جديد من: ${name} (${phone})`;
        button.disabled = true;
        button.innerHTML = '<span>جاري الإرسال...</span>';

        try {
            const response = await fetch(FORM_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
                body: JSON.stringify({
                    _subject: subject,
                    الاسم: name,
                    الجوال: phone,
                    الرسالة: message
                })
            });

            if (!response.ok) {
                throw new Error(`Contact form request failed with status ${response.status}`);
            }

            button.innerHTML = '<span>تم الإرسال بنجاح</span>';
            button.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            form.reset();
        } catch (error) {
            console.error('Unable to send the contact form remotely.', error);
            const mailtoBody = `الاسم: ${name}\nالجوال: ${phone}\n\n${message}`;
            window.location.href =
                `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(mailtoBody)}`;
            button.innerHTML = '<span>فتح تطبيق البريد الإلكتروني</span>';
        } finally {
            window.setTimeout(() => {
                button.disabled = false;
                button.innerHTML = '<span>إرسال الرسالة</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>';
                button.style.background = '';
            }, 4500);
        }
    });
}

const codeTokens = [
    { text: 'interface', class: 'code-keyword' },
    { text: ' ' },
    { text: 'ProjectProps', class: 'code-def' },
    { text: ' {\n  ' },
    { text: 'client', class: 'code-prop' },
    { text: ': ' },
    { text: 'string', class: 'code-type' },
    { text: ';\n  ' },
    { text: 'type', class: 'code-prop' },
    { text: ': ' },
    { text: "'Portfolio'", class: 'code-string' },
    { text: ' | ' },
    { text: "'Business Profile'", class: 'code-string' },
    { text: ' | ' },
    { text: "'Digital Menu'", class: 'code-string' },
    { text: ';\n}\n\n' },
    { text: 'export function', class: 'code-keyword' },
    { text: ' ' },
    { text: 'CreateWebsite', class: 'code-def' },
    { text: '({ ' },
    { text: 'client', class: 'code-prop' },
    { text: ', ' },
    { text: 'type', class: 'code-prop' },
    { text: ' }: ' },
    { text: 'ProjectProps', class: 'code-type' },
    { text: ') {\n  ' },
    { text: 'return', class: 'code-keyword' },
    { text: ' (\n    <' },
    { text: 'Project', class: 'code-def' },
    { text: ' ' },
    { text: 'performance', class: 'code-prop' },
    { text: '=' },
    { text: '"100%"', class: 'code-string' },
    { text: ' ' },
    { text: 'readyToLaunch', class: 'code-prop' },
    { text: '={' },
    { text: 'true', class: 'code-keyword' },
    { text: '}>\n      <' },
    { text: 'DeliverSuccess', class: 'code-def' },
    { text: ' ' },
    { text: 'to', class: 'code-prop' },
    { text: '={' },
    { text: 'client', class: 'code-prop' },
    { text: '} />\n    </' },
    { text: 'Project', class: 'code-def' },
    { text: '>\n  );\n}' }
];

async function initCodeTyping() {
    const container = query('#codeTyping');
    if (!container) return;

    container.replaceChildren();
    const cursor = document.createElement('span');
    cursor.className = 'code-cursor';
    container.append(cursor);

    for (const token of codeTokens) {
        const element = token.class
            ? Object.assign(document.createElement('span'), { className: token.class })
            : document.createTextNode('');
        container.insertBefore(element, cursor);

        for (const character of token.text) {
            element.nodeType === Node.TEXT_NODE
                ? element.appendData(character)
                : element.append(character);
            await new Promise((resolve) => window.setTimeout(resolve, 22));
        }
    }
}

function initCertificateModal(openButtonId, closeButtonId, modalId) {
    const openButton = document.getElementById(openButtonId);
    const closeButton = document.getElementById(closeButtonId);
    const modal = document.getElementById(modalId);
    if (!modal) return;

    const closeModal = () => {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        if (!query('.cert-modal-backdrop.is-open')) document.body.style.overflow = '';
    };

    openButton?.addEventListener('click', () => {
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        closeButton?.focus();
    });
    closeButton?.addEventListener('click', closeModal);
    modal.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });
}

async function initDynamicProjects() {
    const grid = query('.projects-grid');
    const workSection = query('#work .container');
    if (!grid || !workSection) return;

    let items = null;

    // 1. Try local projects.json first (fastest & offline-ready)
    try {
        const localRes = await fetch('projects.json');
        if (localRes.ok) {
            items = await localRes.json();
        }
    } catch {
        // Fall back to Firestore REST
    }

    // 2. Fall back to Firebase Firestore Public REST API
    if (!items) {
        try {
            const firestoreUrl =
                'https://firestore.googleapis.com/v1/projects/deliveryanas-app/databases/(default)/documents/portfolio_public/showcase';
            const remoteRes = await fetch(firestoreUrl);
            if (remoteRes.ok) {
                const data = await remoteRes.json();
                if (data.fields && data.fields.items && data.fields.items.arrayValue) {
                    const rawValues = data.fields.items.arrayValue.values || [];
                    items = rawValues.map((v) => {
                        const m = v.mapValue?.fields || {};
                        return {
                            id: m.id?.stringValue || '',
                            title: m.title?.stringValue || '',
                            category: m.category?.stringValue || 'clients',
                            categoryLabel: m.categoryLabel?.stringValue || 'مشروع',
                            description: m.description?.stringValue || '',
                            badge: m.badge?.stringValue || 'مشروع معتمد',
                            demoUrl: m.demoUrl?.stringValue || '',
                            imageUrl: m.imageUrl?.stringValue || '',
                            showOnHome: m.showOnHome?.booleanValue ?? true,
                            order: Number(m.order?.integerValue) || 1,
                            techStack:
                                m.techStack?.arrayValue?.values?.map((t) => t.stringValue) || [
                                    'Full-Stack'
                                ]
                        };
                    });
                }
            }
        } catch {
            // Silently fallback to static projects
        }
    }

    if (!Array.isArray(items) || items.length === 0) return;

    // Sort items by order
    items.sort((a, b) => (a.order || 99) - (b.order || 99));

    // State for viewing
    let isShowingAll = false;
    let activeCategory = 'all';

    // Fetch dynamic categories
    let categories = [
        { id: 'all', label: 'الكل' }
    ];

    try {
        const catRes = await fetch('categories.json');
        if (catRes.ok) {
            const catData = await catRes.json();
            if (Array.isArray(catData) && catData.length > 0) {
                categories = [{ id: 'all', label: 'الكل' }, ...catData];
            }
        }
    } catch {
        const seen = new Set();
        items.forEach((it) => {
            if (it.category && !seen.has(it.category)) {
                seen.add(it.category);
                categories.push({ id: it.category, label: it.categoryLabel || it.category });
            }
        });
    }

    // 1. Create Dynamic Filter Bar
    let filterBar = query('.projects-filter-bar', workSection);
    if (!filterBar) {
        filterBar = document.createElement('div');
        filterBar.className = 'projects-filter-bar';
        filterBar.style.display = 'none';

        filterBar.innerHTML = categories
            .map(
                (cat, idx) => `
            <button type="button" class="filter-btn ${idx === 0 ? 'active' : ''}" data-cat="${escapeHtml(cat.id)}">
                ${escapeHtml(cat.label)}
            </button>
        `
            )
            .join('');

        const header = query('.section-header', workSection);
        if (header) {
            header.after(filterBar);
        }

        // Filter button click events
        filterBar.querySelectorAll('.filter-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                filterBar.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
                btn.classList.add('active');
                activeCategory = btn.getAttribute('data-cat') || 'all';
                renderCards();
            });
        });
    }

    // 2. Render Cards function with Zigzag alternating layout
    function renderCards() {
        grid.replaceChildren();

        // Filter by showOnHome and category
        let visibleItems = items;
        if (!isShowingAll) {
            visibleItems = items.filter((p) => p.showOnHome).slice(0, 4);
            if (visibleItems.length === 0) {
                visibleItems = items.slice(0, 4);
            }
        } else if (activeCategory !== 'all') {
            visibleItems = items.filter((p) => p.category === activeCategory);
        }

        visibleItems.forEach((item, index) => {
            const card = document.createElement('div');
            // Alternating Zigzag: even index normal (Image Right in RTL), odd index reverse (Image Left)
            const isReverse = index % 2 === 1;
            card.className = `project-card reveal revealed ${isReverse ? 'project-reverse' : ''}`;
            card.setAttribute('data-project-id', escapeHtml(item.id));

            const safeTitle = escapeHtml(item.title);
            const safeDesc = escapeHtml(item.description);
            const safeBadge = escapeHtml(item.badge || item.categoryLabel || 'مشروع معتمد');
            const safeDemoUrl = sanitizeUrl(item.demoUrl);

            const techPills = (item.techStack || [])
                .map((t) => `<span class="tech-pill">${escapeHtml(t)}</span>`)
                .join('');

            const actionBtn = safeDemoUrl
                ? `<div class="project-actions">
                    <a href="${safeDemoUrl}" class="btn btn-primary btn-sm" target="_blank" rel="noopener noreferrer">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                        معاينة حية
                    </a>
                   </div>`
                : '';

            // Render Image Column: multi-image swiper, single image, or precision mockup
            const rawImagesList = Array.isArray(item.images) && item.images.length > 0
                ? item.images
                : (item.imageUrl ? [item.imageUrl] : []);
            const imagesList = rawImagesList.map((img) => sanitizeUrl(img)).filter(Boolean);

            let imageColumnHtml = '';
            if (imagesList.length > 1) {
                const swiperId = `swiper-${String(item.id).replace(/[^a-zA-Z0-9_-]/g, '_')}`;
                imageColumnHtml = `
                    <div class="project-image">
                        <div class="swiper project-swiper" id="${swiperId}">
                            <div class="swiper-wrapper">
                                ${imagesList.map((img, i) => `
                                    <div class="swiper-slide">
                                        <img src="${img}" alt="${safeTitle} - ${i + 1}" loading="${i === 0 ? 'eager' : 'lazy'}">
                                    </div>
                                `).join('')}
                            </div>
                            <div class="swiper-pagination"></div>
                            <div class="swiper-button-prev"></div>
                            <div class="swiper-button-next"></div>
                        </div>
                        <div class="project-badge">${safeBadge}</div>
                    </div>
                `;
            } else if (imagesList.length === 1) {
                imageColumnHtml = `
                    <div class="project-image">
                        <img src="${imagesList[0]}" alt="${safeTitle}" loading="lazy">
                        <div class="project-badge">${safeBadge}</div>
                    </div>
                `;
            } else {
                let domainText = 'system.live';
                try {
                    if (safeDemoUrl) domainText = escapeHtml(new URL(safeDemoUrl).hostname.replace(/^www\./, ''));
                } catch {
                    domainText = 'demo.online';
                }

                imageColumnHtml = `
                    <div class="project-image">
                        <div class="project-mockup-frame">
                            <div class="mockup-window">
                                <div class="mockup-header">
                                    <div class="mockup-dots">
                                        <span class="mockup-dot"></span>
                                        <span class="mockup-dot"></span>
                                        <span class="mockup-dot"></span>
                                    </div>
                                    <span class="mockup-domain">${domainText}</span>
                                </div>
                                <div class="mockup-body">
                                    <div class="mockup-logo-badge">AD</div>
                                    <h4>${safeTitle}</h4>
                                    <p>${escapeHtml(item.categoryLabel || 'نظام رقمي تفاعلي متكامل')}</p>
                                </div>
                            </div>
                        </div>
                        <div class="project-badge">${safeBadge}</div>
                    </div>
                `;
            }

            card.innerHTML = `
                ${imageColumnHtml}
                <div class="project-content">
                    <div>
                        <h3 class="project-title">${safeTitle}</h3>
                        <p class="project-desc">${safeDesc}</p>
                    </div>
                    <div class="tech-stack">${techPills}</div>
                    ${actionBtn}
                </div>
            `;

            grid.appendChild(card);
        });

        // Initialize Swipers for all multi-image cards
        if (typeof Swiper !== 'undefined') {
            visibleItems.forEach((item) => {
                const imagesList = Array.isArray(item.images) && item.images.length > 0
                    ? item.images
                    : (item.imageUrl ? [item.imageUrl] : []);
                if (imagesList.length > 1) {
                    const swiperId = `#swiper-${String(item.id).replace(/[^a-zA-Z0-9_-]/g, '_')}`;
                    const el = query(swiperId, grid);
                    if (el && !el.swiper) {
                        new Swiper(el, {
                            loop: true,
                            speed: 550,
                            autoplay: {
                                delay: 3500,
                                disableOnInteraction: false,
                            },
                            pagination: {
                                el: query('.swiper-pagination', el),
                                clickable: true,
                            },
                            navigation: {
                                nextEl: query('.swiper-button-next', el),
                                prevEl: query('.swiper-button-prev', el),
                            },
                        });
                    }
                }
            });
        }

        // Update toggle button text if exists
        const toggleBtn = query('#toggleProjectsBtn');
        if (toggleBtn) {
            toggleBtn.innerHTML = isShowingAll
                ? '<span>عرض المشاريع الرئيسية فقط ▴</span>'
                : `<span>عرض كافة المشاريع والمنصات (${items.length}) ▾</span>`;
        }
    }

    // 3. Add Show All Button at bottom of work section
    let showMoreWrapper = query('.show-more-projects-wrapper', workSection);
    if (!showMoreWrapper && items.length > 4) {
        showMoreWrapper = document.createElement('div');
        showMoreWrapper.className = 'show-more-projects-wrapper';
        showMoreWrapper.innerHTML = `
            <button type="button" id="toggleProjectsBtn" class="btn btn-outline" style="cursor: pointer; padding: 0.75rem 2rem; font-size: 0.9rem; font-weight: 600;">
                <span>عرض كافة المشاريع والمنصات (${items.length}) ▾</span>
            </button>
        `;
        grid.after(showMoreWrapper);

        const btn = query('#toggleProjectsBtn', showMoreWrapper);
        btn?.addEventListener('click', () => {
            isShowingAll = !isShowingAll;
            filterBar.style.display = isShowingAll ? 'flex' : 'none';
            if (isShowingAll) {
                activeCategory = 'all';
                filterBar.querySelectorAll('.filter-btn').forEach((b, idx) => {
                    b.classList.toggle('active', idx === 0);
                });
            }
            renderCards();
            if (isShowingAll) {
                filterBar.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    }

    // Initial render of 4 projects
    renderCards();
}

function init() {
    initTheme();
    initMobileMenu();
    initNavbar();
    initScrollReveal();
    initProjectSlider();
    initContactForm();
    initCertificateModal('openCertBtn', 'closeCertBtn', 'certModal');
    initCertificateModal('openBusinessCertBtn', 'closeBusinessCertBtn', 'businessCertModal');
    initCodeTyping();
    initDynamicProjects();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
    init();
}
