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
















document.addEventListener("DOMContentLoaded", () => {
    const chatInput = document.getElementById("chat-input");
    const chatSend = document.getElementById("chat-send");
    const chatMessages = document.getElementById("chat-messages");
    const toggleBtn = document.getElementById("chat-toggle");
    const chatWidget = document.getElementById("chat-widget");
    const closeBtn = document.getElementById("chat-close");
    const minimizeBtn = document.getElementById("chat-minimize");

    const sessionId = "session-" + Date.now();

    // --- mobil-deteksjon (konservativ) ---
    const isMobile = () =>
        window.matchMedia("(max-width: 768px)").matches ||
        ("ontouchstart" in window || navigator.maxTouchPoints > 0);

    // --- iOS tastatur-offset -> --kb (med støyfilter) ---
    const vv = window.visualViewport;
    let lastKb = 0;
    const KBD_THRESHOLD = 40;  // < 40px = sannsynlig toolbar, ikke keyboard

    const updateKbOffset = () => {
        if (!vv) return;
        // hvor mye av vinduet som "forsvinner"
        let diff = Math.round((window.innerHeight - vv.height) * (vv.scale || 1));
        if (diff < KBD_THRESHOLD) diff = 0;     // ignorer små hopp
        if (diff !== lastKb) {
            lastKb = diff;
            document.documentElement.style.setProperty("--kb", diff ? `${diff}px` : "0px");
        }
    };

    if (vv) {
        const debounced = (() => {
            let t;
            return () => { clearTimeout(t); t = setTimeout(updateKbOffset, 50); };
        })();
        vv.addEventListener("resize", debounced, { passive: true });
        vv.addEventListener("scroll", debounced, { passive: true });
        window.addEventListener("orientationchange", () => setTimeout(updateKbOffset, 120), { passive: true });
        updateKbOffset();
    }

    // --- bakgrunns-scroll: lås kun på mobil når chat er åpen ---
    const lockBg = () => { if (isMobile()) document.body.classList.add("chat-open"); };
    const unlockBg = () => document.body.classList.remove("chat-open");

    // --- åpne/lukke/minimere ---
    const openChat = () => {
        chatWidget.classList.add("active");
        chatWidget.classList.remove("minimized");
        toggleBtn.style.display = "none";
        lockBg();          // på mobil
        // sett kb én gang til etter layout
        setTimeout(updateKbOffset, 0);
    };

    const closeChat = () => {
        chatWidget.classList.remove("active", "minimized");
        toggleBtn.style.display = "flex";
        unlockBg();
        // vent litt så Safari rekker å skjule tastatur før vi nuller offset
        setTimeout(updateKbOffset, 120);
    };

    const toggleMinimize = () => {
        chatWidget.classList.toggle("minimized");
        if (chatWidget.classList.contains("minimized")) {
            unlockBg();      // tillat scrolling når minimert
        } else {
            lockBg();
        }
        setTimeout(updateKbOffset, 0);
    };

    // Første tapp-problem: lytt også på pointer/touch
    const openOnce = () => openChat();
    toggleBtn.addEventListener("pointerup", openOnce, { passive: true });
    toggleBtn.addEventListener("touchend", openOnce, { passive: true });
    toggleBtn.addEventListener("click", openOnce);

    closeBtn.addEventListener("click", closeChat);
    minimizeBtn.addEventListener("click", toggleMinimize);
    minimizeBtn.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleMinimize(); }
    });

    // Fokus/blur – ikke scrollIntoView (gir hopp), bare oppdater offset
    chatInput.addEventListener("focus", () => setTimeout(updateKbOffset, 0));
    chatInput.addEventListener("blur", () => setTimeout(updateKbOffset, 160));

    // --- meldinger ---
    chatSend.addEventListener("click", sendMessage);
    chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") { e.preventDefault(); sendMessage(); }
    });

    function addMessage(content, sender) {
        const el = document.createElement("div");
        el.className = sender;
        el.textContent = content;
        chatMessages.appendChild(el);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;
        addMessage("🧑‍💻 " + message, "user");
        chatInput.value = "";
        try {
            const res = await fetch("/api/Chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: message, sessionId })
            });
            const data = await res.json();
            const reply = data.choices?.[0]?.message?.content || "⚠️ Ingen svar.";
            addMessage("🤖 " + reply, "bot");
        } catch (err) {
            console.error(err);
            addMessage("⚠️ Nettverksfeil – prøv igjen.", "bot");
        }
    }
});




