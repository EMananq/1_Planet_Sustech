/**
 * Carbon Emission Calculator Service
 * Contains formulas for calculating CO2 emissions from various activities
 */

// Emission factors in kg CO2 per unit
const emissionFactors = {
  // Transportation (kg CO2 per km)
  transport: {
    car_petrol: 0.12,
    car_diesel: 0.15,
    car_electric: 0.05,
    bus: 0.05,
    train: 0.04,
    metro: 0.03,
    motorcycle: 0.08,
    bicycle: 0,
    walking: 0,
    flight_short: 0.255,  // < 1500 km
    flight_long: 0.195    // > 1500 km
  },
  
  // Energy (kg CO2 per kWh or unit)
  energy: {
    electricity: 0.5,      // kg CO2 per kWh (varies by country)
    natural_gas: 0.185,    // kg CO2 per kWh
    heating_oil: 0.25,     // kg CO2 per kWh
    lpg: 0.214,            // kg CO2 per kWh
    coal: 0.34             // kg CO2 per kWh
  },
  
  // Food (kg CO2 per meal/serving)
  food: {
    beef: 6.0,
    lamb: 5.5,
    pork: 3.5,
    chicken: 2.0,
    fish: 1.5,
    eggs: 1.2,
    dairy: 1.0,
    vegetarian: 1.5,
    vegan: 0.9
  },
  
  // Waste (kg CO2 per kg)
  waste: {
    general_waste: 0.5,
    recycling: 0.1,
    composting: 0.05
  },
  
  // Shopping/Consumption (kg CO2 per item or currency)
  consumption: {
    clothing: 15,          // per item average
    electronics: 50,       // per item average
    furniture: 100         // per item average
  }
};

/**
 * Calculate CO2 emission for a given activity
 * @param {string} category - Category of activity (transport, energy, food, waste)
 * @param {string} activityType - Type of activity within category
 * @param {number} value - Quantity/value of the activity
 * @param {string} unit - Unit of measurement
 * @returns {object} - Calculated emission and details
 */
function calculateEmission(category, activityType, value, unit) {
  const categoryFactors = emissionFactors[category];
  
  if (!categoryFactors) {
    throw new Error(`Unknown category: ${category}`);
  }
  
  const factor = categoryFactors[activityType];
  
  if (factor === undefined) {
    throw new Error(`Unknown activity type: ${activityType} in category ${category}`);
  }
  
  const emission = value * factor;
  
  return {
    category,
    activityType,
    value,
    unit,
    emissionFactor: factor,
    co2Emission: Math.round(emission * 1000) / 1000, // Round to 3 decimal places
    co2Unit: 'kg'
  };
}

/**
 * Get emission factor for an activity
 * @param {string} category 
 * @param {string} activityType 
 * @returns {number} - Emission factor
 */
function getEmissionFactor(category, activityType) {
  const categoryFactors = emissionFactors[category];
  if (!categoryFactors || categoryFactors[activityType] === undefined) {
    return null;
  }
  return categoryFactors[activityType];
}

/**
 * Get all available activity types
 * @returns {object} - All categories and their activity types
 */
function getAllActivityTypes() {
  return {
    transport: Object.keys(emissionFactors.transport).map(type => ({
      type,
      factor: emissionFactors.transport[type],
      unit: 'km'
    })),
    energy: Object.keys(emissionFactors.energy).map(type => ({
      type,
      factor: emissionFactors.energy[type],
      unit: 'kWh'
    })),
    food: Object.keys(emissionFactors.food).map(type => ({
      type,
      factor: emissionFactors.food[type],
      unit: 'meal'
    })),
    waste: Object.keys(emissionFactors.waste).map(type => ({
      type,
      factor: emissionFactors.waste[type],
      unit: 'kg'
    })),
    consumption: Object.keys(emissionFactors.consumption).map(type => ({
      type,
      factor: emissionFactors.consumption[type],
      unit: 'item'
    }))
  };
}

/**
 * Calculate total emissions from an array of activities
 * @param {Array} activities - Array of activity objects
 * @returns {object} - Total emissions and breakdown by category
 */
function calculateTotalEmissions(activities) {
  const totals = {
    total: 0,
    byCategory: {},
    byActivityType: {}
  };
  
  activities.forEach(activity => {
    const { category, activityType, co2Emission } = activity;
    
    totals.total += co2Emission;
    
    if (!totals.byCategory[category]) {
      totals.byCategory[category] = 0;
    }
    totals.byCategory[category] += co2Emission;
    
    const key = `${category}_${activityType}`;
    if (!totals.byActivityType[key]) {
      totals.byActivityType[key] = 0;
    }
    totals.byActivityType[key] += co2Emission;
  });
  
  // Round all values
  totals.total = Math.round(totals.total * 100) / 100;
  Object.keys(totals.byCategory).forEach(cat => {
    totals.byCategory[cat] = Math.round(totals.byCategory[cat] * 100) / 100;
  });
  Object.keys(totals.byActivityType).forEach(type => {
    totals.byActivityType[type] = Math.round(totals.byActivityType[type] * 100) / 100;
  });
  
  return totals;
}

module.exports = {
  emissionFactors,
  calculateEmission,
  getEmissionFactor,
  getAllActivityTypes,
  calculateTotalEmissions
};
