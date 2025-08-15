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

    // --------------------------------
    // Scroll-lock (robust iOS-vennlig)
    // --------------------------------
    let _scrollY = 0;
    let _isLocked = false;

    function lockBodyScroll(lock) {
        const html = document.documentElement;

        if (lock) {
            if (_isLocked) return; // allerede låst
            _scrollY = window.scrollY || 0;
            document.body.style.setProperty('--scroll-lock-top', `-${_scrollY}px`);
            html.classList.add('chat-open');
            document.body.classList.add('chat-open');
            _isLocked = true;
        } else {
            if (!_isLocked) return; // allerede ulåst
            document.body.classList.remove('chat-open');
            html.classList.remove('chat-open');
            document.body.style.removeProperty('--scroll-lock-top');
            _isLocked = false;
            window.scrollTo(0, _scrollY); // tilbake til eksakt posisjon
        }
    }


    // Blokker “bakgrunns-scroll” under overlay (iOS inertial)
    function stopBgTouch(e) {
        if (!chatWidget.classList.contains('active')) return;
        if (!chatWidget.contains(e.target)) e.preventDefault();
    }
    document.addEventListener('touchmove', stopBgTouch, { passive: false });

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

        lockBodyScroll(true);

        // sikre autoscroll + fokuser uten å “skubbe” bakgrunn
        requestAnimationFrame(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
            if (window.matchMedia("(max-width:768px)").matches) {
                // iOS: unngå scroll-jump ved fokus
                try {
                    chatInput.focus({ preventScroll: true });
                } catch {
                    chatInput.focus();
                }
            } else {
                chatInput.focus();
            }
        });
    }

    function closeChat() {
        chatWidget.classList.remove("active", "minimized");
        toggleBtn.style.display = "flex";

        // nullstill keyboard-offset
        document.documentElement.style.setProperty('--keyboard', '0px');
        chatMessages.style.paddingBottom = '14px';

        // Vent litt så iOS rekker å lukke tastatur og adresselinje
        setTimeout(() => lockBodyScroll(false), 250);
    }

    function toggleMinimize() {
        const isMin = chatWidget.classList.contains('minimized');

        if (isMin) {
            chatWidget.classList.remove('minimized');
            openChat(); // låser + fokuserer
        } else {
            // fra aktiv -> minimert dock
            chatWidget.classList.remove('active');
            chatWidget.classList.add('minimized');

            // nullstill keyboard-offset
            document.documentElement.style.setProperty('--keyboard', '0px');
            chatMessages.style.paddingBottom = '14px';

            // la dock-baren være synlig, men lås opp etter keyboard-anim
            setTimeout(() => lockBodyScroll(false), 250);

            // vi bruker bare dock-baren — agentknappen skjules
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

    // Når input får/ mister fokus: IKKE lås opp body her.
    // Vi vil holde bakgrunnen frosset så lenge chatten er åpen.
    chatInput?.addEventListener('focus', () => {
        // sørg for at vi er låst hvis bruker åpner tastatur via fokus
        if (chatWidget.classList.contains('active')) lockBodyScroll(true);
    });
    chatInput?.addEventListener('blur', () => {
        // ikke unlock her; close/minimize håndterer unlock med delay
    });

    // -------------------------------
    // VisualViewport (keyboard-aware)
    // -------------------------------
    if (window.visualViewport) {
        const vv = window.visualViewport;

        const onVVChange = () => {
            // Høyde "spist" av tastatur/adresselinje
            const keyboard = Math.max(0, (window.innerHeight - vv.height - vv.offsetTop));

            // Oppdater CSS-variabel + litt ekstra luft i meldinger
            document.documentElement.style.setProperty('--keyboard', keyboard + 'px');
            chatMessages.style.paddingBottom = (keyboard + 24) + 'px';

            // Hold deg ved bunn når tastatur åpnes/lukkes
            scrollToBottomIfNeeded();
        };

        vv.addEventListener('resize', onVVChange);
        vv.addEventListener('scroll', onVVChange);
    }

    // -----------
    // Send melding
    // -----------
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

        // Behold body-låsen selv om tastaturet forsvinner (iOS)
        // slik at bakgrunnssiden ikke glir.
        if (chatWidget.classList.contains('active')) {
            lockBodyScroll(true);
        }
    }

    // Lukker tastatur på iOS når man trykker i meldingsfeltet
    chatMessages?.addEventListener('pointerdown', () => {
        if (document.activeElement === chatInput) chatInput.blur();
    });
});


