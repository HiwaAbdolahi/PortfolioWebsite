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

    // ------- Helpers -------
    function lockBodyScroll(lock) {
        const html = document.documentElement;
        if (lock) {
            html.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';
        } else {
            html.style.overflow = '';
            document.body.style.overflow = '';
        }
    }

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
        // autoscroll kun om bruker var nær bunn
        scrollToBottomIfNeeded();
    }

    // ------- Open/Close/Minimize -------
    function openChat() {
        chatWidget.classList.add("active");
        chatWidget.classList.remove("minimized");
        toggleBtn.style.display = "none";
        lockBodyScroll(true);
        // sikre at vi scroller til bunn når vi åpner
        requestAnimationFrame(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
            chatInput.focus();
        });
    }

    function closeChat() {
        chatWidget.classList.remove("active");
        chatWidget.classList.remove("minimized");
        toggleBtn.style.display = "flex";
        lockBodyScroll(false);
        // nullstill keyboard-offset
        document.documentElement.style.setProperty('--keyboard', '0px');
        chatMessages.style.paddingBottom = '14px';
    }

    function toggleMinimize() {
        const isMin = chatWidget.classList.contains('minimized');

        if (isMin) {
            // fra minimert -> fullskjerm igjen
            chatWidget.classList.remove('minimized');
            openChat(); // gir .active + låser scroll + fokus + autoscroll
        } else {
            // fra aktiv -> minimert “dock”
            chatWidget.classList.remove('active');
            chatWidget.classList.add('minimized');

            // vis agentknappen igjen (valgfritt – kan skjule hvis du vil)
            toggleBtn.style.display = 'flex';

            // lås opp sidescroll + nullstill keyboard-offset
            lockBodyScroll(false);
            document.documentElement.style.setProperty('--keyboard', '0px');
            chatMessages.style.paddingBottom = '14px';
            toggleBtn.style.display = 'none';
        }
    }

    minimizeBtn.removeEventListener("click", toggleMinimize); // hvis eksisterer
    minimizeBtn.addEventListener("click", toggleMinimize);



    // ------- Bind UI -------
    toggleBtn.addEventListener("click", openChat);
    closeBtn.addEventListener("click", closeChat);
    

    chatSend.addEventListener("click", sendMessage);
    chatInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") sendMessage();
    });

    // ------- VisualViewport: keyboard-aware -------
    if (window.visualViewport) {
        const vv = window.visualViewport;
        const onVVChange = () => {
            // Høyde som er “spist” av tastaturet
            const keyboard = Math.max(0, (window.innerHeight - vv.height - vv.offsetTop));
            // Løft composer (CSS transform) og legg litt luft i meldingslista
            document.documentElement.style.setProperty('--keyboard', keyboard + 'px');
            chatMessages.style.paddingBottom = (keyboard + 24) + 'px';

            // Hold deg ved bunn når tastatur åpnes/lukkes (hvis du allerede var der)
            scrollToBottomIfNeeded();
        };
        vv.addEventListener('resize', onVVChange);
        vv.addEventListener('scroll', onVVChange);
    }

    // ------- Send message -------
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
    }

    // (valgfritt) Lukker tastatur på iOS når man trykker utenfor input
    chatMessages.addEventListener('pointerdown', () => {
        if (document.activeElement === chatInput) chatInput.blur();
    });
});


