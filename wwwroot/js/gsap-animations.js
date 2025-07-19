gsap.registerPlugin(ScrollTrigger);

/* ---------------------------------------------------
   🎨 Animate Hero Title
--------------------------------------------------- */
function animateHeroTitle() {
    const heroTitle = document.querySelector(".hero-title");
    const isMobile = window.innerWidth <= 767;

    if (isMobile) {
        // Ikke bruk gradient på mobil — bruk vanlig hvit tekst
        heroTitle.style.background = "";
        heroTitle.style.backgroundSize = "";
        heroTitle.style.webkitBackgroundClip = "";
        heroTitle.style.webkitTextFillColor = "";
        heroTitle.style.color = "#ffffff";
        heroTitle.style.fontWeight = "700";
    } else {
        // Gradient for desktop
        heroTitle.style.background = "linear-gradient(90deg, rgba(255,144,0,0.8), #ffffff, rgba(0,255,255,0.7))";
        heroTitle.style.backgroundSize = "200% auto";
        heroTitle.style.webkitBackgroundClip = "text";
        heroTitle.style.webkitTextFillColor = "transparent";
        heroTitle.style.color = "";
        heroTitle.style.fontWeight = "700";
    }

    // Startposisjon
    gsap.set(heroTitle, {
        opacity: 0,
        y: 50
    });

    // Fade inn + fly opp
    gsap.to(heroTitle, {
        opacity: 1,
        y: 0,
        duration: 1.5,
        ease: "power4.out",
        onStart: () => typeWriter(heroTitle, () => {
            if (!isMobile) animateGlow(heroTitle);
            animateContactButton(isMobile);
        })
    });
}

// Typewriter-funksjon
function typeWriter(element, callback) {
    const fullText = element.textContent;
    element.textContent = "";
    let i = 0;

    const typingInterval = setInterval(() => {
        if (i < fullText.length) {
            element.textContent += fullText.charAt(i);
            i++;
        } else {
            clearInterval(typingInterval);
            if (callback) callback();
        }
    }, 90);
}

// Glow-effekt (kun for desktop)
function animateGlow(element) {
    gsap.to(element, {
        backgroundPosition: "200% center",
        duration: 2.5,
        ease: "linear",
        repeat: -1,
        yoyo: true
    });
}

/* ---------------------------------------------------
   ✉️ Animate "Ta Kontakt"-knapp
--------------------------------------------------- */
function animateContactButton(isMobile) {
    const contactBtn = document.querySelector(".btn-primary");

    gsap.set(contactBtn, {
        opacity: 0,
        y: 90,
        scale: 0.9
    });

    gsap.to(contactBtn, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1.2,
        ease: "power4.out"
    });

    contactBtn.style.background = "linear-gradient(135deg, #ff9000, #ff0266, #00ffff)";
    contactBtn.style.backgroundSize = "200% auto";
    contactBtn.style.color = "#fff";
    contactBtn.style.border = "none";
    contactBtn.style.outline = "none";
    contactBtn.style.transition = "all 0.4s ease";
    contactBtn.style.boxShadow = "0 8px 30px rgba(0, 0, 0, 0.4)";
    contactBtn.style.borderRadius = "8px";
    contactBtn.style.fontWeight = "600";
    contactBtn.style.letterSpacing = "0.5px";

    const hoverTimeline = gsap.timeline({ paused: true });

    hoverTimeline.to(contactBtn, {
        scale: 1.08,
        boxShadow: "0 0 30px rgba(255, 144, 0, 0.7), 0 0 60px rgba(0, 255, 255, 0.5)",
        duration: 0.4,
        ease: "power2.out"
    }).to(contactBtn, {
        backgroundPosition: "200% center",
        duration: 1.2,
        ease: "linear"
    }, 0);

    if (!isMobile) {
        contactBtn.addEventListener("mouseenter", () => hoverTimeline.play());
        contactBtn.addEventListener("mouseleave", () => hoverTimeline.reverse());

        gsap.to(contactBtn, {
            scale: 1.02,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            duration: 2,
            delay: 1.5
        });
    } else {
        hoverTimeline.play();

        gsap.to(contactBtn, {
            scale: 1.02,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            duration: 2,
            delay: 1
        });
    }
}

/* ---------------------------------------------------
   🧩 Animate Project Cards
--------------------------------------------------- */
function animateProjectCardsAdvanced() {
    const cards = document.querySelectorAll(".project-card-wrapper");

    cards.forEach((card) => {
        const randomRotate = gsap.utils.random(-5, 5, 1);
        const randomSkew = gsap.utils.random(-8, 8, 1);

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: card,
                start: "top 90%",
                toggleActions: "play none none none"
            }
        });

        tl.fromTo(card, {
            opacity: 0,
            y: 100,
            rotateY: randomRotate,
            skewY: randomSkew,
            scale: 0.8,
        }, {
            opacity: 1,
            y: 0,
            rotateY: 0,
            skewY: 0,
            scale: 1,
            duration: 1.3,
            ease: "power4.out"
        });

        tl.to(card, {
            boxShadow: "0 0 30px rgba(0, 255, 255, 0.2), 0 0 60px rgba(255, 144, 0, 0.1)",
            duration: 1.2,
            ease: "power1.inOut"
        }, "-=1");
    });
}

/* ---------------------------------------------------
   📍 ScrollSpy Navbar Highlight
--------------------------------------------------- */
const navbarLinks = document.querySelectorAll('.navbar-link');

function setActiveLink(activeLink) {
    navbarLinks.forEach(link => link.classList.remove('active-link'));
    activeLink.classList.add('active-link');
}

navbarLinks.forEach(link => {
    const targetId = link.getAttribute('href');
    const section = document.querySelector(targetId);

    if (section) {
        ScrollTrigger.create({
            trigger: section,
            start: "top center",
            end: "bottom center",
            onEnter: () => setActiveLink(link),
            onEnterBack: () => setActiveLink(link)
        });
    }

    link.addEventListener("click", () => setActiveLink(link));
});






/******************************************************************
 🚀 initSkillsSection  –  én inngang for ALLE effektene
 ******************************************************************/
function initSkillsSection() {
    // ⇢ 1. Fade‑/Slide‑in kortene når seksjonen kommer i view
    gsap.from(".skills-card", {
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
            trigger: ".skills-box",
            start: "top 80%",
        }
    });

    // ⇢ 2. 3‑D tilt‑effekt (Vanilla‑Tilt)
    VanillaTilt.init(document.querySelectorAll(".skills-card"), {
        max: 22,
        speed: 400,
        glare: true,
        "max-glare": 0.3,
    });

    // ⇢ 3. Animasjon når man bytter mellom “Ferdigheter” og “Verktøy”
    const skillsList = document.querySelector(".skills-list");
    const toolsList = document.querySelector(".tools-list");
    const [skillsBtn, toolsBtn] = document.querySelectorAll("[data-toggle-btn]");

    skillsBtn.addEventListener("click", () => {
        gsap.fromTo(
            skillsList,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.4, overwrite: "auto" }
        );
    });

    toolsBtn.addEventListener("click", () => {
        gsap.fromTo(
            toolsList,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.4, overwrite: "auto" }
        );
    });
}





/* ---------------------------------------------------
   🚀 Init
--------------------------------------------------- */
window.addEventListener('DOMContentLoaded', () => {
    const isMobile = window.innerWidth <= 767;


    animateHeroTitle();
    animateContactButton(isMobile);
    animateProjectCardsAdvanced();
    initSkillsSection();
});
