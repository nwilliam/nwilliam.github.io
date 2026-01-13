let selectedAirport1 = null;

const destInput = document.getElementById("dest1");
const destList = document.getElementById("dest1-list");

function clearResults() {
  document.getElementById("drive-total").textContent = "$—";
  document.getElementById("fly-total").textContent = "$—";
  document.getElementById("breakdownTable").innerHTML =
    `<tr><td colspan="3">Enter inputs to view calculation details.</td></tr>`;
}

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
      calculateAndRender();
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

//Here we catch all user inputs and more importantly, debounce them.
const inputs = [
  "directors",
  "managers",
  "generalists",
  "hours1"
].map(id => document.getElementById(id));

let recalcTimer = null;

function scheduleRecalc() {
  clearTimeout(recalcTimer);
  recalcTimer = setTimeout(calculateAndRender, 200);
}

inputs.forEach(input => {
  input.addEventListener("input", scheduleRecalc);
});


// Calculation Logic
function calculateAndRender() {
  if (!selectedAirport1) {
    alert("Select a valid destination airport.");
    clearResults();
    return;
  }

  const numDirectors = parseInt(document.getElementById("directors").value) || 0;
  const numManagers = parseInt(document.getElementById("managers").value) || 0;
  const numGeneralists = parseInt(document.getElementById("generalists").value) || 0;
  const hoursAtDest = parseFloat(document.getElementById("hours1").value) || 0;

  const totalEmployees = numDirectors + numManagers + numGeneralists;

  // Employee cost per hour for driving only
  const costDirectors = numDirectors * HOURLY_RATE.directors * PRC_FACTORS.directors;
  const costManagers = numManagers * HOURLY_RATE.managers * PRC_FACTORS.managers;
  const costGeneralists = numGeneralists * HOURLY_RATE.generalists * PRC_FACTORS.generalists;
  const totalEmployeeCostPerHour = costDirectors + costManagers + costGeneralists;

  // Driving
  const driveHours = selectedAirport1.drivingFromKSTP / DRIVING_SPEED_MPH * (ROUND_TRIP ? 2 : 1);
  const carsNeeded = Math.ceil(totalEmployees / VEHICLE_CAPACITY);
  const driveDistanceCost = selectedAirport1.drivingFromKSTP * COST_PER_MILE.driving * (ROUND_TRIP ? 2 : 1) * carsNeeded;
  const numDays = Math.floor((driveHours + hoursAtDest) / HOURS_ALLOWED_PER_DAY);
  const driveLodging = totalEmployees * LODGING_PER_PERSON * numDays;
  const driveEmployeeTotal = totalEmployeeCostPerHour * driveHours;
  const driveTotal = driveEmployeeTotal + driveDistanceCost + driveLodging;

  // Flying - King Air
  const flyHoursKingAir = selectedAirport1.flyingFromKSTP / FLYING_SPEED_MPH_KING_AIR * (ROUND_TRIP ? 2 : 1);
  const flyDistanceCostKingAir = selectedAirport1.flyingFromKSTP * COST_PER_MILE.flyingKingAir * (ROUND_TRIP ? 2 : 1);
  const flyNumDaysKingAir = Math.floor((flyHoursKingAir + hoursAtDest) / HOURS_ALLOWED_PER_DAY_FLYING);
  const flyLodgingKingAir = (totalEmployees + 2) * (LODGING_PER_PERSON) * flyNumDaysKingAir; //technically we could just send the plane home. if(hoursAtDest > X) flyDistanceCostKingAir*=2
  const flyTotalKingAir = flyDistanceCostKingAir + flyLodgingKingAir;

  // Flying - Kodiak
  const flyHoursKodiak = selectedAirport1.flyingFromKSTP / FLYING_SPEED_MPH_KODIAK * (ROUND_TRIP ? 2 : 1);
  const flyDistanceCostKodiak = selectedAirport1.flyingFromKSTP * COST_PER_MILE.flyingKodiak * (ROUND_TRIP ? 2 : 1);
  const flyNumDaysKodiak = Math.floor((flyHoursKodiak + hoursAtDest) / HOURS_ALLOWED_PER_DAY_FLYING);
  const flyLodgingKodiak = (totalEmployees + 2) * (LODGING_PER_PERSON) * flyNumDaysKodiak; //technically we could just send the plane home. if(hoursAtDest > X) flyDistanceCostKingAir*=2
  const flyTotalKodiak = flyDistanceCostKodiak + flyLodgingKodiak;

  // Update Totals
  document.getElementById("drive-total").textContent = "$" + driveTotal.toLocaleString(undefined, {maximumFractionDigits: 0});
  document.getElementById("fly-total").textContent = "$" + flyTotalKingAir.toLocaleString(undefined, {maximumFractionDigits: 0});
  document.getElementById("fly-total-kodiak").textContent = "$" + flyTotalKodiak.toLocaleString(undefined, {maximumFractionDigits: 0});

  // --- Breakdown Table ---
  const breakdownTable = document.getElementById("breakdownTable");
  breakdownTable.innerHTML = `
<tr><th colspan="3" style="text-align:center">Employee Costs (Travel Hours Only, Driving)</th></tr>
<tr>
  <td>Directors
    <span class="tooltip-icon">
      <img alt="tooltip" src="/assets/icons/question-mark.svg"/>
      <span class="tooltip-text">Average Director/P.E. cost per hour is $${HOURLY_RATE.directors.toFixed(2)}, includes the cost of benefits. MnDOT and PRC Aviation have determined that the value these individuals create is worth a factor of ${PRC_FACTORS.directors} times their salary. Thus, we multiply hourly cost times the PRC factor to calculate the cost per hour of having this individual driving a vehicle rather than working. ("Windshield Time")</span>
    </span>
  </td>
  <td>${HOURLY_RATE.directors.toFixed(2)}/hr cost x ${PRC_FACTORS.directors} PRC Factor x ${numDirectors} directors traveling</td>
  <td>$${costDirectors.toLocaleString(undefined, {maximumFractionDigits: 2})}/hr</td>
</tr>
<tr>
  <td>Managers
    <span class="tooltip-icon">
      <img alt="tooltip" src="/assets/icons/question-mark.svg"/>
      <span class="tooltip-text">Average Manager/Supervisor/Professional cost per hour is $${HOURLY_RATE.managers.toFixed(2)}, includes the cost of benefits. MnDOT and PRC Aviation have determined that the value these individuals create is worth a factor of ${PRC_FACTORS.managers} their salary. Thus, we multiply hourly cost times the PRC factor to calculate the cost per hour of having this individual driving a vehicle rather than working. ("Windshield Time")</span>
    </span>
  </td>
  <td>${HOURLY_RATE.managers.toFixed(2)}/hr cost x ${PRC_FACTORS.managers} PRC Factor x ${numManagers} managers traveling</td>
  <td>$${costManagers.toLocaleString(undefined, {maximumFractionDigits: 2})}/hr</td>
</tr>
<tr>
  <td>Generalists
    <span class="tooltip-icon">
      <img alt="tooltip" src="/assets/icons/question-mark.svg"/>
      <span class="tooltip-text">Average Generalist cost per hour is $${HOURLY_RATE.generalists.toFixed(2)}, includes the cost of benefits. MnDOT and PRC Aviation have determined that the value these individuals create is worth a factor of ${PRC_FACTORS.generalists} their salary. Thus, we multiply hourly cost times the PRC factor to calculate the cost per hour of having this individual driving a vehicle rather than working. ("Windshield Time")</span>
    </span>
  </td>
  <td>${HOURLY_RATE.generalists.toFixed(2)}/hr cost x ${PRC_FACTORS.generalists} PRC Factor x ${numGeneralists} generalists traveling</td>
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
  <td>+$${LODGING_PER_PERSON} per person if travel plus destination hours > ${HOURS_ALLOWED_PER_DAY}</td>
  <td>$${driveLodging.toLocaleString()}</td>
</tr>
<tr class="total-row">
  <td colspan="2"><b>Total Driving</b></td>
  <td>$${driveTotal.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
</tr>

<tr><th colspan="3" style="text-align:center">Flying Costs - King Air (Employee Hours NOT included)</th></tr>
<tr>
  <td>Travel Hours</td>
  <td>${selectedAirport1.flyingFromKSTP} miles each way ÷ ${FLYING_SPEED_MPH_KING_AIR} mph</td>
  <td>${flyHoursKingAir.toFixed(2)} hrs</td>
</tr>
<tr>
  <td>Distance Cost</td>
  <td>${selectedAirport1.flyingFromKSTP} mi * $${COST_PER_MILE.flyingKingAir} * ${ROUND_TRIP ? 2 : 1}</td>
  <td>$${flyDistanceCostKingAir.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
</tr>
<tr>
  <td>Lodging & Meals</td>
  <td>+$${LODGING_PER_PERSON} per person including two pilots + $${PILOT_LODGING} pilot lodging if travel hours plus destination hours > ${HOURS_ALLOWED_PER_DAY_FLYING}</td>
  <td>$${flyLodgingKingAir.toLocaleString()}</td>
</tr>
<tr class="total-row">
  <td colspan="2"><b>Total Flying</b></td>
  <td>$${flyTotalKingAir.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
</tr>

<tr><th colspan="3" style="text-align:center">Flying Costs - Kodiak (Employee Hours NOT included)</th></tr>
<tr>
  <td>Travel Hours</td>
  <td>${selectedAirport1.flyingFromKSTP} miles each way ÷ ${FLYING_SPEED_MPH_KODIAK} mph</td>
  <td>${flyHoursKodiak.toFixed(2)} hrs</td>
</tr>
<tr>
  <td>Distance Cost</td>
  <td>${selectedAirport1.flyingFromKSTP} mi * $${COST_PER_MILE.flyingKodiak} * ${ROUND_TRIP ? 2 : 1}</td>
  <td>$${flyDistanceCostKodiak.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
</tr>
<tr>
  <td>Lodging & Meals</td>
  <td>+$${LODGING_PER_PERSON} per person including two pilots + $${PILOT_LODGING} pilot lodging if travel hours plus destination hours > ${HOURS_ALLOWED_PER_DAY_FLYING}</td>
  <td>$${flyLodgingKodiak.toLocaleString()}</td>
</tr>
<tr class="total-row">
  <td colspan="2"><b>Total Flying</b></td>
  <td>$${flyTotalKodiak.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
</tr>
  `;
}
