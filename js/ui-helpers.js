const tooltip = (text, iconPath = "assets/icons/question-mark.svg") => `
  <span class="tooltip-icon">
    <img alt="tooltip" src="${iconPath}" />
    <span class="tooltip-text">${text}</span>
  </span>
`;

const initRoleLabels = (dom) => {
  dom.directorsLabel.textContent = `${ROLES.directors.fullLabel}`;
  dom.managersLabel.textContent = `${ROLES.managers.fullLabel}`;
  dom.generalistsLabel.textContent = `${ROLES.generalists.fullLabel}`;
  dom.directorsTooltip.innerHTML = `${tooltip(`Each level of employee has a different
 level of value that they create for MnDOT, which requires them to be separated for calculation purposes. For calculation
 purposes only, ${ROLES.directors.shortLabel} have a rough yearly income greater than $${ROLES.directors.baseAvgYearly}.`)}`;
  dom.managersTooltip.innerHTML = `${tooltip(`Each level of employee has a different
 level of value that they create for MnDOT, which requires them to be separated for calculation purposes. For calculation
 purposes only, ${ROLES.managers.shortLabel} have a rough yearly income of between $${ROLES.managers.baseAvgYearly} and $${ROLES.directors.baseAvgYearly}.`)}`;
  dom.generalistsTooltip.innerHTML = `${tooltip(`Each level of employee has a different
 level of value that they create for MnDOT, which requires them to be separated for calculation purposes. For calculation
 purposes only, ${ROLES.generalists.shortLabel} have a rough yearly income of less than $${ROLES.managers.baseAvgYearly}.`)}`;
};

const clearResults = (dom) => {
  dom.driveTotal.textContent = "$--";
  dom.flyTotal.textContent = "$--";
  dom.flyTotalKodiak.textContent = "$--";
  dom.breakdownTable.innerHTML =
    `<tr><td colspan="3">Enter inputs to view calculation details.</td></tr>`;
};

const renderTotals = (dom, data) => {
  dom.driveTotal.textContent = "$" + data.driveTotal.toLocaleString(undefined, {maximumFractionDigits: 0})
    + " - " + data.driveHours.toLocaleString(undefined, {maximumFractionDigits: 1}) + "hrs";
  dom.flyTotal.textContent = "$" + data.flyTotalKingAir.toLocaleString(undefined, {maximumFractionDigits: 0})
    + " - " + data.flyHoursKingAir.toLocaleString(undefined, {maximumFractionDigits: 1}) + "hrs";
  dom.flyTotalKodiak.textContent = "$" + data.flyTotalKodiak.toLocaleString(undefined, {maximumFractionDigits: 0})
    + " - " + data.flyHoursKodiak.toLocaleString(undefined, {maximumFractionDigits: 1}) + "hrs";
};

window.tooltip = tooltip;
window.initRoleLabels = initRoleLabels;
window.clearResults = clearResults;
window.renderTotals = renderTotals;
