export function renderBreakdownTable(sections, tableEl) {
  tableEl.innerHTML = sections.map(renderSection).join("");
}

function renderSection(section) {
  return `
    <tr class="section-header">
      <th colspan="3">${section.title}</th>
    </tr>
    ${section.rows.map(renderRow).join("")}
  `;
}

function renderRow(row) {
  if (row.type === "total") {
    return `
      <tr class="total-row">
        <td colspan="2"><strong>${row.label}</strong></td>
        <td><strong>${row.value}</strong></td>
      </tr>
    `;
  }

  return `
    <tr>
      <td>
        ${row.label}
        ${row.tooltip ? tooltip(row.tooltip) : ""}
      </td>
      <td>${row.description || ""}</td>
      <td>${row.value}</td>
    </tr>
  `;
}

function tooltip(text) {
  return `
    <span class="tooltip-icon">
      <img src="/assets/icons/question-mark.svg" alt="info" />
      <span class="tooltip-text">${text}</span>
    </span>
  `;
}
