const cacheDom = () => ({
  destInput: document.getElementById("dest1"),
  destList: document.getElementById("dest1-list"),
  destError: document.getElementById("dest1-error"),
  arrivalDisplayInput: document.getElementById("arrival-display"),
  arrivalValueInput: document.getElementById("arrival-datetime"),
  departureDisplayInput: document.getElementById("departure-display"),
  departureValueInput: document.getElementById("departure-datetime"),
  departureError: document.getElementById("departure-error"),
  directorsLabel: document.getElementById("directors-label"),
  managersLabel: document.getElementById("managers-label"),
  generalistsLabel: document.getElementById("generalists-label"),
  directorsTooltip: document.getElementById("directors-tooltip"),
  managersTooltip: document.getElementById("managers-tooltip"),
  generalistsTooltip: document.getElementById("generalists-tooltip"),
  directorsInput: document.getElementById("directors"),
  managersInput: document.getElementById("managers"),
  generalistsInput: document.getElementById("generalists"),
  driveTotal: document.getElementById("drive-total"),
  flyTotal: document.getElementById("fly-total"),
  flyTotalKodiak: document.getElementById("fly-total-kodiak"),
  breakdownTable: document.getElementById("breakdownTable")
});

window.cacheDom = cacheDom;
