const setFieldError = (inputEl, errorEl, message) => {
  if (!errorEl || !inputEl) {
    return;
  }
  errorEl.textContent = message;
  errorEl.hidden = !message;
  if (message) {
    inputEl.setAttribute("aria-invalid", "true");
  } else {
    inputEl.removeAttribute("aria-invalid");
  }
};

window.setFieldError = setFieldError;
