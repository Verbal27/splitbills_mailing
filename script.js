const form = document.getElementById("contact-form");
const button = form.querySelector("button");

const feedback = document.createElement("div");
feedback.id = "form-feedback";
feedback.className = "form-feedback";
feedback.setAttribute("role", "status");
feedback.setAttribute("aria-live", "polite");
form.appendChild(feedback);

function validateInput(input) {
  const errorSpan = input.parentElement.querySelector(".input-error");
  let valid = true;

  if (input.hasAttribute("required") && !input.value.trim()) {
    errorSpan.textContent = "This field is required.";
    valid = false;
  } else if (input.hasAttribute("minlength")) {
    const min = parseInt(input.getAttribute("minlength"), 10);
    if (input.value.trim().length < min) {
      errorSpan.textContent = `Minimum ${min} characters required.`;
      valid = false;
    }
  } else if (input.type === "email") {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!pattern.test(input.value.trim())) {
      errorSpan.textContent = "Please enter a valid email.";
      valid = false;
    }
  }

  if (!valid) {
    errorSpan.style.display = "block";
    input.classList.add("invalid");
  } else {
    errorSpan.style.display = "none";
    input.classList.remove("invalid");
  }

  return valid;
}

form.addEventListener("input", (event) => {
  const target = event.target;
  if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
    validateInput(target);
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  let allValid = true;
  for (const input of form.querySelectorAll("input, textarea")) {
    if (!validateInput(input)) allValid = false;
  }
  if (!allValid) {
    feedback.textContent = "Please fix the errors above.";
    feedback.style.color = "#e74c3c";
    feedback.classList.add("show");
    return;
  }

  button.disabled = true;
  button.classList.add("loading");
  button.textContent = "Sending…";
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
    button.textContent = "Sent ✓";
    form.reset();
  } catch (err) {
    if (err.name === "AbortError") {
      feedback.textContent = "Request timed out. Please try again.";
    } else {
      feedback.textContent = "Failed to send message. Try again.";
    }
    feedback.style.color = "#e74c3c";
    button.textContent = "Send Message";
  } finally {
    clearTimeout(timeout);
    setTimeout(() => {
      button.disabled = false;
      button.classList.remove("loading");
      button.textContent = "Send Message";
      form.style.pointerEvents = "auto";
    }, 2000);
  }
});