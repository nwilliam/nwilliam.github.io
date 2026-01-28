const calculateTripCosts = ({
  airport,
  hoursAtDest,
  numDirectors,
  numManagers,
  numGeneralists
}) => {
  const totalEmployees = numDirectors + numManagers + numGeneralists;

  const costDirectors =
    numDirectors * ROLES.directors.hourlyRate * ROLES.directors.prcFactor;
  const costManagers =
    numManagers * ROLES.managers.hourlyRate * ROLES.managers.prcFactor;
  const costGeneralists =
    numGeneralists * ROLES.generalists.hourlyRate * ROLES.generalists.prcFactor;
  const totalEmployeeCostPerHour =
    costDirectors + costManagers + costGeneralists;

  const driveHours =
    airport.drivingFromKSTP / DRIVING_SPEED_MPH * (ROUND_TRIP ? 2 : 1);
  const carsNeeded =
    Math.ceil(totalEmployees / VEHICLE_CAPACITY);
  const driveDistanceCost =
    airport.drivingFromKSTP * COST_PER_MILE.driving * (ROUND_TRIP ? 2 : 1) * carsNeeded;
  const numDays =
    Math.floor((driveHours + hoursAtDest) / HOURS_ALLOWED_PER_DAY);
  const driveLodging =
    totalEmployees * ACCOMMODATIONS_PER_PERSON * numDays;
  const driveEmployeeTotal =
    totalEmployeeCostPerHour * driveHours;
  const driveTotal =
    driveEmployeeTotal + driveDistanceCost + driveLodging;

  const flyHoursKingAir =
    airport.flyingFromKSTP / FLYING_SPEED_MPH.kingAir * (ROUND_TRIP ? 2 : 1);
  const flyDistanceCostKingAir =
    airport.flyingFromKSTP * COST_PER_MILE.flyingKingAir * (ROUND_TRIP ? 2 : 1);
  const flyNumDaysKingAir =
    Math.floor((flyHoursKingAir + hoursAtDest) / HOURS_ALLOWED_PER_DAY_FLYING);
  const flyLodgingKingAir =
    (totalEmployees + 2) * (ACCOMMODATIONS_PER_PERSON) * flyNumDaysKingAir;
  const flyTotalKingAir =
    flyDistanceCostKingAir + flyLodgingKingAir;

  const flyHoursKodiak =
    airport.flyingFromKSTP / FLYING_SPEED_MPH.kodiak * (ROUND_TRIP ? 2 : 1);
  const flyDistanceCostKodiak =
    airport.flyingFromKSTP * COST_PER_MILE.flyingKodiak * (ROUND_TRIP ? 2 : 1);
  const flyNumDaysKodiak =
    Math.floor((flyHoursKodiak + hoursAtDest) / HOURS_ALLOWED_PER_DAY_FLYING);
  const flyLodgingKodiak =
    (totalEmployees + 2) * (ACCOMMODATIONS_PER_PERSON) * flyNumDaysKodiak;
  const flyTotalKodiak =
    flyDistanceCostKodiak + flyLodgingKodiak;

  return {
    totalEmployees,
    costDirectors,
    costManagers,
    costGeneralists,
    totalEmployeeCostPerHour,
    driveHours,
    carsNeeded,
    driveDistanceCost,
    numDays,
    driveLodging,
    driveEmployeeTotal,
    driveTotal,
    flyHoursKingAir,
    flyDistanceCostKingAir,
    flyNumDaysKingAir,
    flyLodgingKingAir,
    flyTotalKingAir,
    flyHoursKodiak,
    flyDistanceCostKodiak,
    flyNumDaysKodiak,
    flyLodgingKodiak,
    flyTotalKodiak
  };
};

window.calculateTripCosts = calculateTripCosts;
