const form = document.getElementById("contact-form");
const button = form.querySelector("button");
const feedback = document.createElement("div");
feedback.id = "form-feedback";
feedback.className = "form-feedback";
feedback.setAttribute("role", "status");
feedback.setAttribute("aria-live", "polite");
form.appendChild(feedback);

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  button.disabled = true;
  button.classList.add("loading");
  button.firstChild.textContent = "Sending…";
  form.style.pointerEvents = "none";

  feedback.textContent = "Sending your message…";
  feedback.style.color = "#888";
  feedback.classList.add("show");

  const data = {
    name: form.name.value,
    email: form.email.value,
    message: form.message.value,
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  const startTime = Date.now();

  try {
    const res = await fetch("https://api.splitbills.org/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      signal: controller.signal,
    });

    const elapsed = Date.now() - startTime;
    if (elapsed < 500) await new Promise((r) => setTimeout(r, 500 - elapsed));

    if (!res.ok) throw new Error("Server error");

    feedback.textContent = "Message sent successfully ✓";
    feedback.style.color = "green";
    button.firstChild.textContent = "Sent ✓";
    form.reset();
  } catch (err) {
    if (err.name === "AbortError") {
      feedback.textContent = "Request timed out. Please try again.";
    } else {
      feedback.textContent = "Failed to send message. Try again.";
    }
    feedback.style.color = "red";
    button.firstChild.textContent = "Send Message";
  } finally {
    clearTimeout(timeout);
    setTimeout(() => {
      button.disabled = false;
      button.classList.remove("loading");
      button.firstChild.textContent = "Send Message";
      form.style.pointerEvents = "auto";
    }, 2000);
  }
});