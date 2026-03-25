'use strict';

//Toggle Function

const elemToggleFunc = function (elem) { elem.classList.toggle('active'); }


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

//-------------------------------------------------------------------------------Premium Gradient Background------------------------------

function initPremiumBackground() {
    // Remove particles
    const particlesEl = document.querySelector('.particles-js');
    if (particlesEl) particlesEl.style.display = 'none';

    // Create background layer (UNDER everything)
    let bgLayer = document.getElementById('premium-bg-layer');
    if (!bgLayer) {
        bgLayer = document.createElement('div');
        bgLayer.id = 'premium-bg-layer';
        bgLayer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: -1;
            pointer-events: none;
        `;
        document.body.insertBefore(bgLayer, document.body.firstChild);
    }

    // Function to apply correct background
    function applyPremiumBackground() {
        const isDark = document.body.classList.contains('dark-theme');

        if (isDark) {
            // DARK MODE (IKKE ENDRET - DIN EXISTING)
            bgLayer.style.background = `
                radial-gradient(ellipse 800px 600px at 20% 30%, rgba(99, 102, 241, 0.18), transparent),
                radial-gradient(ellipse 700px 550px at 80% 20%, rgba(168, 85, 247, 0.15), transparent),
                radial-gradient(ellipse 750px 580px at 50% 70%, rgba(236, 72, 153, 0.16), transparent),
                radial-gradient(ellipse 650px 500px at 15% 85%, rgba(6, 182, 212, 0.14), transparent),
                #0f0a1e
            `;
        } else {
            // LIGHT MODE (NY - PURE WHITE!)
            bgLayer.style.background = `
                radial-gradient(ellipse 1200px 900px at 50% 50%, rgba(248, 250, 252, 0.8), transparent 70%),
                linear-gradient(180deg, #ffffff 0%, #fafafa 50%, #ffffff 100%)
            `;
        }

        bgLayer.style.backgroundAttachment = 'fixed';
    }

    // Apply on load
    applyPremiumBackground();

    // Watch for theme changes
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
                applyPremiumBackground();
            }
        });
    });

    observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['class']
    });

    // Smooth color shift (ON THE LAYER, NOT BODY!)
    let time = 0;
    function smoothShift() {
        time += 0.0002;
        const hue = Math.sin(time) * 10;
        const sat = 1 + Math.sin(time * 0.7) * 0.05;
        bgLayer.style.filter = `hue-rotate(${hue}deg) saturate(${sat})`;
        requestAnimationFrame(smoothShift);
    }
    smoothShift();

    console.log('✅ Premium gradient background initialized');
}

// Initialize premium background
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPremiumBackground);
} else {
    initPremiumBackground();
}









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





function initStatusMonitor() {
    const monitor = document.getElementById('statusMonitor');
    if (!monitor) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setTimeout(() => monitor.classList.add('open'), 300);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    observer.observe(document.getElementById('aboutBanner'));
}

document.addEventListener('DOMContentLoaded', initStatusMonitor);




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


