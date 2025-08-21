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
    heroTitle.style.backgroundPosition = 'var(--aurora-pos) center';

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

    
    const letters = element.querySelectorAll("#changing-word .letter");
    applyGradientToLetters(letters, element);

    
    const container = element.querySelector("#changing-word");
    initWordHUD(container, element, last);
}


function startWordRotationAdvanced(heroTitle, opts) {
    const INTERVAL = 2800; 
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

        //  HUD: oppdater chip, pulse, orbit + restart countdown
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



/*  Gradient på hver bokstav + GPU-hints (Safari trygg) */
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
        letter.style.backgroundPosition = 'var(--aurora-pos) center';

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


/* Typewriter */
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

        
        const progress = fullText.length ? i / fullText.length : 1; 
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
    // startposisjon for variabelen som både tittel, chip og ord leser
    gsap.set(element, { css: { '--aurora-pos': '0%' } });

    gsap.to(element, {
        duration: 2.5,
        ease: 'linear',
        repeat: -1,
        yoyo: true,
        css: { '--aurora-pos': '200%' }
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
        
        hoverTimeline.eventCallback("onComplete", () => {
            
            gsap.set(contactBtn, { backgroundPosition: "0% center" });
            gsap.to(contactBtn, {
                backgroundPosition: "200% center",
                duration: 3.6,        
                ease: "none",
                repeat: 1,
                yoyo: true            
            });
        });
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
    Animate Project Cards
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
  initSkillsSection  –  en inngang for ALLE effektene
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

    //  2. 3‑D tilt‑effekt (Vanilla‑Tilt)
    VanillaTilt.init(document.querySelectorAll(".skills-card"), {
        max: 22,
        speed: 400,
        glare: true,
        "max-glare": 0.3,
    });

    //  3. Animasjon når man bytter mellom “Ferdigheter” og “Verktøy”
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













/* Premium Contact Success */
gsap.registerPlugin(CustomEase);

(() => {
    const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const SEL = {
        box: ".success-box",
        surface: ".success-surface",
        glow: ".success-glow",
        icon: ".success-icon",
        checkSVG: ".success-check",
        oldCheckSVG: ".confirmation-checkmark",
        checkPath: ".success-check path",
        headline: ".success-headline",
        message: ".success-message, .confirmation-message",
        actions: ".confirmation-actions",
        btnNew: "#contact-new",
    };

    function haptics() { try { navigator.vibrate && navigator.vibrate(16); } catch { } }

    function ensurePremiumMarkup(root) {
        let box = root.querySelector(SEL.box);
        if (!box) {
            root.innerHTML = `
        <div class="success-box" role="status" aria-live="polite" aria-atomic="true">
          <div class="success-surface">
            <div class="success-icon" aria-hidden="true">
              <svg viewBox="0 0 48 48" class="success-check">
                <path d="M14 24.5 L21.5 32 L34 18"></path>
              </svg>
            </div>
            <div class="success-text">
              <div class="success-headline">Takk!</div>
              <div class="success-message">Meldingen er sendt.</div>
              <div class="success-sub">Jeg svarer deg så snart som mulig.</div>
            </div>
            <div class="confirmation-actions">
              <button id="contact-new" type="button" class="btn btn-primary">Send en ny melding</button>
            </div>
          </div>
          <div class="success-glow" aria-hidden="true"></div>
        </div>`;
            return root.querySelector(SEL.box);
        }

        let surface = box.querySelector(SEL.surface);
        if (!surface) {
            surface = document.createElement("div");
            surface.className = "success-surface";
            const move = Array.from(box.childNodes).filter(n => !(n.nodeType === 1 && n.classList.contains("success-glow")));
            move.forEach(n => surface.appendChild(n));
            box.prepend(surface);
        }

        let icon = box.querySelector(SEL.icon);
        if (!icon) {
            icon = document.createElement("div");
            icon.className = "success-icon";
            surface.prepend(icon);
        }
        if (!icon.querySelector(SEL.checkSVG)) {
            const old = surface.querySelector(SEL.oldCheckSVG);
            if (old) {
                old.classList.remove("confirmation-checkmark");
                old.classList.add("success-check");
                icon.appendChild(old);
            } else {
                icon.innerHTML = `
          <svg viewBox="0 0 48 48" class="success-check">
            <path d="M14 24.5 L21.5 32 L34 18"></path>
          </svg>`;
            }
        }

        if (!surface.querySelector(SEL.actions)) {
            const actions = document.createElement("div");
            actions.className = "confirmation-actions";
            actions.innerHTML = `<button id="contact-new" type="button" class="btn btn-primary">Send en ny melding</button>`;
            surface.appendChild(actions);
        }

        if (!box.querySelector(SEL.glow)) {
            const glow = document.createElement("div");
            glow.className = "success-glow";
            glow.setAttribute("aria-hidden", "true");
            box.appendChild(glow);
        }

        return box;
    }

    function focusTrap(container) {
        const Q = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        container.addEventListener("keydown", e => {
            if (e.key !== "Tab") return;
            const els = Array.from(container.querySelectorAll(Q)).filter(el => !el.disabled && el.offsetParent !== null);
            if (!els.length) return;
            const first = els[0], last = els[els.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        });
    }

    function animateIn(box) {
        const surface = box.querySelector(SEL.surface);
        const icon = box.querySelector(SEL.icon);
        const check = box.querySelector(SEL.checkPath);
        const headline = box.querySelector(SEL.headline);
        const message = box.querySelector(SEL.message);
        const btn = box.querySelector(SEL.btnNew);

        gsap.set(box, { "--sheen-x": "-140%", "--glow-strength": 0, "--ring-opacity": 0 });
        gsap.set(surface, { opacity: 0, y: 10, scale: 0.985 });
        gsap.set(icon, { opacity: 0, y: 4, scale: 0.92 });
        if (check) {
            const len = check.getTotalLength ? check.getTotalLength() : 48;
            gsap.set(check, { strokeDasharray: len, strokeDashoffset: len });
        }
        gsap.set([headline, message, btn], { opacity: 0, y: 6 });

        CustomEase.create("pop", "M0,0 C0.2,0.88 0.35,1 1,1");

        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.to(surface, { opacity: 1, y: 0, scale: 1, duration: REDUCED ? 0.2 : 0.5, ease: "pop" }, 0)
            .to(box, { "--sheen-x": "140%", duration: REDUCED ? 0.01 : 1.1, ease: "power2.out" }, 0.05)
            .to(box, { "--glow-strength": 1, "--ring-opacity": 0.6, duration: REDUCED ? 0.2 : 0.6, ease: "sine.out" }, 0.06)
            .to(icon, { opacity: 1, y: 0, scale: 1, duration: REDUCED ? 0.15 : 0.35 }, 0.15);

        if (check) tl.to(check, { strokeDashoffset: 0, duration: REDUCED ? 0.25 : 0.55 }, 0.22);

        tl.to([headline, message], { opacity: 1, y: 0, stagger: 0.08, duration: REDUCED ? 0.12 : 0.28 }, 0.34)
            .to(btn, { opacity: 1, y: 0, duration: REDUCED ? 0.12 : 0.26 }, 0.44);

        if (!REDUCED) {
            tl.add(() => {
                gsap.to(box, { "--glow-strength": 0.85, duration: 1.8, ease: "sine.inOut", yoyo: true, repeat: -1 });
                gsap.to(box, { "--ring-opacity": 0.45, duration: 1.8, ease: "sine.inOut", yoyo: true, repeat: -1 });
            }, ">-0.1");
        }
    }

    function run(confirmation) {
        confirmation.style.display = "flex";
        const box = ensurePremiumMarkup(confirmation);
        if (box.dataset.animated === "1") return;
        box.dataset.animated = "1";

        const btn = box.querySelector(SEL.btnNew);
        btn && btn.focus();
        focusTrap(box);
        haptics();
        animateIn(box);
    }

    function setup() {
        const confirmation = document.getElementById("confirmation");
        if (!confirmation) return;

        ["formSent", "contactConfirmShown"].forEach(evt => {
            window.addEventListener(evt, () => run(confirmation));
        });

        if (confirmation.querySelector(SEL.box)) run(confirmation);

        const mo = new MutationObserver(() => {
            const box = confirmation.querySelector(SEL.box);
            if (box && !box.dataset.animated) run(confirmation);
        });
        mo.observe(confirmation, { childList: true, subtree: true });
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", setup);
    else setup();
})();
























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
