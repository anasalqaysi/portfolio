const CONTACT_EMAIL = 'contact@anasalqaysi.tech';
const FORM_ENDPOINT = 'https://formsubmit.co/ajax/ca5739aa2f14d0de06a690aa6c86d82d';

const query = (selector, parent = document) => parent.querySelector(selector);
const queryAll = (selector, parent = document) => [...parent.querySelectorAll(selector)];

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
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
    init();
}
