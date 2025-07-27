document.addEventListener("DOMContentLoaded", function () {
    const chatInput = document.getElementById("chat-input");
    const chatSend = document.getElementById("chat-send");
    const chatMessages = document.getElementById("chat-messages");

    // 🔑 Generer en unik sessionId én gang per økt
    const sessionId = "session-" + Date.now();

    chatSend.addEventListener("click", sendMessage);
    chatInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") sendMessage();
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

        const response = await fetch("/api/Chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                text: message,
                sessionId: sessionId // 🔁 Send med sessionId!
            })
        });

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content || "⚠️ Ingen svar.";
        addMessage("🤖 " + reply, "bot");
    }


});
