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

    // --- Enkelt mobil-sjekk
    const isMobile = () =>
        window.matchMedia("(max-width: 768px)").matches ||
        ("ontouchstart" in window || navigator.maxTouchPoints > 0);

    // --- iOS keyboard offset -> --kb 
    const vv = window.visualViewport;
    const updateKbOffset = () => {
        if (!vv) return;
        const kb = Math.max(0, (window.innerHeight - vv.height) * vv.scale);
        document.documentElement.style.setProperty("--kb", kb > 0 ? `${kb}px` : "0px");
    };
    if (vv) {
        vv.addEventListener("resize", updateKbOffset, { passive: true });
        vv.addEventListener("scroll", updateKbOffset, { passive: true });
        window.addEventListener("orientationchange", () => setTimeout(updateKbOffset, 120), { passive: true });
        updateKbOffset();
    }

    // --- Scroll-lås uten jumps: kun overflow hidden på mobil
    const lockBg = () => { if (isMobile()) document.body.classList.add("chat-open"); };
    const unlockBg = () => document.body.classList.remove("chat-open");

    // --- Åpne / Lukk / Minimer
    const openChat = () => {
        chatWidget.classList.add("active");
        chatWidget.classList.remove("minimized");
        toggleBtn.style.display = "none";
        lockBg();
    };
    const closeChat = () => {
        chatWidget.classList.remove("active", "minimized");
        toggleBtn.style.display = "flex";
        unlockBg();
        updateKbOffset();
    };
    const toggleMinimize = () => {
        chatWidget.classList.toggle("minimized");
        if (chatWidget.classList.contains("minimized")) {
            // når minimert: la bakgrunn scrolle på mobil
            unlockBg();
        } else {
            lockBg();
        }
    };

   
    ["touchstart", "pointerdown"].forEach(ev =>
        toggleBtn.addEventListener(ev, () => { }, { passive: true, once: true })
    );

    toggleBtn.addEventListener("click", openChat);
    closeBtn.addEventListener("click", closeChat);
    minimizeBtn.addEventListener("click", toggleMinimize);

    // Tilgjengelighet for minimize-span
    minimizeBtn.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleMinimize(); }
    });

    // ---- Input fokus/blur (ingen scrollIntoView for å unngå hopp)
    chatInput.addEventListener("focus", () => setTimeout(updateKbOffset, 0));
    chatInput.addEventListener("blur", () => setTimeout(updateKbOffset, 120));

    // ---- Sending
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



