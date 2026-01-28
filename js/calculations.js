const calculateTripCosts = ({
  driveMiles,
  flyMiles,
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

  const driveHours = driveMiles / DRIVING_SPEED_MPH;
  const carsNeeded =
    Math.ceil(totalEmployees / VEHICLE_CAPACITY);
  const driveDistanceCost =
    driveMiles * COST_PER_MILE.driving * carsNeeded;
  const numDays =
    Math.floor((driveHours + hoursAtDest) / HOURS_ALLOWED_PER_DAY);
  const driveLodging =
    totalEmployees * ACCOMMODATIONS_PER_PERSON * numDays;
  const driveEmployeeTotal =
    totalEmployeeCostPerHour * driveHours;
  const driveTotal =
    driveEmployeeTotal + driveDistanceCost + driveLodging;

  const flyHoursKingAir =
    flyMiles / FLYING_SPEED_MPH.kingAir;
  const flyDistanceCostKingAir =
    flyMiles * COST_PER_MILE.flyingKingAir;
  const flyNumDaysKingAir =
    Math.floor((flyHoursKingAir + hoursAtDest) / HOURS_ALLOWED_PER_DAY_FLYING);
  const flyLodgingKingAir =
    (totalEmployees + 2) * (ACCOMMODATIONS_PER_PERSON) * flyNumDaysKingAir;
  const flyTotalKingAir =
    flyDistanceCostKingAir + flyLodgingKingAir;

  const flyHoursKodiak =
    flyMiles / FLYING_SPEED_MPH.kodiak;
  const flyDistanceCostKodiak =
    flyMiles * COST_PER_MILE.flyingKodiak;
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
