document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");
  const button = form.querySelector("button");
  const feedback = document.getElementById("form-feedback");

  const validators = {
    name: (value) => value.trim().length >= 2 || "Name must be at least 2 characters.",
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || "Enter a valid email address.",
    message: (value) => value.trim().length >= 10 || "Message must be at least 10 characters."
  };

  function showError(input, message) {
    const errorSpan = input.parentElement.querySelector(".input-error");
    errorSpan.textContent = message;
    errorSpan.style.display = "block";
    input.classList.add("invalid");
  }

  function clearError(input) {
    const errorSpan = input.parentElement.querySelector(".input-error");
    errorSpan.textContent = "";
    errorSpan.style.display = "none";
    input.classList.remove("invalid");
  }

  function validateInput(input) {
    const field = input.name;
    if (validators[field]) {
      const valid = validators[field](input.value);
      if (valid !== true) {
        showError(input, valid);
        return false;
      } else {
        clearError(input);
        return true;
      }
    }
    return true;
  }

  function validateForm() {
    let valid = true;
    form.querySelectorAll("input, textarea").forEach((input) => {
      if (!validateInput(input)) valid = false;
    });
    return valid;
  }

  form.addEventListener("input", (e) => {
    if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) {
      validateInput(e.target);
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    feedback.classList.remove("show");

    if (!validateForm()) {
      feedback.textContent = "Please fix the errors above.";
      feedback.style.color = "#e74c3c";
      feedback.classList.add("show");
      return;
    }

    button.disabled = true;
    button.textContent = "Sending…";
    form.style.pointerEvents = "none";

    const data = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      message: form.message.value.trim()
    };

    try {
      const response = await fetch("https://api.splitbills.org/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error("Server error");

      feedback.textContent = "Message sent successfully ✓";
      feedback.style.color = "green";
      feedback.classList.add("show");
      form.reset();
    } catch (err) {
      feedback.textContent = "Failed to send message. Please try again.";
      feedback.style.color = "#e74c3c";
      feedback.classList.add("show");
    } finally {
      button.disabled = false;
      button.textContent = "Send Message";
      form.style.pointerEvents = "auto";
    }
  });
});