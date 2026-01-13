// breakdownTable.js

// ---------- Generic Helpers ----------

function sectionHeader(title) {
  return `<tr><th colspan="3" class="section-header">${title}</th></tr>`;
}

function row(label, description, value, className = "") {
  return `
    <tr class="${className}">
      <td>${label}</td>
      <td>${description}</td>
      <td>${value}</td>
    </tr>
  `;
}

function totalRow(label, value) {
  return `
    <tr class="total-row">
      <td colspan="2"><b>${label}</b></td>
      <td><b>${value}</b></td>
    </tr>
  `;
}

function tooltip(text) {
  return `
    <span class="tooltip-icon">
      <img alt="tooltip" src="/assets/icons/question-mark.svg"/>
      <span class="tooltip-text">${text}</span>
    </span>
  `;
}

// ---------- Employee Section ----------

function buildEmployeeRows(employeeRoles) {
  return employeeRoles
    .filter(role => role.count > 0)
    .map(role =>
      row(
        `${role.label} ${tooltip(role.tooltip)}`,
        `$${role.hourlyRate.toFixed(2)}/hr × ${role.prcFactor} PRC × ${role.count} traveling`,
        `$${role.costPerHour.toLocaleString(undefined, { maximumFractionDigits: 2 })}/hr`
      )
    )
    .join("");
}

// ---------- Driving Section ----------

function buildDrivingSection(data) {
  return `
    ${sectionHeader("Driving Costs")}
    ${row(
    "Travel Hours",
    `${data.distanceMiles} miles each way ÷ ${data.speedMph} mph`,
    `${data.travelHours.toFixed(2)} hrs`
  )}
    ${row(
    "Employee Cost",
    "Total employee cost per hour × travel hours",
    `$${data.employeeCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  )}
    ${row(
    "Cars Needed",
    `Total Employees: ${data.totalEmployees} ÷ ${data.vehicleCapacity} per car`,
    data.carsNeeded
  )}
    ${row(
    "Distance Cost",
    `${data.distanceMiles} mi × $${data.costPerMile} × ${data.roundTripMultiplier} × ${data.carsNeeded} cars`,
    `$${data.distanceCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  )}
    ${row(
    "Lodging & Meals",
    `+$${data.lodgingPerPerson} per person if travel + destination hours > ${data.hoursAllowed}`,
    `$${data.lodgingCost.toLocaleString()}`
  )}
    ${totalRow(
    "Total Driving",
    `$${data.totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  )}
  `;
}

// ---------- Flying Section (Generic Aircraft) ----------

function buildFlyingSection(title, data) {
  return `
    ${sectionHeader(title)}
    ${row(
    "Travel Hours",
    `${data.distanceMiles} miles each way ÷ ${data.speedMph} mph`,
    `${data.travelHours.toFixed(2)} hrs`
  )}
    ${row(
    "Distance Cost",
    `${data.distanceMiles} mi × $${data.costPerMile} × ${data.roundTripMultiplier}`,
    `$${data.distanceCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  )}
    ${row(
    "Lodging & Meals",
    `+$${data.lodgingPerPerson} per person incl. pilots + $${data.pilotLodging} pilot lodging if travel + destination hours > ${data.hoursAllowed}`,
    `$${data.lodgingCost.toLocaleString()}`
  )}
    ${totalRow(
    "Total Flying",
    `$${data.totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  )}
  `;
}

// ---------- Public API ----------

export function renderBreakdownTable(targetElement, model) {
  targetElement.innerHTML = `
    ${sectionHeader("Employee Costs (Travel Hours Only, Driving)")}
    ${buildEmployeeRows(model.employeeRoles)}
    ${totalRow(
    "Employee Total",
    `$${model.employeeTotalPerHour.toLocaleString(undefined, { maximumFractionDigits: 2 })}/hr`
  )}

    ${buildDrivingSection(model.driving)}

    ${buildFlyingSection(
    "Flying Costs – King Air (Employee Hours NOT included)",
    model.flying.kingAir
  )}

    ${buildFlyingSection(
    "Flying Costs – Kodiak (Employee Hours NOT included)",
    model.flying.kodiak
  )}
  `;
}
