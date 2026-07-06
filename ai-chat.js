/* ==========================================================================
   AI Chat — powers both the Study Assistant and Counseling chat
   Uses DeepSeek's API. Get a free key at platform.deepseek.com
   ========================================================================== */

const AI_STORAGE_KEY = "eduSafeDeepSeekKey";
let currentChatMode = "study";
let chatHistory = [];

function getApiKey() {
  return localStorage.getItem(AI_STORAGE_KEY) || "";
}

function setApiKey(key) {
  localStorage.setItem(AI_STORAGE_KEY, key);
}

function openChat(mode) {
  currentChatMode = mode;
  chatHistory = [];

  document.getElementById("aiChatModal").style.display = "flex";
  document.getElementById("aiChatTitle").textContent =
    mode === "study" ? "🤖 AI Study Assistant" : "💬 AI Counselor";

  document.getElementById("aiChatMessages").innerHTML = "";

  const intro =
    mode === "study"
      ? "Hi! I'm your study assistant. Ask me about any subject, lesson, or homework question."
      : "Hi, I'm here to listen. This is a safe space to talk about how you're feeling. Please note: I'm an AI, not a licensed counselor. If this is an emergency, please contact a trusted adult or a real crisis line right away.";

  addMessage("assistant", intro);

  const savedKey = getApiKey();
  document.getElementById("apiKeyRow").style.display = savedKey ? "none" : "flex";
}

function closeChat() {
  document.getElementById("aiChatModal").style.display = "none";
}

function saveKey() {
  const key = document.getElementById("apiKeyInput").value.trim();
  if (key) {
    setApiKey(key);
    document.getElementById("apiKeyRow").style.display = "none";
  }
}

function addMessage(role, text) {
  const messagesEl = document.getElementById("aiChatMessages");
  const bubble = document.createElement("div");
  bubble.className = "chat-bubble " + (role === "user" ? "chat-user" : "chat-assistant");
  bubble.textContent = text;
  messagesEl.appendChild(bubble);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return bubble;
}

async function sendChatMessage() {
  const input = document.getElementById("aiChatInput");
  const text = input.value.trim();
  if (!text) return;

  const apiKey = getApiKey();
  if (!apiKey) {
    alert("Please enter your DeepSeek API key first.");
    return;
  }

  addMessage("user", text);
  chatHistory.push({ role: "user", content: text });
  input.value = "";

  const loadingBubble = addMessage("assistant", "…thinking");

  const systemPrompt =
    currentChatMode === "study"
      ? "You are a friendly, encouraging study assistant helping a student understand school subjects. Keep answers clear and age-appropriate."
      : "You are a warm, supportive listener helping a student talk through their feelings. You are not a licensed therapist. Be empathetic and non-judgmental. If the student mentions self-harm or danger, gently encourage them to reach out to a trusted adult or a real crisis helpline.";

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + apiKey,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "system", content: systemPrompt }, ...chatHistory],
      }),
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't process that.";
    loadingBubble.textContent = reply;
    chatHistory.push({ role: "assistant", content: reply });
  } catch (err) {
    loadingBubble.textContent =
      "⚠️ Couldn't reach the AI service. Check your API key or internet connection.";
  }
}

function showClassMode(mode, btn) {
  document.querySelectorAll("#classModeTabs .role-tab").forEach((t) => t.classList.remove("active"));
  btn.classList.add("active");

  const content = document.getElementById("classModeContent");
  if (mode === "online") {
    content.innerHTML = `
      <p class="card-subtext">Algebra Basics — Live Class 3 today at 4:00 PM</p>
      <a href="https://zoom.us" target="_blank" class="btn-sm btn-add">Join Zoom class</a>
    `;
  } else {
    content.innerHTML = `
      <p class="card-subtext">Algebra Basics — Room 204, Main Building</p>
      <p class="card-subtext">Today at 4:00 PM</p>
    `;
  }
}