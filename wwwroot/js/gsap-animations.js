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
        heroTitle.style.color = "#ffffff"; // ← Dette gir hvit tekst
        heroTitle.style.fontWeight = "700";
    } else {
        // Gradient for desktop
        heroTitle.style.background = "linear-gradient(90deg, rgba(255,144,0,0.8), #ffffff, rgba(0,255,255,0.7))";
        heroTitle.style.backgroundSize = "200% auto";
        heroTitle.style.webkitBackgroundClip = "text";
        heroTitle.style.webkitTextFillColor = "transparent";
        heroTitle.style.color = ""; // Fjern vanlig farge
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
            if (!isMobile) {
                animateGlow(heroTitle);
            }
            animateContactButton();
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
        // Desktop: hover events
        contactBtn.addEventListener("mouseenter", () => {
            hoverTimeline.play();
        });
        contactBtn.addEventListener("mouseleave", () => {
            hoverTimeline.reverse();
        });

        gsap.to(contactBtn, {
            scale: 1.02,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            duration: 2,
            delay: 1.5
        });
    } else {
        // Mobil: auto "hover" animasjon
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
   🚀 Init
--------------------------------------------------- */
window.addEventListener('DOMContentLoaded', () => {
    animateHeroTitle();
    animateContactButton();
});
