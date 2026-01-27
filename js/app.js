import * as C from "./constants.js";
import { populateLabels } from "./labelRenderer.js";
import { buildBreakdownModel } from "./breakdownModel.js";
import { renderBreakdownTable } from "./breakdownRenderer.js";

/* -------------------------------------------------
   DOM REFERENCES
------------------------------------------------- */

const els = {
  directors: document.getElementById("directors"),
  managers: document.getElementById("managers"),
  generalists: document.getElementById("generalists"),
  hoursAtDestination: document.getElementById("hours1"),
  destinationInput: document.getElementById("dest1"),
  breakdownTable: document.getElementById("breakdownTable"),
  driveTotal: document.getElementById("drive-total"),
  flyTotal: document.getElementById("fly-total")
};

let selectedAirport = null;

/* -------------------------------------------------
   INITIALIZATION
------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  populateLabels();
  attachReactiveHandlers();
  clearResults();
});

/* -------------------------------------------------
   REACTIVE INPUT HANDLING
------------------------------------------------- */

function attachReactiveHandlers() {
  [
    els.directors,
    els.managers,
    els.generalists,
    els.hoursAtDestination
  ].forEach(el => el.addEventListener("input", scheduleRecalculate));
}

let recalcTimer = null;

function scheduleRecalculate() {
  clearTimeout(recalcTimer);
  recalcTimer = setTimeout(recalculate, 150);
}

/* -------------------------------------------------
   MAIN CALCULATION ORCHESTRATION
------------------------------------------------- */

function recalculate() {
  if (!selectedAirport) {
    clearResults();
    return;
  }

  const state = buildCalculationState();
  const model = buildBreakdownModel(state);

  renderBreakdownTable(model, els.breakdownTable);

  els.driveTotal.textContent =
    `$${state.driveTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  els.flyTotal.textContent =
    `$${state.flyTotalKingAir.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

/* -------------------------------------------------
   CALCULATION STATE
------------------------------------------------- */

function buildCalculationState() {
  const numDirectors = parseInt(els.directors.value) || 0;
  const numManagers = parseInt(els.managers.value) || 0;
  const numGeneralists = parseInt(els.generalists.value) || 0;
  const hoursAtDestination = parseFloat(els.hoursAtDestination.value) || 0;

  const totalEmployees =
    numDirectors + numManagers + numGeneralists;

  /* ---------- Employee Costs ---------- */

  const costDirectors =
    numDirectors * C.HOURLY_RATE.directors * C.PRC_FACTORS.directors;

  const costManagers =
    numManagers * C.HOURLY_RATE.managers * C.PRC_FACTORS.managers;

  const costGeneralists =
    numGeneralists * C.HOURLY_RATE.generalists * C.PRC_FACTORS.generalists;

  const totalEmployeeCostPerHour =
    costDirectors + costManagers + costGeneralists;

  /* ---------- Driving ---------- */

  const driveHours =
    (selectedAirport.drivingFromKSTP / C.DRIVING_SPEED_MPH) *
    (C.ROUND_TRIP ? 2 : 1);

  const carsNeeded =
    Math.ceil(totalEmployees / C.VEHICLE_CAPACITY);

  const driveDistanceCost =
    selectedAirport.drivingFromKSTP *
    C.COST_PER_MILE.driving *
    (C.ROUND_TRIP ? 2 : 1) *
    carsNeeded;

  const driveEmployeeCost =
    totalEmployeeCostPerHour * driveHours;

  const driveLodging =
    driveHours + hoursAtDestination > C.HOURS_ALLOWED_PER_DAY
      ? totalEmployees * C.LODGING_PER_PERSON
      : 0;

  const driveTotal =
    driveEmployeeCost + driveDistanceCost + driveLodging;

  /* ---------- Flying (King Air) ---------- */

  const flyHoursKingAir =
    (selectedAirport.flyingFromKSTP / C.FLYING_SPEED_MPH.kingAir) *
    (C.ROUND_TRIP ? 2 : 1);

  const flyDistanceCostKingAir =
    selectedAirport.flyingFromKSTP *
    C.COST_PER_MILE.flyingKingAir *
    (C.ROUND_TRIP ? 2 : 1);

  const flyLodgingKingAir =
    flyHoursKingAir + hoursAtDestination > C.HOURS_ALLOWED_PER_DAY
      ? (totalEmployees + 2) * C.LODGING_PER_PERSON + C.PILOT_LODGING
      : 0;

  const flyTotalKingAir =
    flyDistanceCostKingAir + flyLodgingKingAir;

  /* ---------- Flying (Kodiak) ---------- */

  const flyHoursKodiak =
    (selectedAirport.flyingFromKSTP / C.FLYING_SPEED_MPH.kodiak) *
    (C.ROUND_TRIP ? 2 : 1);

  const flyDistanceCostKodiak =
    selectedAirport.flyingFromKSTP *
    C.COST_PER_MILE.flyingKodiak *
    (C.ROUND_TRIP ? 2 : 1);

  const flyLodgingKodiak =
    flyHoursKodiak + hoursAtDestination > C.HOURS_ALLOWED_PER_DAY
      ? (totalEmployees + 2) * C.LODGING_PER_PERSON + C.PILOT_LODGING
      : 0;

  const flyTotalKodiak =
    flyDistanceCostKodiak + flyLodgingKodiak;

  return {
    selectedAirport,
    numDirectors,
    numManagers,
    numGeneralists,
    hoursAtDestination,
    totalEmployees,

    costDirectors,
    costManagers,
    costGeneralists,
    totalEmployeeCostPerHour,

    driveHours,
    driveEmployeeCost,
    driveDistanceCost,
    driveLodging,
    driveTotal,

    flyHoursKingAir,
    flyDistanceCostKingAir,
    flyLodgingKingAir,
    flyTotalKingAir,

    flyHoursKodiak,
    flyDistanceCostKodiak,
    flyLodgingKodiak,
    flyTotalKodiak
  };
}

/* -------------------------------------------------
   AIRPORT SELECTION HOOK
------------------------------------------------- */

export function setSelectedAirport(airport) {
  selectedAirport = airport;
  scheduleRecalculate();
}

/* -------------------------------------------------
   UI HELPERS
------------------------------------------------- */

function clearResults() {
  els.driveTotal.textContent = "$—";
  els.flyTotal.textContent = "$—";
  els.breakdownTable.innerHTML =
    `<tr><td colspan="3">Enter inputs to view calculation details.</td></tr>`;
}
