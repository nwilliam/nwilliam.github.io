import { LABELS } from "./uiLabels.js";

export function populateLabels(root = document) {
  const elements = root.querySelectorAll("[data-label]");

  elements.forEach(el => {
    const path = el.dataset.label.split(".");
    let value = LABELS;

    for (const key of path) {
      value = value?.[key];
    }

    if (typeof value === "string") {
      el.textContent = value;
    } else {
      console.warn("Missing label:", el.dataset.label);
    }
  });
}
