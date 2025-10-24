const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatMessages = document.getElementById("chat-messages");

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = chatInput.value.trim();
  if (!message) return;

  appendMessage("You", message);
  chatInput.value = "";

  try {
    const response = await fetch("/.netlify/functions/generate-jwt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const data = await response.json();
    appendMessage("WatsonX", data.reply);
  } catch (err) {
    appendMessage("WatsonX", "Error: " + err.message);
  }
});

function appendMessage(sender, text) {
  const msg = document.createElement("div");
  msg.classList.add("message");
  msg.innerHTML = `<strong>${sender}:</strong> ${text}`;
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

