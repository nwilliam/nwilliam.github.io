const dom = cacheDom();
const state = {
  userPairs: [],
  returnPair: null
};

const MAX_USER_PAIRS = 4;
const KSTP_LABEL = "KSTP - St. Paul Downtown / Holman Field";
const KSTP_AIRPORT = AIRPORTS.find(airport => airport.icao === "KSTP" || airport.faa === "STP");

initRoleLabels(dom);

const inputs = [
  dom.directorsInput,
  dom.managersInput,
  dom.generalistsInput
];

let recalcTimer = null;

const scheduleRecalc = () => {
  clearTimeout(recalcTimer);
  recalcTimer = setTimeout(calculateAndRender, 200);
};

inputs.forEach(input => {
  input.addEventListener("input", scheduleRecalc);
});

dom.addCityPairButton.addEventListener("click", () => {
  addUserPair();
});

dom.removeCityPairButton.addEventListener("click", () => {
  removeLastUserPair();
});

addUserPair();

function createPair({isReturn, insertBefore}) {
  const fragment = dom.cityPairTemplate.content.cloneNode(true);
  const card = fragment.querySelector(".city-pair-card");
  const originField = fragment.querySelector(".origin-field");
  const destInput = fragment.querySelector(".dest-input");
  const destList = fragment.querySelector(".autocomplete-list");
  const destAutocomplete = fragment.querySelector(".autocomplete-field");
  const destError = fragment.querySelector(".dest-error");
  const destStatic = fragment.querySelector(".destination-static");
  const departureError = fragment.querySelector(".departure-error");
  const datetimeInputs = fragment.querySelectorAll(".datetime-input");
  const datetimeValues = fragment.querySelectorAll(".datetime-value");

  const pair = {
    isReturn,
    destination: null,
    destinationLabel: "",
    el: card,
    dom: {
      originField,
      destInput,
      destList,
      destAutocomplete,
      destError,
      destStatic,
      departureError,
      arrivalDisplay: datetimeInputs[0],
      arrivalValue: datetimeValues[0],
      departureDisplay: datetimeInputs[1],
      departureValue: datetimeValues[1]
    }
  };

  if (isReturn) {
    pair.destination = KSTP_AIRPORT;
    pair.destinationLabel = KSTP_LABEL;
    destStatic.textContent = KSTP_LABEL;
    destStatic.hidden = false;
    destAutocomplete.hidden = true;
    destError.hidden = true;
  } else {
    initAirportAutocomplete({
      input: destInput,
      list: destList,
      onSelect: (airport, label) => {
        pair.destination = airport;
        pair.destinationLabel = label;
        destInput.value = label;
        setFieldError(destInput, destError, "");
        updatePairs();
        calculateAndRender();
      },
      onClear: () => {
        pair.destination = null;
        pair.destinationLabel = "";
        updatePairs();
        scheduleRecalc();
      },
      onInput: () => {
        setFieldError(destInput, destError, "");
        updatePairs();
      }
    });

  }

  if (insertBefore) {
    dom.cityPairs.insertBefore(fragment, insertBefore);
  } else {
    dom.cityPairs.appendChild(fragment);
  }
  initDateTimePickers(scheduleRecalc, card);

  return pair;
}

function addUserPair() {
  if (state.userPairs.length >= MAX_USER_PAIRS) {
    return;
  }
  const insertBefore = state.returnPair ? state.returnPair.el : null;
  const pair = createPair({isReturn: false, insertBefore});
  state.userPairs.push(pair);
  updatePairs();
}

function removeLastUserPair() {
  if (state.userPairs.length <= 1) {
    return;
  }
  const pair = state.userPairs.pop();
  if (pair) {
    pair.el.remove();
  }
  updatePairs();
  calculateAndRender();
}

function updatePairs() {
  const needsReturn = state.userPairs.length >= 2;
  if (needsReturn && !state.returnPair) {
    state.returnPair = createPair({isReturn: true});
  }
  if (!needsReturn && state.returnPair) {
    state.returnPair.el.remove();
    state.returnPair = null;
  }

  const allPairs = getAllPairs();

  const isSinglePair = allPairs.length === 1;
  dom.cityPairs.classList.toggle("has-multiple", !isSinglePair);
  allPairs.forEach((pair, index) => {
    pair.el.classList.toggle("city-pair-card--flat", isSinglePair);
    pair.el.classList.toggle("pair-secondary", index > 0);
  });

  allPairs.forEach((pair, index) => {
    if (index === 0) {
      pair.dom.originField.textContent = KSTP_LABEL;
      return;
    }
    const previousPair = allPairs[index - 1];
    const originLabel = previousPair.destination ? previousPair.destinationLabel : "Select destination above";
    pair.dom.originField.textContent = originLabel;
  });

  dom.addCityPairButton.disabled = state.userPairs.length >= MAX_USER_PAIRS;
  const canRemovePair = state.userPairs.length > 1;
  dom.removeCityPairButton.hidden = !canRemovePair;
  dom.removeCityPairButton.disabled = !canRemovePair;
}

function getAllPairs() {
  return state.returnPair ? [...state.userPairs, state.returnPair] : [...state.userPairs];
}

function calculateAndRender() {
  if (!KSTP_AIRPORT) {
    clearResults(dom);
    return;
  }

  let hasMissingDestination = false;
  state.userPairs.forEach(pair => {
    const message = pair.destination ? "" : "Select a destination airport.";
    setFieldError(pair.dom.destInput, pair.dom.destError, message);
    if (!pair.destination) {
      hasMissingDestination = true;
    }
  });

  if (hasMissingDestination || state.userPairs.length === 0) {
    clearResults(dom);
    return;
  }

  const numDirectors = parseInt(dom.directorsInput.value, 10) || 0;
  const numManagers = parseInt(dom.managersInput.value, 10) || 0;
  const numGeneralists = parseInt(dom.generalistsInput.value, 10) || 0;
  const hoursAtDest = getTotalHoursAtDestination();

  const trip = buildTripMetrics();
  const data = calculateTripCosts({
    driveMiles: trip.driveMiles,
    flyMiles: trip.flyMiles,
    hoursAtDest,
    numDirectors,
    numManagers,
    numGeneralists
  });

  renderTotals(dom, data);
  renderBreakdownTable(dom, data, trip, {
    numDirectors,
    numManagers,
    numGeneralists
  });
}

function buildTripMetrics() {
  if (state.userPairs.length === 1) {
    const airport = state.userPairs[0].destination;
    const driveMiles = airport.drivingFromKSTP * (ROUND_TRIP ? 2 : 1);
    const flyMiles = airport.flyingFromKSTP * (ROUND_TRIP ? 2 : 1);
    return {
      driveMiles,
      flyMiles,
      label: airport.name
    };
  }

  const legs = [];
  const destinations = state.userPairs.map(pair => pair.destination);
  const totalStops = [KSTP_AIRPORT, ...destinations];

  for (let i = 0; i < destinations.length; i += 1) {
    const fromAirport = totalStops[i];
    const toAirport = totalStops[i + 1];
    const flyMiles = haversineMiles(fromAirport, toAirport);
    legs.push({
      flyMiles,
      driveMiles: flyMiles * 1.2
    });
  }

  const lastAirport = destinations[destinations.length - 1];
  legs.push({
    flyMiles: lastAirport.flyingFromKSTP,
    driveMiles: lastAirport.drivingFromKSTP
  });

  const driveMiles = legs.reduce((sum, leg) => sum + leg.driveMiles, 0);
  const flyMiles = legs.reduce((sum, leg) => sum + leg.flyMiles, 0);

  return {
    driveMiles,
    flyMiles,
    label: "multiple destinations"
  };
}

function haversineMiles(fromAirport, toAirport) {
  const radiusMiles = 3958.8;
  const lat1 = toRadians(fromAirport.lat);
  const lon1 = toRadians(fromAirport.lon);
  const lat2 = toRadians(toAirport.lat);
  const lon2 = toRadians(toAirport.lon);
  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return radiusMiles * c;
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function getTotalHoursAtDestination() {
  const pairsToCheck = getAllPairs();
  let totalHours = 0;

  pairsToCheck.forEach(pair => {
    const arrivalValue = pair.dom.arrivalValue.value;
    const departureValue = pair.dom.departureValue.value;
    setFieldError(pair.dom.departureDisplay, pair.dom.departureError, "");

    if (!arrivalValue || !departureValue) {
      return;
    }

    const arrivalDateTime = new Date(arrivalValue);
    const departureDateTime = new Date(departureValue);

    if (Number.isNaN(arrivalDateTime.getTime()) || Number.isNaN(departureDateTime.getTime())) {
      return;
    }

    const diffMs = departureDateTime.getTime() - arrivalDateTime.getTime();
    if (diffMs <= 0) {
      setFieldError(pair.dom.departureDisplay, pair.dom.departureError, "Departure must be after arrival.");
      return;
    }

    totalHours += diffMs / (1000 * 60 * 60);
  });

  return totalHours;
}
