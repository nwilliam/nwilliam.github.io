const dom = cacheDom();
const state = {
  selectedAirport: null
};

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

initAirportAutocomplete({
  input: dom.destInput,
  list: dom.destList,
  onSelect: (airport, label) => {
    state.selectedAirport = airport;
    dom.destInput.value = label;
    setFieldError(dom.destInput, dom.destError, "");
    calculateAndRender();
  },
  onClear: () => {
    state.selectedAirport = null;
  },
  onInput: () => {
    setFieldError(dom.destInput, dom.destError, "");
  }
});

initDateTimePickers(scheduleRecalc);

function calculateAndRender() {
  if (!state.selectedAirport) {
    setFieldError(dom.destInput, dom.destError, "Select a destination airport.");
    clearResults(dom);
    return;
  }

  const numDirectors = parseInt(dom.directorsInput.value, 10) || 0;
  const numManagers = parseInt(dom.managersInput.value, 10) || 0;
  const numGeneralists = parseInt(dom.generalistsInput.value, 10) || 0;
  const hoursAtDest = getHoursAtDestination();

  const data = calculateTripCosts({
    airport: state.selectedAirport,
    hoursAtDest,
    numDirectors,
    numManagers,
    numGeneralists
  });

  renderTotals(dom, data);
  renderBreakdownTable(dom, data, state.selectedAirport, {
    numDirectors,
    numManagers,
    numGeneralists
  });
}

function getHoursAtDestination() {
  const arrivalValue = dom.arrivalValueInput.value;
  const departureValue = dom.departureValueInput.value;

  setFieldError(dom.departureDisplayInput, dom.departureError, "");

  if (!arrivalValue || !departureValue) {
    return 0;
  }

  const arrivalDateTime = new Date(arrivalValue);
  const departureDateTime = new Date(departureValue);

  if (Number.isNaN(arrivalDateTime.getTime()) || Number.isNaN(departureDateTime.getTime())) {
    return 0;
  }

  const diffMs = departureDateTime.getTime() - arrivalDateTime.getTime();
  if (diffMs <= 0) {
    setFieldError(dom.departureDisplayInput, dom.departureError, "Departure must be after arrival.");
    return 0;
  }

  return diffMs / (1000 * 60 * 60);
}
