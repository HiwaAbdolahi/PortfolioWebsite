'use strict';

//Toggle Function

const elemToggleFunc = function (elem) { elem.classList.toggle('active'); }

// Header Sticky & Go-Top

const header = document.querySelector('[data-header]');
const goTopBtn = document.querySelector('[data-go-top]');
window.addEventListener('scroll', function () {
    if (window.scrollY >= 10) { header.classList.add('active'); goTopBtn.classList.add('active'); }
    else { header.classList.remove('active'); goTopBtn.classList.remove('active'); }
});

// Mobile Menu

const navToggleBtn = document.querySelector('[data-nav-toggle-btn]');
const navbar = document.querySelector('[data-navbar]');

navToggleBtn.addEventListener('click', function () {
    elemToggleFunc(navToggleBtn);
    elemToggleFunc(navbar);
    elemToggleFunc(document.body);
})

// Skills Toggling Button

const toggleBtnBox = document.querySelector('[data-toggle-box]');
const toggleBtns = document.querySelectorAll('[data-toggle-btn]');
const skillsBox = document.querySelector('[data-skills-box]');

for (let i = 0; i < toggleBtns.length; i++) {
    toggleBtns[i].addEventListener('click', function () {
        elemToggleFunc(toggleBtnBox);

        for (let i = 0; i < toggleBtns.length; i++) { elemToggleFunc(toggleBtns[i]); }
        elemToggleFunc(skillsBox);
    });
}

// Dark & Light Theme Toggle

const themeToggleBtn = document.querySelector('[data-theme-btn]');

themeToggleBtn.addEventListener('click', function () {
    elemToggleFunc(themeToggleBtn);

    if (themeToggleBtn.classList.contains('active')) {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');

        localStorage.setItem('theme', 'light-theme');
    } else {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');

        localStorage.setItem('theme', 'dark-theme');
    }
})

//Applying Theme kept in Local Storage 

if (localStorage.getItem('theme') === 'light-theme') {
    themeToggleBtn.classList.add('active');
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
} else {
    themeToggleBtn.classList.remove('active');
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
}




//-------------------------------------------------------------------------------Background------------------------------



window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.querySelector('.particles-js');

    // 1) Ta 2D-konteksten FØRST
    const ctx = canvas.getContext('2d', {
        willReadFrequently: true,
        alpha: true,
        desynchronized: false
    });

    // 2) DPR-sikker sizing 
    function fitCanvas() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        const bw = Math.ceil(w * dpr);
        const bh = Math.ceil(h * dpr);
        if (canvas.width !== bw || canvas.height !== bh) {
            canvas.width = bw;
            canvas.height = bh;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0); 
            ctx.clearRect(0, 0, w, h);              
        }
    }
    fitCanvas();
    window.addEventListener('resize', fitCanvas);

    // 3) Start Particles ETTER at canvas/ctx er låst til CPU-path
    Particles.init({
        selector: '.particles-js',
        color: ['#ff9000', '#ff0266', '#00ffff'],
        connectParticles: true,
        speed: 0.3,
        maxParticles: 120,
        responsive: [
            {
                breakpoint: 1000,
                options: {
                    speed: 0.6,
                    color: ['#ff9000', '#ff0266', '#00ffff', '#15ff00'],
                    maxParticles: 63,
                    connectParticles: false
                }
            }
        ]
    });
});










                                                        /* Mobile justeringer for sats card Hiwa */


const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            
        }
    });
}, {
    threshold: 0.3
});

document.querySelectorAll('.stats-card').forEach(card => {
    observer.observe(card);
});



/*--------------------------------------------------------Fiks: Lukk meny automatisk når klikkes i mobilversjon-----------------------*/
const navLinks = document.querySelectorAll('.navbar-link');

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (navbar.classList.contains('active')) {
            navToggleBtn.classList.remove('active');
            navbar.classList.remove('active');
            document.body.classList.remove('active');
        }
    });
});




document.addEventListener("DOMContentLoaded", function () {
    const chatInput = document.getElementById("chat-input");
    const chatSend = document.getElementById("chat-send");
    const chatMessages = document.getElementById("chat-messages");
    const toggleBtn = document.getElementById("chat-toggle");
    const chatWidget = document.getElementById("chat-widget");
    const closeBtn = document.getElementById("chat-close");
    const minimizeBtn = document.getElementById("chat-minimize");

    const sessionId = "session-" + Date.now();

    // --- Breakpoint helpers ---
    const isMobile = () =>
        window.matchMedia("(max-width:768px)").matches ||
        window.matchMedia("(pointer: coarse)").matches;

    // --------------------------------
    // Scroll-lock (robust iOS-vennlig)
    // --------------------------------
    let _isLocked = false;
    let _scroll = { x: 0, y: 0 };

    function lockBodyScroll(lock) {
        const b = document.body;

        if (lock) {
            if (_isLocked) return;
            _scroll.x = window.pageXOffset || window.scrollX || 0;
            _scroll.y = window.pageYOffset || window.scrollY || 0;

            b.style.position = 'fixed';
            b.style.top = `-${_scroll.y}px`;
            b.style.left = `-${_scroll.x}px`;
            b.style.right = '0';
            b.style.width = '100%';
            b.style.overflow = 'hidden';

            _isLocked = true;
            return;
        }

        if (!_isLocked) return;

        const y = -parseInt(b.style.top || '0', 10) || 0;
        const x = -parseInt(b.style.left || '0', 10) || 0;

        const root = document.documentElement;
        const prevBehavior = root.style.scrollBehavior;
        root.style.scrollBehavior = 'auto';

        b.style.position = '';
        b.style.top = '';
        b.style.left = '';
        b.style.right = '';
        b.style.width = '';
        b.style.overflow = '';

        window.scrollTo(x, y);
        setTimeout(() => { root.style.scrollBehavior = prevBehavior; }, 0);

        _isLocked = false;
    }

    // Blokker bakgrunns-scroll på touch‑enheter (ikke desktop)
    function stopBgTouch(e) {
        if (!chatWidget.classList.contains('active')) return;
        if (!chatWidget.contains(e.target)) e.preventDefault();
    }
    if (window.matchMedia("(pointer: coarse)").matches) {
        document.addEventListener('touchmove', stopBgTouch, { passive: false });
    }

    // -----------------
    // UI-hjelpefunksjoner
    // -----------------
    function isNearBottom(el, threshold = 64) {
        return (el.scrollHeight - el.scrollTop - el.clientHeight) < threshold;
    }
    function scrollToBottomIfNeeded() {
        if (isNearBottom(chatMessages)) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
    function addMessage(content, sender) {
        const messageDiv = document.createElement("div");
        messageDiv.className = sender;
        messageDiv.textContent = content;
        chatMessages.appendChild(messageDiv);
        scrollToBottomIfNeeded();
    }

    // -------------
    // Åpne/Lukke UI
    // -------------
    function openChat() {
        chatWidget.classList.add("active");
        chatWidget.classList.remove("minimized");
        toggleBtn.style.display = "none";

        // Lås bare på mobil
        if (isMobile()) lockBodyScroll(true);

        requestAnimationFrame(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
            if (isMobile()) {
                try { chatInput.focus({ preventScroll: true }); }
                catch { chatInput.focus(); }
            } else {
                chatInput.focus();
            }
        });
    }

    function closeChat() {
        chatWidget.classList.remove("active", "minimized");
        toggleBtn.style.display = "flex";

        document.documentElement.style.setProperty('--keyboard', '0px');
        chatMessages.style.paddingBottom = '14px';

        // Kun delay ved mobil/keyboard; på desktop unlock umiddelbart
        if (isMobile() && _keyboardPx > 0) {
            setTimeout(() => lockBodyScroll(false), 250);
        } else {
            lockBodyScroll(false);
        }
    }

    function toggleMinimize() {
        const isMin = chatWidget.classList.contains('minimized');

        if (isMin) {
            chatWidget.classList.remove('minimized');
            openChat();
        } else {
            chatWidget.classList.remove('active');
            chatWidget.classList.add('minimized');

            document.documentElement.style.setProperty('--keyboard', '0px');
            chatMessages.style.paddingBottom = '14px';

            if (isMobile() && _keyboardPx > 0) {
                setTimeout(() => lockBodyScroll(false), 250);
            } else {
                lockBodyScroll(false);
            }

            toggleBtn.style.display = 'none';
        }
    }

    // Rebind (sikkert)
    minimizeBtn?.removeEventListener("click", toggleMinimize);
    minimizeBtn?.addEventListener("click", toggleMinimize);

    // --------------
    // Event bindinger
    // --------------
    toggleBtn?.addEventListener("click", openChat);
    closeBtn?.addEventListener("click", closeChat);

    chatSend?.addEventListener("click", sendMessage);
    chatInput?.addEventListener("keypress", function (e) {
        if (e.key === "Enter") sendMessage();
    });

    // Hold lås kun på mobil når input får fokus
    chatInput?.addEventListener('focus', () => {
        if (chatWidget.classList.contains('active') && isMobile()) lockBodyScroll(true);
    });

    // -------------------------------
    // VisualViewport (keyboard-aware)
    // -------------------------------
    let _keyboardPx = 0;

    if (window.visualViewport) {
        const vv = window.visualViewport;
        const onVVChange = () => {
            _keyboardPx = Math.max(0, (window.innerHeight - vv.height - vv.offsetTop));
            document.documentElement.style.setProperty('--keyboard', _keyboardPx + 'px');
            chatMessages.style.paddingBottom = (_keyboardPx + 24) + 'px';
            scrollToBottomIfNeeded();
        };
        vv.addEventListener('resize', onVVChange);
        vv.addEventListener('scroll', onVVChange);
    }

    // ----------- Send melding ----------
    async function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        addMessage("🧑‍💻 " + message, "user");
        chatInput.value = "";

        try {
            const response = await fetch("/api/Chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: message, sessionId })
            });
            const data = await response.json();
            const reply = data.choices?.[0]?.message?.content || "⚠️ Ingen svar.";
            addMessage("🤖 " + reply, "bot");
        } catch (err) {
            addMessage("⚠️ Nettverksfeil. Prøv igjen.", "bot");
        }

        // Hold lås aktiv på mobil mens chatten er åpen
        if (chatWidget.classList.contains('active') && isMobile()) {
            lockBodyScroll(true);
        }
    }

    // Lukker tastatur på iOS når man trykker i meldingslisten
    chatMessages?.addEventListener('pointerdown', () => {
        if (document.activeElement === chatInput) chatInput.blur();
    });

    // Hvis vinduet krysser breakpoint mens chatten er åpen
    window.addEventListener('resize', () => {
        if (!chatWidget.classList.contains('active')) return;
        if (!isMobile() && _isLocked) {
            // Gikk over til desktop: tillat scroll
            lockBodyScroll(false);
        } else if (isMobile() && !_isLocked) {
            // Tilbake til mobil: re‑lock
            lockBodyScroll(true);
        }
    });
});


