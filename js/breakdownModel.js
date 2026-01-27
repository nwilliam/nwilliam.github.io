export function buildBreakdownModel(state) {
  return [
    employeeCosts(state),
    drivingCosts(state),
    flyingCosts(state, "King Air"),
    flyingCosts(state, "Kodiak")
  ].filter(Boolean);
}

/* ---------------- EMPLOYEES ---------------- */

function employeeCosts(state) {
  const rows = [];

  addEmployee(rows, "Directors", state.numDirectors, state.costDirectors);
  addEmployee(rows, "Managers", state.numManagers, state.costManagers);
  addEmployee(rows, "Generalists", state.numGeneralists, state.costGeneralists);

  rows.push({
    type: "total",
    label: "Employee Total",
    value: `$${state.totalEmployeeCostPerHour.toFixed(2)}/hr`
  });

  return {
    title: "Employee Costs (Travel Hours Only, Driving)",
    rows
  };
}

function addEmployee(rows, label, count, cost) {
  if (count === 0) return;

  rows.push({
    label,
    description: `${count} × PRC value × hourly rate`,
    tooltip:
      "PRC Aviation and MnDOT studies quantify the organizational value of employee time while traveling.",
    value: `$${cost.toFixed(2)}/hr`
  });
}

/* ---------------- DRIVING ---------------- */

function drivingCosts(state) {
  return {
    title: "Driving Costs",
    rows: [
      row("Travel Hours", `${state.driveHours.toFixed(2)} hrs`),
      row("Employee Cost", `$${state.driveEmployeeCost.toLocaleString()}`),
      row("Distance Cost", `$${state.driveDistanceCost.toLocaleString()}`),
      row("Lodging & Meals", `$${state.driveLodging.toLocaleString()}`),
      total("Total Driving", state.driveTotal)
    ]
  };
}

/* ---------------- FLYING ---------------- */

function flyingCosts(state, type) {
  const key = type === "King Air" ? "KingAir" : "Kodiak";

  return {
    title: `Flying Costs – ${type} (Employee Hours Not Included)`,
    rows: [
      row("Travel Hours", `${state[`flyHours${key}`].toFixed(2)} hrs`),
      row("Distance Cost", `$${state[`flyDistanceCost${key}`].toLocaleString()}`),
      row("Lodging & Meals", `$${state[`flyLodging${key}`].toLocaleString()}`),
      total("Total Flying", state[`flyTotal${key}`])
    ]
  };
}

/* ---------------- HELPERS ---------------- */

function row(label, value) {
  return { label, value };
}

function total(label, value) {
  return {
    type: "total",
    label,
    value: `$${value.toLocaleString()}`
  };
}
