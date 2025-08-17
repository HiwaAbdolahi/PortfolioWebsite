gsap.registerPlugin(ScrollTrigger);

/* ---------------------------------------------------
   🎨 Hero Title — Unified (Desktop + Mobile)
   World-class word switch: per-letter 3D flip + particles + elastic-in + shimmer
--------------------------------------------------- */
function animateHeroTitle() {
    const heroTitle = document.querySelector(".hero-title");
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Samme look på alle enheter: gradienttekst
    heroTitle.style.background = "linear-gradient(90deg, rgba(255,144,0,0.8), #ffffff, rgba(0,255,255,0.7))";
    heroTitle.style.backgroundSize = "200% auto";
    heroTitle.style.webkitBackgroundClip = "text";
    heroTitle.style.webkitTextFillColor = "transparent";
    heroTitle.style.color = "";
    heroTitle.style.fontWeight = "700";

    // Startposisjon
    gsap.set(heroTitle, { opacity: 0, y: 50 });

    // Fade inn + typewriter
    gsap.to(heroTitle, {
        opacity: 1,
        y: 0,
        duration: 1.5,
        ease: "power4.out",
        onStart: () => typeWriter(heroTitle, () => {
            // Glow på gradienten overalt
            animateGlow(heroTitle);
            // Din eksisterende CTA-animasjon
            if (typeof animateContactButton === "function") animateContactButton(false);

            // Pakk siste ord og start rotasjon
            wrapLastWordAdvanced(heroTitle);
            startWordRotationAdvanced(heroTitle, { prefersReduced });
        })
    });
}

/* ---------------------------------------------------
   Wrap siste ord → #changing-word > .word-letters > .letter* + shimmer
--------------------------------------------------- */
function wrapLastWordAdvanced(element) {
    const clean = t => t.replace(/[\u200B-\u200D\uFEFF]/g, "").replace(/\s+/g, " ").trim(); // fjern zero-width + doble spaces
    const fullText = clean(element.textContent);
    const parts = fullText.split(" ");
    const last = parts.pop();
    const prefix = parts.join(" ");

    const lettersHtml = last.split("").map(ch => `<span class="letter">${escapeHtml(ch)}</span>`).join("");
    element.innerHTML = `${prefix}&nbsp;<span id="changing-word">
    <span class="word-letters">${lettersHtml}</span>
    <span class="word-shimmer"></span>
  </span>`;

    const letters = element.querySelectorAll("#changing-word .letter");
    applyGradientToLetters(letters, element); // gradient for alle enheter
}

/* ---------------------------------------------------
   Rotering: per-bokstav 3D flip-out + particles + elastic-in + shimmer
   (samme på mobil & desktop; fallback kun ved prefers-reduced-motion)
--------------------------------------------------- */
function startWordRotationAdvanced(heroTitle, opts) {
    const words = ["nettsider", "webapplikasjoner", "digitale løsninger"];
    const container = heroTitle.querySelector("#changing-word");
    const lettersWrap = container.querySelector(".word-letters");

    let currentWord = lettersWrap.textContent.trim();
    let idx = Math.max(0, words.indexOf(currentWord));
    if (idx === -1) idx = 0;

    const useAdvanced = !opts.prefersReduced; // én logikk for alle, med respekt for reduced motion

    // Faste “knobs” (samme på mobil + desktop siden du ikke bryr deg om ytelse nå)
    const K = {
        flipOutRotX: 80, flipOutZ: -30, flipOutY: -10, flipOutDur: 0.38, flipStagger: 0.03,
        inY: 26, inZ: 30, inDur: 0.72, inStagger: 0.045,
        particles: 8
    };

    const switchWord = () => {
        const next = words[(idx + 1) % words.length];

        if (useAdvanced) {
            const oldLetters = lettersWrap.querySelectorAll(".letter");
            const tl = gsap.timeline();

            // OUT: per-bokstav 3D flip
            tl.to(oldLetters, {
                rotationX: K.flipOutRotX,
                z: K.flipOutZ,
                y: K.flipOutY,
                opacity: 0,
                filter: "blur(3px)",
                duration: K.flipOutDur,
                ease: "power2.in",
                stagger: { each: K.flipStagger, from: "end" }
            });

            // Partikler
            tl.add(() => createParticleBurst(container, K.particles), "-=0.20");

            // Bytt til nytt ord + IN: elastic
            tl.add(() => {
                lettersWrap.innerHTML = next.split("").map(ch => `<span class="letter">${escapeHtml(ch)}</span>`).join("");
                const newLetters = lettersWrap.querySelectorAll(".letter");
                applyGradientToLetters(newLetters, heroTitle);

                gsap.set(newLetters, {
                    opacity: 0,
                    rotationX: -90,
                    y: K.inY,
                    z: K.inZ,
                    filter: "blur(3px)",
                    translateZ: 0 // iOS Safari hint
                });

                gsap.to(newLetters, {
                    opacity: 1,
                    rotationX: 0,
                    y: 0,
                    z: 0,
                    filter: "blur(0px)",
                    duration: K.inDur,
                    ease: "elastic.out(1, 0.62)",
                    stagger: { each: K.inStagger, from: "start" }
                });

                runShimmer(container);
            }, "-=0.10");

            idx = (idx + 1) % words.length;

        } else {
            // Reduced motion fallback
            const tl = gsap.timeline();
            tl.to(lettersWrap, { y: -8, opacity: 0, duration: 0.22, ease: "power2.in" })
                .add(() => {
                    lettersWrap.innerHTML = next.split("").map(ch => `<span class="letter">${escapeHtml(ch)}</span>`).join("");
                    const newLetters = lettersWrap.querySelectorAll(".letter");
                    applyGradientToLetters(newLetters, heroTitle);
                })
                .to(lettersWrap, { y: 0, opacity: 1, duration: 0.34, ease: "power3.out" });

            idx = (idx + 1) % words.length;
        }
    };

    setTimeout(() => {
        switchWord();
        setInterval(switchWord, 2800);
    }, 900);
}

/* ---------------------------------------------------
   Partikkel-burst (små lys)
--------------------------------------------------- */
function createParticleBurst(container, count = 8) {
    const base = document.createElement("span");
    base.className = "particles";
    Object.assign(base.style, {
        position: "absolute",
        left: "0", top: "0",
        width: container.offsetWidth + "px",
        height: container.offsetHeight + "px",
        pointerEvents: "none",
        overflow: "visible"
    });
    container.appendChild(base);

    for (let i = 0; i < count; i++) {
        const p = document.createElement("span");
        p.className = "particle";
        base.appendChild(p);

        const angle = Math.random() * Math.PI * 2;
        const dist = 12 + Math.random() * 26;
        const tx = Math.cos(angle) * dist;
        const ty = Math.sin(angle) * dist - 6;

        gsap.fromTo(p,
            { x: 0, y: 0, scale: 0.4, opacity: 0.9, filter: "blur(0.5px)", translateZ: 0 },
            {
                x: tx, y: ty,
                scale: 0.95,
                opacity: 0,
                duration: 0.55 + Math.random() * 0.25,
                ease: "power2.out",
                onComplete: () => p.remove()
            }
        );
    }

    setTimeout(() => base.remove(), 700);
}

/* ---------------------------------------------------
   Shimmer / glint
--------------------------------------------------- */
function runShimmer(container) {
    const s = container.querySelector(".word-shimmer");
    if (!s) return;

    gsap.set(s, { left: "-30%" });
    gsap.to(s, { left: "130%", duration: 0.7, ease: "power2.out" });
}

/* ---------------------------------------------------
   Gradient pr. bokstav + iOS GPU-hints (samme på alle enheter)
--------------------------------------------------- */
function applyGradientToLetters(letters, heroTitle) {
    letters.forEach(letter => {
        letter.style.display = "inline-block";
        letter.style.willChange = "transform, filter, opacity";
        letter.style.transformStyle = "preserve-3d";
        letter.style.backfaceVisibility = "hidden";
        letter.style.webkitBackfaceVisibility = "hidden";
        letter.style.transform = "translateZ(0)";

        const bg = heroTitle.style.background || "linear-gradient(90deg, rgba(255,144,0,0.8), #ffffff, rgba(0,255,255,0.7))";
        const bgSize = heroTitle.style.backgroundSize || "200% auto";
        letter.style.background = bg;
        letter.style.backgroundSize = bgSize;
        letter.style.webkitBackgroundClip = "text";
        letter.style.webkitTextFillColor = "transparent";
        letter.style.color = "";
        letter.style.fontWeight = "700";
    });

    const wrap = heroTitle.querySelector("#changing-word");
    if (wrap) {
        wrap.style.display = "inline-block";
        wrap.style.position = "relative";
        wrap.style.perspective = "900px";
        wrap.style.perspectiveOrigin = "50% 60%";
        wrap.style.transformStyle = "preserve-3d";
        wrap.style.transform = "translateZ(0)";
    }
}

/* ---------------------------------------------------
   Utils
--------------------------------------------------- */
function escapeHtml(str) {
    return str.replace(/[&<>"']/g, m => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[m]));
}

/* ---------------------------------------------------
   Typewriter — rens whitespace (fikser “j eg”)
--------------------------------------------------- */
function typeWriter(element, callback) {
    let fullText = element.textContent.replace(/[\u200B-\u200D\uFEFF]/g, "").replace(/\s+/g, " ").trim();
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

/* ---------------------------------------------------
   Glow-effekt på gradienten (uendelig)
--------------------------------------------------- */
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
   Auto-init (desktop + mobil)
--------------------------------------------------- */
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", animateHeroTitle);
} else {
    animateHeroTitle();
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













/* 
   ✨ Kontakt-suksessanimasjon  
*/
gsap.registerPlugin(MotionPathPlugin, CustomEase);

window.addEventListener("formSent", (e) => {
    const confirmation = document.getElementById("confirmation");
    if (!confirmation) return;

    const { alertHtml, newForm } = e.detail;

    // Fjern tidligere innhold
    confirmation.innerHTML = "";

    // 🎯 Suksessboks
    const box = document.createElement("div");
    box.className = "success-box";
    box.innerHTML = `
        <svg class="confirmation-checkmark" viewBox="0 0 52 52">
            <circle cx="26" cy="26" r="25" fill="none"/>
            <path fill="none" d="M14 27l7 7 16-16"/>
        </svg>
        <div class="confirmation-message">Takk! Meldingen er sendt ✉️</div>
    `;
    confirmation.appendChild(box);
    confirmation.style.display = "flex";

    // ✨ GSAP boksanimasjon med CustomEase
    CustomEase.create("pop-ease", "M0,0 C0.17,0.84 0.44,1.03 1,1");
    gsap.fromTo(box, {
        scale: 0.4,
        opacity: 0,
        rotate: -15
    }, {
        scale: 1,
        opacity: 1,
        rotate: 0,
        duration: 1.4,
        ease: "pop-ease"
    });


    gsap.fromTo(box, {
        scale: 0.4,
        opacity: 0,
        rotate: -15,
        filter: "blur(8px) brightness(0.8)"  // ← Ny effekt
    }, {
        scale: 1,
        opacity: 1,
        rotate: 0,
        duration: 1.4,
        ease: "pop-ease",
        filter: "blur(0px) brightness(1.2)", // ← Smooth transition
        boxShadow: "0 0 50px rgba(0, 255, 255, 0.4), 0 0 80px rgba(255, 144, 0, 0.3)"
    });


    
    // 🎈 Bobler (particles)
    for (let i = 0; i < 18; i++) {  // ← Flere bobler
        const bubble = document.createElement("div");
        bubble.className = "bubble";
        confirmation.appendChild(bubble);

        const x = gsap.utils.random(-600, 600);
        const y = gsap.utils.random(-700, -120);

        gsap.fromTo(bubble, {
            x: 0,
            y: 0,
            scale: 0.8,
            opacity: 1,
        }, {
            motionPath: {
                path: [{ x, y }],
                curviness: 1
            },
            scale: 0.2,
            opacity: 0,
            duration: gsap.utils.random(1.8, 3.2),
            ease: "power2.out",
            delay: i * 0.08
        });
    }


    // ⏳ Tilbakestill skjema etter 7 sekunder
    setTimeout(() => {
        confirmation.style.display = "none";
        confirmation.innerHTML = "";

        const contactSection = document.querySelector("#contact");
        if (contactSection && newForm) {
            contactSection.insertAdjacentHTML("beforeend", newForm);

            gsap.from(".contact-form", {
                opacity: 0,
                y: 30,
                duration: 0.6,
                ease: "power4.out"
            });
        }
    }, 7000);
});























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
