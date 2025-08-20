﻿gsap.registerPlugin(ScrollTrigger);

/* ---------------------------------------------------
    Hero Title — Unified (Desktop + Mobile)
--------------------------------------------------- */
function animateHeroTitle() {
    const heroTitle = document.querySelector(".hero-title");
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Gradient på forelder (for helheten)
    heroTitle.style.background = "linear-gradient(90deg, rgba(255,144,0,0.8), #ffffff, rgba(0,255,255,0.7))";
    heroTitle.style.backgroundSize = "200% auto";
    heroTitle.style.webkitBackgroundClip = "text";
    heroTitle.style.backgroundClip = "text";
    heroTitle.style.webkitTextFillColor = "transparent";
    heroTitle.style.color = "transparent";
    heroTitle.style.fontWeight = "700";

    gsap.set(heroTitle, { opacity: 0, y: 50 });

    gsap.to(heroTitle, {
        opacity: 1,
        y: 0,
        duration: 1.5,
        ease: "power4.out",
        onStart: () => typeWriter(heroTitle, () => {
            animateGlow(heroTitle);
            if (typeof animateContactButton === "function") animateContactButton(false);

            wrapLastWordAdvanced(heroTitle);
            startWordRotationAdvanced(heroTitle, { prefersReduced });
        })
    });
}

/* Wrap siste ord til #changing-word > .word-letters > .letter* + shimmer */
function wrapLastWordAdvanced(element) {
    const clean = t => (
        t.replace(/\p{Cf}/gu, "").replace(/\u00AD/g, "").replace(/\s+/g, " ").trim()
    );

    const fullText = clean(element.textContent);
    const parts = fullText.split(" ");
    const last = parts.pop();
    const prefix = parts.join(" ");
    const lettersHtml = last.split("").map(ch => `<span class="letter">${escapeHtml(ch)}</span>`).join("");

    element.innerHTML = `${prefix}&nbsp;<span id="changing-word">
    <span class="word-letters">${lettersHtml}</span>
    <span class="word-shimmer"></span>

    <!--  HUD: chip + progress + orbit -->
    <span class="word-hud">
      <span class="word-chip" aria-hidden="true"></span>
      <span class="word-progress"><span class="bar"></span></span>
    </span>
    <span class="orbit-wrap" aria-hidden="true"><span class="orbit-dot"></span></span>
  </span>`;

    // gradient på bokstavene (Safari-sikkert)
    const letters = element.querySelectorAll("#changing-word .letter");
    applyGradientToLetters(letters, element);

    // init HUD (sett label/ikon for første ord + start pre-countdown)
    const container = element.querySelector("#changing-word");
    initWordHUD(container, element, last);
}


function startWordRotationAdvanced(heroTitle, opts) {
    const INTERVAL = 2800; // behold tempoet ditt
    const words = ["nettsider", "webapplikasjoner", "digitale\u00A0løsninger"];
    const container = heroTitle.querySelector("#changing-word");
    const lettersWrap = container.querySelector(".word-letters");

    let currentWord = lettersWrap.textContent.trim();
    let idx = Math.max(0, words.indexOf(currentWord));
    if (idx === -1) idx = 0;

    const useAdvanced = !opts.prefersReduced;

    const K = {
        flipOutRotX: 80, flipOutZ: -30, flipOutY: -10, flipOutDur: 0.38, flipStagger: 0.03,
        inY: 26, inZ: 30, inDur: 0.72, inStagger: 0.045,
        particles: 8
    };

    // start første countdown frem til første bytte (samme delay som under)
    hudStartCountdown(container, 900);

    const switchWord = () => {
        const next = words[(idx + 1) % words.length];

        // 🔔 HUD: oppdater chip, pulse, orbit + restart countdown
        updateWordChip(container, next, heroTitle);
        pulseWordChip(container);
        hudStartCountdown(container, INTERVAL);
        runOrbitSweep(container);

        if (useAdvanced) {
            const oldLetters = lettersWrap.querySelectorAll(".letter");
            const tl = gsap.timeline();

            tl.to(oldLetters, {
                rotationX: K.flipOutRotX, z: K.flipOutZ, y: K.flipOutY,
                opacity: 0, duration: K.flipOutDur, ease: "power2.in",
                stagger: { each: K.flipStagger, from: "end" }
            });

            tl.add(() => createParticleBurst(container, K.particles), "-=0.20");

            tl.add(() => {
                lettersWrap.innerHTML = next.split("").map(ch => `<span class="letter">${escapeHtml(ch)}</span>`).join("");
                const newLetters = lettersWrap.querySelectorAll(".letter");
                applyGradientToLetters(newLetters, heroTitle);

                gsap.set(newLetters, { opacity: 0, rotationX: -90, y: K.inY, z: K.inZ, translateZ: 0 });
                gsap.to(newLetters, {
                    opacity: 1, rotationX: 0, y: 0, z: 0,
                    duration: K.inDur, ease: "elastic.out(1, 0.62)",
                    stagger: { each: K.inStagger, from: "start" }
                });

                runShimmer(container);
            }, "-=0.10");

            idx = (idx + 1) % words.length;

        } else {
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
        setInterval(switchWord, INTERVAL);
    }, 900);
}


/* Partikler */
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
            { x: 0, y: 0, scale: 0.4, opacity: 0.9, translateZ: 0 },
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

/* Shimmer */
function runShimmer(container) {
    const s = container.querySelector(".word-shimmer");
    if (!s) return;
    gsap.set(s, { left: "-30%" });
    gsap.to(s, { left: "130%", duration: 0.7, ease: "power2.out" });
}

// HUD init: sett chip for startord og start første progress
function initWordHUD(container, heroTitle, startWord) {
    updateWordChip(container, startWord, heroTitle);
}

// chip-tekst/ikon per ord
function chipLabelFor(word) {
    if (word === "nettsider") return "🌐 Web";
    if (word === "webapplikasjoner") return "</> App";
    return "✨ Løsning";
}

function updateWordChip(container, word, heroTitle) {
    const chip = container.querySelector(".word-chip");
    if (!chip) return;

    chip.textContent = chipLabelFor(word);

    // gradienttekst i chip (samme som tittel)
    const cs = getComputedStyle(heroTitle);
    const bg = cs.backgroundImage || "linear-gradient(90deg,#ff9000,#ffffff,#00ffff)";
    const bgSize = cs.backgroundSize || "200% auto";

    chip.style.backgroundImage = bg;
    chip.style.backgroundSize = bgSize;
    chip.style.webkitBackgroundClip = "text";
    chip.style.backgroundClip = "text";
    chip.style.webkitTextFillColor = "transparent";
    chip.style.color = "transparent";
}

function pulseWordChip(container) {
    const chip = container.querySelector(".word-chip");
    if (!chip) return;
    gsap.fromTo(chip, { scale: 0.88, filter: "drop-shadow(0 0 0 rgba(255,255,255,0))" }, {
        scale: 1, duration: 0.22, ease: "power2.out"
    });
    gsap.fromTo(chip, { boxShadow: "0 0 0 rgba(255,255,255,0)" }, {
        boxShadow: "0 0 18px rgba(255,255,255,0.25)", duration: 0.22, ease: "power2.out", yoyo: true, repeat: 1
    });
}

function hudStartCountdown(container, ms) {
    const bar = container.querySelector(".word-progress .bar");
    if (!bar) return;
    if (bar._tween) { bar._tween.kill(); bar._tween = null; }
    gsap.set(bar, { width: "0%" });
    bar._tween = gsap.to(bar, { width: "100%", duration: ms / 1000, ease: "linear" });
}

function runOrbitSweep(container) {
    const wrap = container.querySelector(".orbit-wrap");
    if (!wrap) return;
    gsap.fromTo(wrap, { rotate: 0, opacity: 1 }, { rotate: 360, duration: 0.55, ease: "power2.out" });
    // fade ut dot litt etterpå for å ikke bli “for mye”
    gsap.to(wrap, { opacity: 0, duration: 0.25, ease: "power1.out", delay: 0.55 });
}



/* ➜ Gradient på hver bokstav + GPU-hints (Safari trygg) */
function applyGradientToLetters(letters, heroTitle) {
    // hent gradient fra heroTitle
    const bg = heroTitle.style.background || "linear-gradient(90deg, rgba(255,144,0,0.8), #ffffff, rgba(0,255,255,0.7))";
    const bgSize = heroTitle.style.backgroundSize || "200% auto";

    letters.forEach(letter => {
        letter.style.display = "inline-block";
        letter.style.willChange = "transform, opacity";
        letter.style.transformStyle = "preserve-3d";
        letter.style.backfaceVisibility = "hidden";
        letter.style.webkitBackfaceVisibility = "hidden";
        letter.style.transform = "translateZ(0)";

        // GI GRADIENT DIREKTE PÅ BOKSTAVEN
        letter.style.background = bg;
        letter.style.backgroundSize = bgSize;
        letter.style.webkitBackgroundClip = "text";
        letter.style.backgroundClip = "text";
        letter.style.webkitTextFillColor = "transparent";
        letter.style.color = "transparent";
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
        wrap.style.overflow = "visible";
    }
}

/* Utils */
function escapeHtml(str) {
    return str.replace(/[&<>"']/g, m => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[m]));
}


/* Typewriter – rAF-basert (smooth) med ekte caret i enden */
function typeWriter(element, callback) {
    // Rens tekst (som før)
    const fullText = element.textContent
        .replace(/\p{Cf}/gu, "")
        .replace(/\u00AD/g, "")
        .replace(/\s+/g, " ")
        .trim();

    // Sett opp typed + caret (inline, på samme linje som teksten)
    element.innerHTML = '<span class="typed-caret"></span>';
    const typed = element.querySelector('.typed-caret');

   
    const CHAR_MS = 90;
    const CPS = 1000 / CHAR_MS;   

    let i = 0;
    let acc = 0;                  
    let last = performance.now();

    function frame(now) {
        const dt = now - last;      
        last = now;

        
        const progress = fullText.length ? i / fullText.length : 1; // 0..1
        const ease = 0.9 + 0.2 * Math.sin(progress * Math.PI);

        
        acc += (dt * CPS * ease) / 1000;

        
        const take = Math.min(fullText.length - i, Math.floor(acc));
        if (take > 0) {
            typed.textContent += fullText.slice(i, i + take);
            i += take;
            acc -= take;
        }

        if (i < fullText.length) {
            requestAnimationFrame(frame);
        } else {
            
            typed.classList.remove('typed-caret');
            element.textContent = typed.textContent;
            if (callback) callback();
        }
    }

    requestAnimationFrame(t => { last = t; frame(t); });
}




/* Glow på gradienten */
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
        // DESKTOP: som før — kun på hover
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
        // MOBIL: 1) kjør din første sweep (1.2s) ...
        hoverTimeline.eventCallback("onComplete", () => {
            // ... 2) deretter start en rolig, kontinuerlig sweep
            gsap.set(contactBtn, { backgroundPosition: "0% center" });
            gsap.to(contactBtn, {
                backgroundPosition: "200% center",
                duration: 3.6,        // <-- SAKTERE annen runde (juster 3.0–4.5 etter smak)
                ease: "none",
                repeat: 1,
                yoyo: true            // frem og tilbake
            });
        });
        hoverTimeline.play();     // start første naturlige pass

        // (valgfritt) subtil pust i skalering, som før
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
