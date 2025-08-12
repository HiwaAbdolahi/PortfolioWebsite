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

    // ---- Hjelpere ----
    const isMobile = () =>
        window.matchMedia("(max-width: 768px)").matches ||
        ("ontouchstart" in window || navigator.maxTouchPoints > 0);

    let _scrollY = 0;
    function lockBodyScroll() {
        if (!isMobile()) return;                  // aldri lås på desktop
        _scrollY = window.scrollY || 0;
        document.body.style.top = `-${_scrollY}px`;
        document.body.style.position = "fixed";
        document.body.classList.add("chat-open");
    }
    function unlockBodyScroll() {
        document.body.classList.remove("chat-open");
        document.body.style.position = "";
        document.body.style.top = "";
        if (_scrollY) window.scrollTo(0, _scrollY);
    }

    // iOS keyboard offset -> --kb
    const vv = window.visualViewport;
    function updateKbOffset() {
        if (!vv) return;
        const kb = Math.max(0, (window.innerHeight - vv.height) * vv.scale);
        document.documentElement.style.setProperty("--kb", kb > 0 ? `${kb}px` : "0px");
    }
    if (vv) {
        vv.addEventListener("resize", updateKbOffset);
        vv.addEventListener("scroll", updateKbOffset);
        window.addEventListener("orientationchange", () => setTimeout(updateKbOffset, 150));
        updateKbOffset();
    }

    // ---- Åpne/Lukk/Minimer ----
    function openChat() {
        chatWidget.classList.add("active");
        chatWidget.classList.remove("minimized");
        toggleBtn.style.display = "none";
        lockBodyScroll();                          // lås kun på mobil
        setTimeout(() => chatWidget.scrollIntoView({ block: "end", behavior: "smooth" }), 0);
    }
    function closeChat() {
        chatWidget.classList.remove("active");
        chatWidget.classList.remove("minimized");
        toggleBtn.style.display = "flex";
        unlockBodyScroll();                        // alltid lås opp ved lukking
        updateKbOffset();
    }
    function toggleMinimize() {
        chatWidget.classList.toggle("minimized");
        // Når minimert: tillat side-scroll på mobil
        if (chatWidget.classList.contains("minimized")) {
            unlockBodyScroll();
        } else {
            lockBodyScroll();
        }
    }

    toggleBtn.addEventListener("click", openChat);
    closeBtn.addEventListener("click", closeChat);
    minimizeBtn.addEventListener("click", toggleMinimize);

    // ---- Input fokus/blur ----
    chatInput.addEventListener("focus", () => {
        setTimeout(() => {
            chatWidget.scrollIntoView({ block: "end", behavior: "smooth" });
            updateKbOffset();
        }, 0);
    });
    chatInput.addEventListener("blur", () => setTimeout(updateKbOffset, 120));

    // ---- Sending ----
    chatSend.addEventListener("click", sendMessage);
    chatInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            sendMessage();
        }
    });

    function addMessage(content, sender) {
        const messageDiv = document.createElement("div");
        messageDiv.className = sender;
        messageDiv.textContent = content;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

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
            addMessage("⚠️ Nettverksfeil – prøv igjen.", "bot");
            console.error(err);
        }
    }
});


