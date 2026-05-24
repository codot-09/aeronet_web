document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', String(isOpen));
        });

        document.querySelectorAll('#nav-menu a').forEach((link) => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });

        document.addEventListener('click', (event) => {
            const clickedInsideMenu = navMenu.contains(event.target);
            const clickedToggle = navToggle.contains(event.target);
            if (!clickedInsideMenu && !clickedToggle) {
                navMenu.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Scroll reveal animation
    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        {
            root: null,
            threshold: 0.12
        }
    );

    document.querySelectorAll('.scroll-reveal').forEach((el) => revealObserver.observe(el));

    // Smooth scrolling for internal anchors
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function handleScroll(event) {
            const href = this.getAttribute('href');
            if (!href || href.length < 2) {
                return;
            }

            const target = document.querySelector(href);
            if (!target) {
                return;
            }

            event.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    // Active nav link by section
    const navLinks = Array.from(document.querySelectorAll('.nav-link'));
    const sectionIds = navLinks
        .map((link) => link.getAttribute('href') || '')
        .filter((href) => href.startsWith('#') && href.length > 1)
        .map((href) => href.slice(1));
    const sectionElements = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);

    if (sectionElements.length && navLinks.length) {
        const sectionObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    const sectionId = entry.target.getAttribute('id');
                    if (!sectionId) {
                        return;
                    }
                    navLinks.forEach((link) => {
                        const isActive = link.getAttribute('href') === `#${sectionId}`;
                        link.classList.toggle('active', Boolean(isActive));
                    });
                });
            },
            {
                rootMargin: '-35% 0px -45% 0px',
                threshold: 0.1
            }
        );

        sectionElements.forEach((section) => sectionObserver.observe(section));
    }

    // Waitlist form submit
    const waitlistForm = document.getElementById('waitlist-form');
    if (waitlistForm) {
        waitlistForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const statusEl = document.getElementById('waitlist-message');
            const formData = new FormData(waitlistForm);
            const contact = formData.get('contact')?.toString().trim() || '';

            const setStatus = (text, type) => {
                if (!statusEl) {
                    return;
                }
                statusEl.textContent = text;
                statusEl.classList.remove('pending', 'success', 'error');
                if (type) {
                    statusEl.classList.add(type);
                }
            };

            if (!contact) {
                setStatus('Iltimos, email yoki telefon kiriting.', 'error');
                return;
            }

            const normalizedContact = contact.replace(/\s+/g, ' ');
            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedContact);
            const compactPhone = normalizedContact.replace(/[\s\-()]/g, '');
            const isPhone = /^\+?\d{9,15}$/.test(compactPhone);

            if (!isEmail && !isPhone) {
                setStatus('Kontakt formati noto‘g‘ri. Email yoki telefon kiriting.', 'error');
                return;
            }

            setStatus('Yuborilmoqda...', 'pending');

            const SUPABASE_URL = 'https://wbcrktxuzgcdtgasgvtx.supabase.co';
            const SUPABASE_ANON_KEY = 'sb_publishable_tmJMM2mM9sEYu72HRknW4g_v5X0THGS';

            try {
                const response = await fetch(`${SUPABASE_URL}/rest/v1/contacts`, {
                    method: 'POST',
                    headers: {
                        apikey: SUPABASE_ANON_KEY,
                        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        Prefer: 'return=minimal'
                    },
                    body: JSON.stringify({
                        contact: normalizedContact
                    })
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(errorText || response.statusText);
                }

                setStatus("So'rovingiz qabul qilindi! Tez orada bog'lanamiz.", 'success');
                waitlistForm.reset();
            } catch (error) {
                console.error(error);
                setStatus("Xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko'ring.", 'error');
            }
        });
    }
});
