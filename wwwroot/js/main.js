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
                    connectParticles: false,
                },
            },
        ],
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
    const mmMobile = window.matchMedia("(max-width: 768px)");
    let vv = window.visualViewport || null;
    let kbOpen = false;            // om tastatur “regnes” som åpent
    let nearBottomFlag = true;     // husker nær-bunn-status før resize
    let vvTimer = null;            // debounce timer

    // ---------- helpers ----------
    function lockBodyScroll(lock) {
        const html = document.documentElement;
        if (lock) { html.style.overflow = 'hidden'; document.body.style.overflow = 'hidden'; }
        else { html.style.overflow = ''; document.body.style.overflow = ''; }
    }

    function isNearBottom(el, threshold = 64) {
        return (el.scrollHeight - el.scrollTop - el.clientHeight) < threshold;
    }

    function scrollToBottom(force = false) {
        if (force || isNearBottom(chatMessages)) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    function setKeyboardOffset(px) {
        document.documentElement.style.setProperty('--keyboard', `${px}px`);
        chatMessages.style.paddingBottom = `${px + 24}px`;
    }

    function resetKeyboardOffset() {
        setKeyboardOffset(0);
    }

    // ---------- open/close/minimize ----------
    function openChat() {
        chatWidget.classList.add("active");
        chatWidget.classList.remove("minimized");
        toggleBtn.style.display = "none";
        lockBodyScroll(true);
        requestAnimationFrame(() => {
            scrollToBottom(true);
            // ikke auto‑focus for desktop; for mobil er det ok:
            if (mmMobile.matches) chatInput.focus({ preventScroll: true });
        });
    }

    function closeChat() {
        chatWidget.classList.remove("active", "kb-active");
        chatWidget.classList.remove("minimized");
        toggleBtn.style.display = "flex";
        lockBodyScroll(false);
        kbOpen = false;
        resetKeyboardOffset();
    }

    function toggleMinimize() {
        const isMin = chatWidget.classList.contains('minimized');
        if (isMin) {
            chatWidget.classList.remove('minimized');
            openChat();
        } else {
            chatWidget.classList.remove('active', 'kb-active');
            chatWidget.classList.add('minimized');
            lockBodyScroll(false);
            kbOpen = false;
            resetKeyboardOffset();
            toggleBtn.style.display = 'none'; // behold bare dock‑baren
        }
    }

    toggleBtn.addEventListener("click", openChat);
    closeBtn.addEventListener("click", closeChat);
    minimizeBtn?.addEventListener("click", toggleMinimize);

    chatSend.addEventListener("click", sendMessage);
    chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendMessage();
    });

    // ---------- VisualViewport (keyboard-aware) ----------
    function computeKeyboard() {
        // bruk bare på mobil + når input (eller composer) har fokus
        if (!mmMobile.matches) return resetKeyboardOffset();

        const active = document.activeElement;
        const focusIsComposer = active === chatInput || active === chatSend;

        if (!vv || !focusIsComposer || !chatWidget.classList.contains('active')) {
            kbOpen = false;
            chatWidget.classList.remove('kb-active');
            return resetKeyboardOffset();
        }

        // real offset (innerHeight - vv.height - vv.offsetTop)
        const delta = Math.max(0, (window.innerHeight - vv.height - vv.offsetTop));

        // regnes som åpent først når vi ser > 60px endring (filtrerer adressefelt/toolbar)
        kbOpen = delta > 60;

        if (kbOpen) {
            chatWidget.classList.add('kb-active');
            setKeyboardOffset(delta);
            // hold bunn dersom bruker var nær bunn
            if (nearBottomFlag) scrollToBottom(true);
        } else {
            chatWidget.classList.remove('kb-active');
            resetKeyboardOffset();
        }
    }

    function debouncedVVChange() {
        // husk status før resize
        nearBottomFlag = isNearBottom(chatMessages);
        if (vvTimer) clearTimeout(vvTimer);
        // liten delay spiller godt med iOS som rapporterer i flere steg
        vvTimer = setTimeout(computeKeyboard, 80);
    }

    if (vv) {
        vv.addEventListener('resize', debouncedVVChange);
        vv.addEventListener('scroll', debouncedVVChange);
    }

    // Focus/blur på input styrer når vi “aktiverer” keyboard‑modusen
    chatInput.addEventListener('focus', () => {
        nearBottomFlag = isNearBottom(chatMessages);
        debouncedVVChange();               // gjør en første måling
        setTimeout(() => scrollToBottom(true), 120); // sørg for bunn etter iOS “hopp”
    });

    chatInput.addEventListener('blur', () => {
        // iOS sender blur før viewport er ferdig; vent litt, nullstill så
        setTimeout(() => { kbOpen = false; chatWidget.classList.remove('kb-active'); resetKeyboardOffset(); }, 120);
    });

    // orientasjon / historikk
    window.addEventListener('orientationchange', () => {
        setTimeout(() => { kbOpen = false; resetKeyboardOffset(); scrollToBottom(true); }, 200);
    });
    window.addEventListener('pageshow', () => { resetKeyboardOffset(); });

    // trykk i meldingsområdet lukker tastatur
    chatMessages.addEventListener('pointerdown', () => {
        if (document.activeElement === chatInput) chatInput.blur();
    });

    // ---------- send message ----------
    async function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        addMessage("🧑‍💻 " + message, "user");
        chatInput.value = "";
        scrollToBottom(true);

        try {
            const response = await fetch("/api/Chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: message, sessionId })
            });
            const data = await response.json();
            const reply = data.choices?.[0]?.message?.content || "⚠️ Ingen svar.";
            addMessage("🤖 " + reply, "bot");
        } catch {
            addMessage("⚠️ Nettverksfeil. Prøv igjen.", "bot");
        } finally {
            // etter send: hold fokus og vis tastatur igjen uten å hoppe
            if (mmMobile.matches) {
                chatInput.focus({ preventScroll: true });
                setTimeout(() => scrollToBottom(true), 80);
            }
        }
    }

    // ---------- message append ----------
    function addMessage(content, sender) {
        const el = document.createElement("div");
        el.className = sender;
        el.textContent = content;
        chatMessages.appendChild(el);
        scrollToBottom(); // bare om bruker var nær bunn
    }
});

