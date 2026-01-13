let selectedAirport1 = null;

const destInput = document.getElementById("dest1");
const destList = document.getElementById("dest1-list");

function filterAirports(query) {
  query = query.toLowerCase();
  return AIRPORTS.filter(a =>
    (a.name && a.name.toLowerCase().includes(query)) ||
    (a.icao && a.icao.toLowerCase().includes(query)) ||
    (a.iata && a.iata.toLowerCase().includes(query)) ||
    (a.faa && a.faa.toLowerCase().includes(query))
  ).slice(0, 15);
}

function renderAirportList(listEl, airports) {
  listEl.innerHTML = "";
  airports.forEach(ap => {
    const div = document.createElement("div");
    div.className = "autocomplete-item";
    div.textContent = `${ap.name} (${ap.faa}${ap.iata ? " / " + ap.iata : ""}${ap.icao ? " / " + ap.icao : ""})`;
    div.addEventListener("click", () => {
      selectedAirport1 = ap;
      destInput.value = div.textContent;
      listEl.hidden = true;
    });
    listEl.appendChild(div);
  });
  listEl.hidden = airports.length === 0;
}

let debounceTimer = null;
destInput.addEventListener("input", () => {
  selectedAirport1 = null;
  const query = destInput.value.trim();
  if (query.length < 1) {
    destList.hidden = true;
    return;
  }
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    renderAirportList(destList, filterAirports(query));
  }, 200);
});

document.addEventListener("click", e => {
  if (!e.target.closest(".autocomplete-container")) destList.hidden = true;
});

// Calculation Logic
document.getElementById("calculate").addEventListener("click", () => {
  if (!selectedAirport1) {
    alert("Select a valid destination airport.");
    return;
  }

  const numDirectors = parseInt(document.getElementById("directors").value) || 0;
  const numManagers = parseInt(document.getElementById("managers").value) || 0;
  const numGeneralists = parseInt(document.getElementById("generalists").value) || 0;
  const hoursAtDest = parseFloat(document.getElementById("hours1").value) || 0;

  const totalEmployees = numDirectors + numManagers + numGeneralists;

  // Employee cost per hour for driving only
  const costDirectors = numDirectors * BASE_HOURLY_RATE * PRC_FACTORS.directors;
  const costManagers = numManagers * BASE_HOURLY_RATE * PRC_FACTORS.managers;
  const costGeneralists = numGeneralists * BASE_HOURLY_RATE * PRC_FACTORS.generalists;
  const totalEmployeeCostPerHour = costDirectors + costManagers + costGeneralists;

  // Driving
  const driveHours = selectedAirport1.drivingFromKSTP / DRIVING_SPEED_MPH * (ROUND_TRIP ? 2 : 1);
  const carsNeeded = Math.ceil(totalEmployees / VEHICLE_CAPACITY);
  const driveDistanceCost = selectedAirport1.drivingFromKSTP * COST_PER_MILE.driving * (ROUND_TRIP ? 2 : 1) * carsNeeded;
  const numDays = Math.floor((driveHours + hoursAtDest) / HOURS_ALLOWED_PER_DAY);
  const driveLodging = totalEmployees * LODGING_PER_PERSON * numDays;
  const driveEmployeeTotal = totalEmployeeCostPerHour * driveHours;
  const driveTotal = driveEmployeeTotal + driveDistanceCost + driveLodging;

  // Flying
  const flyHours = selectedAirport1.flyingFromKSTP / FLYING_SPEED_MPH * (ROUND_TRIP ? 2 : 1);
  const flyDistanceCost = selectedAirport1.flyingFromKSTP * COST_PER_MILE.flying * (ROUND_TRIP ? 2 : 1);
  const flyNumDays = Math.floor((flyHours + hoursAtDest) / HOURS_ALLOWED_PER_DAY_FLYING);
  const flyLodging = (totalEmployees + 2) * (LODGING_PER_PERSON) * flyNumDays; //technically we could just send the plane home. if(hoursAtDest > X) flyDistanceCost*=2
  const flyTotal = flyDistanceCost + flyLodging;

  // Update Totals
  document.getElementById("drive-total").textContent = "$" + driveTotal.toLocaleString(undefined, {maximumFractionDigits: 0});
  document.getElementById("fly-total").textContent = "$" + flyTotal.toLocaleString(undefined, {maximumFractionDigits: 0});

  // --- Breakdown Table ---
  const breakdownTable = document.getElementById("breakdownTable");
  breakdownTable.innerHTML = `
<tr><th colspan="3" style="text-align:center">Employee Costs (Travel Hours Only, Driving)</th></tr>
<tr>
  <td>Directors (${numDirectors})</td>
  <td>${BASE_HOURLY_RATE.toFixed(2)} /hr * ${PRC_FACTORS.directors} * ${numDirectors}</td>
  <td>$${costDirectors.toLocaleString(undefined, {maximumFractionDigits: 2})}/hr</td>
</tr>
<tr>
  <td>Managers (${numManagers})</td>
  <td>${BASE_HOURLY_RATE.toFixed(2)} /hr * ${PRC_FACTORS.managers} * ${numManagers}</td>
  <td>$${costManagers.toLocaleString(undefined, {maximumFractionDigits: 2})}/hr</td>
</tr>
<tr>
  <td>Generalists (${numGeneralists})</td>
  <td>${BASE_HOURLY_RATE.toFixed(2)} /hr * ${PRC_FACTORS.generalists} * ${numGeneralists}</td>
  <td>$${costGeneralists.toLocaleString(undefined, {maximumFractionDigits: 2})}/hr</td>
</tr>
<tr class="total-row">
  <td><b>Employee Total</b></td><td></td>
  <td>$${totalEmployeeCostPerHour.toLocaleString(undefined, {maximumFractionDigits: 2})}/hr</td>
</tr>

<tr><th colspan="3" style="text-align:center">Driving Costs</th></tr>
<tr>
  <td>Travel Hours</td>
  <td>${selectedAirport1.drivingFromKSTP} miles each way ÷ ${DRIVING_SPEED_MPH} mph</td>
  <td>${driveHours.toFixed(2)} hrs</td>
</tr>
<tr>
  <td>Employee Cost</td>
  <td>Total employee cost per hour * travel hours</td>
  <td>$${driveEmployeeTotal.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
</tr>
<tr>
  <td>Cars Needed</td>
  <td>Total Employees: ${totalEmployees} ÷ ${VEHICLE_CAPACITY} per car</td>
  <td>${carsNeeded}</td>
</tr>
<tr>
  <td>Distance Cost</td>
  <td>${selectedAirport1.drivingFromKSTP} mi * $${COST_PER_MILE.driving} * ${ROUND_TRIP ? 2 : 1} * ${carsNeeded} cars</td>
  <td>$${driveDistanceCost.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
</tr>
<tr>
  <td>Lodging & Meals</td>
  <td>+$${LODGING_PER_PERSON} per person if travel + destination hours > 8</td>
  <td>$${driveLodging.toLocaleString()}</td>
</tr>
<tr class="total-row">
  <td colspan="2"><b>Total Driving</b></td>
  <td>$${driveTotal.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
</tr>

<tr><th colspan="3" style="text-align:center">Flying Costs (Employee Hours NOT included)</th></tr>
<tr>
  <td>Travel Hours</td>
  <td>${selectedAirport1.flyingFromKSTP} miles each way / ${FLYING_SPEED_MPH} mph</td>
  <td>${flyHours.toFixed(2)} hrs</td>
</tr>
<tr>
  <td>Distance Cost</td>
  <td>${selectedAirport1.flyingFromKSTP} mi * $${COST_PER_MILE.flying} * ${ROUND_TRIP ? 2 : 1}</td>
  <td>$${flyDistanceCost.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
</tr>
<tr>
  <td>Lodging & Meals</td>
  <td>+$${LODGING_PER_PERSON} per person including 2 pilots + $${PILOT_LODGING} pilot lodging if travel hours + destination hours > 12</td>
  <td>$${flyLodging.toLocaleString()}</td>
</tr>
<tr class="total-row">
  <td colspan="2"><b>Total Flying</b></td>
  <td>$${flyTotal.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
</tr>
  `;
});
