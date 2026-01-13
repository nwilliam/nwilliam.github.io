const HOURLY_RATE = {
  directors: 86.53,
  managers: 67.46,
  generalists: 51.40
};

const PRC_FACTORS = {
  directors: 5.7,
  managers: 3.8,
  generalists: 2.4
};

const COST_PER_MILE = {
  driving: 0.75,
  flyingKingAir: 9.75,
  flyingKodiak: 4.9 //completely made up
};

const VEHICLE_CAPACITY = 4;
const LODGING_PER_PERSON = 150; //includes meals? No way to figure out TOD so lets say hotel = 120 + (11 + 13 + 19)/3 = 11 so 22-ish? So 142? Maybe 150?
const PILOT_LODGING = 272; // Why are we doing this separately? Maybe we should just use the same rate as generalists?
const DRIVING_SPEED_MPH = 60;
const FLYING_SPEED_MPH_KING_AIR = 280;
const FLYING_SPEED_MPH_KODIAK = 195;
const HOURS_ALLOWED_PER_DAY = 8;
const HOURS_ALLOWED_PER_DAY_FLYING = 12;
const ROUND_TRIP = true; // can be used to multiply distances/times
