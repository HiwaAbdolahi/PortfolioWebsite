document.addEventListener("DOMContentLoaded", function () {
    const chatInput = document.getElementById("chat-input");
    const chatSend = document.getElementById("chat-send");
    const chatMessages = document.getElementById("chat-messages");

    // Unik sessionId per økt
    const sessionId = "session-" + Date.now();

    // ---------------------------
    // Forslag / onboarding
    // ---------------------------
    const SUGGESTIONS = [
        "Gi en 20–30 sek pitch om Hiwa.",
        "Kort: Hvilken tech-stack bruker denne siden?",
        "Deep: Hvordan er AI-assistenten koblet opp?",
        "Hvordan deployes siden (CI/CD)?",
        "Hvordan fungerer kontaktskjemaet (validering + e-post)?",
        "Når velger Hiwa Azure SQL vs. Cosmos DB?",
        "Hva lærte Hiwa mest i bacheloroppgaven?",
        "Hvordan kan jeg kontakte Hiwa?",
        "Kan jeg laste ned Hiwas CV?",
        "Er koden offentlig tilgjengelig?",
        "Hvorfor bør dere ansette Hiwa?",
        "Vis GitHub-prosjektene til Hiwa.",
        
    ];

    const PLACEHOLDER_TIPS = [
        "Skriv meldingen din … jeg er en AI, ikke en FAQ 🤝",
        "Hva vil du vite om Hiwa?",
        "Gi en 30 sek pitch om Hiwa",
        "Forklar CI/CD-oppsettet i House Rental (kort)",
        "Hvordan bruker Hiwa Azure i praksis?",
        "Hvilke databaser og datamodeller kan Hiwa?",
        "Vis Hiwas GitHub-prosjekter og live-lenker",
        "Hva lærte Hiwa mest i bachelorprosjektet?",
        "Hvordan laster jeg ned CV?",
        "Sammenlign SQL vs NoSQL i Hiwas arbeid"
    ];

    function renderWelcome() {
        if (document.getElementById("chat-empty")) return;

        const wrap = document.createElement("div");
        wrap.id = "chat-empty";
        wrap.innerHTML = `
      <div class="empty-banner">
        ⚡ AI-assistent — ikke forhåndsprogrammerte svar.
        <span class="muted">Spør om hva som helst relatert til Hiwa.</span>
      </div>

      <div class="empty-head">
        <div class="empty-title">Hei! Jeg er Hiwa sin AI-assistent 👋</div>
        <div class="empty-sub">Foreslåtte spørsmål (du kan også skrive hva du vil):</div>
      </div>

      <div class="empty-suggestions" role="list">
        ${SUGGESTIONS.map(q => `
          <button class="suggestion-chip" role="listitem" data-q="${q.replace(/"/g, '&quot;')}">${q}</button>
        `).join("")}
      </div>

      <button class="about-toggle" type="button" aria-expanded="false">Om agenten</button>
      <div class="about-panel" hidden>
        <ul>
          <li>Svarer fritt basert på Hiwa sin CV, vitnemål og prosjekter.</li>
          <li>Kan forklare teknologier (f.eks. CI/CD, DI, Identity) med eksempler.</li>
          <li>Kan foreslå forbedringer på kode/UX eller skrive korte snutter.</li>
          <li>Kan ta feil – si ifra, så justerer jeg svaret.</li>
        </ul>
      </div>

      <div class="empty-hint">Tips: skriv <b>kort</b> for raske svar, eller <b>teknisk</b> for dypere forklaring.</div>
    `;
        chatMessages.appendChild(wrap);

        // Klikk på forslag -> fyll input og send
        wrap.querySelectorAll(".suggestion-chip").forEach(btn => {
            btn.addEventListener("click", () => {
                chatInput.value = btn.dataset.q;
                sendMessage();
            });
        });

        // Toggle "Om agenten"
        const aboutBtn = wrap.querySelector(".about-toggle");
        const aboutPanel = wrap.querySelector(".about-panel");
        aboutBtn.addEventListener("click", () => {
            const isOpen = aboutPanel.hasAttribute("hidden") === false;
            if (isOpen) {
                aboutPanel.setAttribute("hidden", "");
                aboutBtn.setAttribute("aria-expanded", "false");
            } else {
                aboutPanel.removeAttribute("hidden");
                aboutBtn.setAttribute("aria-expanded", "true");
            }
        });
    }

    function removeWelcome() {
        const w = document.getElementById("chat-empty");
        if (w) w.remove();
    }

    // Roterende placeholder
    function startPlaceholderRotation(inputEl, list = PLACEHOLDER_TIPS, ms = 4200) {
        let i = 0;
        inputEl.placeholder = list[i % list.length];
        const id = setInterval(() => {
            i++;
            inputEl.placeholder = list[i % list.length];
        }, ms);
        inputEl.addEventListener("focus", () => clearInterval(id), { once: true });
    }

    // Render onboarding ved oppstart
    if (chatMessages.children.length === 0) renderWelcome();
    startPlaceholderRotation(chatInput);

    // ---------------------------
    // Autoscroll (robust sticky)
    // ---------------------------
    function forceScrollToBottom(smooth = true) {
        // flere forsøk for å treffe etter layout/reflow
        const attempt = () => chatMessages.scrollTo({
            top: chatMessages.scrollHeight,
            behavior: smooth ? "smooth" : "auto",
        });

        requestAnimationFrame(() => {
            attempt();
            // ekstra runde etter neste frame
            requestAnimationFrame(attempt);
            // tidsbaserte fallbacks (font/bilde/reflow/GSAP)
            setTimeout(attempt, 80);
            setTimeout(attempt, 160);
            setTimeout(() => { chatMessages.scrollTop = chatMessages.scrollHeight; }, 260);
        });
    }

    // Klistre til bunn når nye noder legges til
    const observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
            if (m.type === "childList" && m.addedNodes.length > 0) {
                forceScrollToBottom(true);
            }
        }
    });
    observer.observe(chatMessages, { childList: true });

    // ---------------------------
    // Typing-indikator
    // ---------------------------
    function showTyping() {
        const el = document.createElement("div");
        el.className = "bot typing";
        el.innerHTML = `<span class="dots"><i></i><i></i><i></i></span> Skriver …`;
        chatMessages.appendChild(el);
        forceScrollToBottom(true);
        return el;
    }
    function removeTyping(el) {
        if (el && el.remove) el.remove();
        // sikkerhets-scroll etter fjerning (høyden endret)
        forceScrollToBottom(true);
    }

    // ---------------------------
    // Meldingshåndtering
    // ---------------------------
    function addMessage(content, sender, { force = false } = {}) {
        const messageDiv = document.createElement("div");
        messageDiv.className = sender; // "user" | "bot"
        messageDiv.textContent = content;
        chatMessages.appendChild(messageDiv);
        if (force) forceScrollToBottom(true);
    }

    chatSend.addEventListener("click", sendMessage);
    chatInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            sendMessage();
        }
    });

    async function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        removeWelcome(); // skjul empty state ved første melding
        addMessage("🧑‍💻 " + message, "user", { force: true });
        chatInput.value = "";

        let typingEl;
        try {
            typingEl = showTyping();

            const response = await fetch("/api/Chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: message, sessionId })
            });

            const data = await response.json();
            removeTyping(typingEl);

            const reply = data.choices?.[0]?.message?.content || "⚠️ Ingen svar.";
            addMessage("🤖 " + reply, "bot", { force: true });
        } catch (err) {
            removeTyping(typingEl);
            addMessage("⚠️ Nettverksfeil. Prøv igjen.", "bot", { force: true });
        }
    }
});
