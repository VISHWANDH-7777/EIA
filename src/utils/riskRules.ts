/**
 * Pure Rule-Based Environmental Risk Assessment Engine
 * 
 * Strict deterministic logic based on standard Environmental Impact Assessment guidelines.
 * No machine learning, probabilistic AI, or black-box predictions.
 */

export interface EnvironmentalReading {
  id?: string;
  projectId: string;
  stationId?: string;
  category: 'air' | 'water' | 'noise';
  parameter: string; // e.g. PM2.5, PM10, NO2, pH, Turbidity, DO, Noise_Day, Noise_Night
  value: number;
  unit: string;
  timestamp: string;
  source: 'manual' | 'sensor' | 'simulated';
  isValid?: boolean;
}

export interface ThresholdConfig {
  parameter: string;
  category: 'air' | 'water' | 'noise';
  unit: string;
  minLimit?: number;
  maxLimit?: number;
  criticalLimit?: number;
  ruleId: string;
  ruleTitle: string;
  standardReference: string;
  recommendedMitigation: string;
}

export const DEFAULT_THRESHOLDS: Record<string, ThresholdConfig> = {
  'PM2.5': {
    parameter: 'PM2.5',
    category: 'air',
    unit: 'µg/m³',
    maxLimit: 35.0,
    criticalLimit: 55.0,
    ruleId: 'AIR-R01',
    ruleTitle: 'Particulate Matter 2.5 Daily Exposure Standard',
    standardReference: 'National Ambient Air Quality Standard (NAAQS) 24h limit',
    recommendedMitigation: 'Deploy mobile wet mist dust suppression cannons and suspend earth excavation operations in designated sectors.',
  },
  'PM10': {
    parameter: 'PM10',
    category: 'air',
    unit: 'µg/m³',
    maxLimit: 150.0,
    criticalLimit: 250.0,
    ruleId: 'AIR-R02',
    ruleTitle: 'Coarse Particulate Matter 10 Limit',
    standardReference: 'Clean Air Act Title 40 CFR Part 50',
    recommendedMitigation: 'Enforce vehicle tire washing, install perimeter barrier screening, and apply aggregate covers to uncovered stockpiles.',
  },
  'NO2': {
    parameter: 'NO2',
    category: 'air',
    unit: 'µg/m³',
    maxLimit: 100.0,
    criticalLimit: 150.0,
    ruleId: 'AIR-R03',
    ruleTitle: 'Nitrogen Dioxide Ambient Quality Standard',
    standardReference: 'WHO Ambient Air Quality Guidelines',
    recommendedMitigation: 'Inspect diesel machinery for exhaust scrubbers and restrict heavy vehicle idling times to max 3 minutes.',
  },
  'SO2': {
    parameter: 'SO2',
    category: 'air',
    unit: 'µg/m³',
    maxLimit: 75.0,
    criticalLimit: 120.0,
    ruleId: 'AIR-R04',
    ruleTitle: 'Sulfur Dioxide Maximum Exposure Limit',
    standardReference: 'Industrial Emission Standards Directive',
    recommendedMitigation: 'Switch auxiliary generators to low-sulfur ULSD fuel and conduct immediate fuel assay inspection.',
  },
  'pH': {
    parameter: 'pH',
    category: 'water',
    unit: 'pH',
    minLimit: 6.5,
    maxLimit: 8.5,
    criticalLimit: 9.2,
    ruleId: 'WAT-R01',
    ruleTitle: 'Effluent and Surface Runoff pH Equilibrium',
    standardReference: 'Clean Water Act Section 304(a) Criteria',
    recommendedMitigation: 'Activate neutralizing injection basins (CO2 dosing or limestone buffer beds) prior to settling pond discharge.',
  },
  'Turbidity': {
    parameter: 'Turbidity',
    category: 'water',
    unit: 'NTU',
    maxLimit: 5.0,
    criticalLimit: 25.0,
    ruleId: 'WAT-R02',
    ruleTitle: 'Sediment and Suspended Solids Turbidity Limit',
    standardReference: 'Surface Water Quality Standard Class II',
    recommendedMitigation: 'Inspect and replace silt fence geotextiles; add flocculant dosage in sediment retention ponds.',
  },
  'DO': {
    parameter: 'DO',
    category: 'water',
    unit: 'mg/L',
    minLimit: 5.0,
    criticalLimit: 3.5,
    ruleId: 'WAT-R03',
    ruleTitle: 'Aquatic Ecosystem Dissolved Oxygen Minimum',
    standardReference: 'Freshwater Aquatic Life Protection Guideline',
    recommendedMitigation: 'Activate mechanical aerators and oxygenation bubblers across stream receiving zones; halt organic runoff discharges.',
  },
  'Noise_Day': {
    parameter: 'Noise_Day',
    category: 'noise',
    unit: 'dBA',
    maxLimit: 65.0,
    criticalLimit: 75.0,
    ruleId: 'NOI-R01',
    ruleTitle: 'Daytime Acoustic Boundary Limit (07:00 - 22:00)',
    standardReference: 'Noise Pollution (Regulation and Control) Rules',
    recommendedMitigation: 'Erect temporary acoustic noise absorption hoarding panels (min 3.5m height) around high-decibel cutting and drilling zones.',
  },
  'Noise_Night': {
    parameter: 'Noise_Night',
    category: 'noise',
    unit: 'dBA',
    maxLimit: 55.0,
    criticalLimit: 65.0,
    ruleId: 'NOI-R02',
    ruleTitle: 'Nighttime Sensitive Receptor Sound Limit (22:00 - 07:00)',
    standardReference: 'Environmental Noise Guidelines for Residential Zones',
    recommendedMitigation: 'Immediately shut down non-essential impact generators, hydraulic pile hammers, and heavy vibratory equipment until daytime hours.',
  },
};

export interface BreachDetail {
  parameter: string;
  category: 'air' | 'water' | 'noise';
  readingValue: number;
  unit: string;
  thresholdValue: string;
  ruleId: string;
  ruleTitle: string;
  standardReference: string;
  isCritical: boolean;
  explanation: string;
  recommendedMitigation: string;
}

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Insufficient Data';

export interface RiskAssessmentResult {
  riskLevel: RiskLevel;
  totalEvaluated: number;
  breachCount: number;
  criticalBreachCount: number;
  breaches: BreachDetail[];
  methodology: string;
  ruleSetVersion: string;
  timestamp: string;
  summary: string;
}

export function evaluateEnvironmentalRisk(
  readings: EnvironmentalReading[],
  thresholds: Record<string, ThresholdConfig> = DEFAULT_THRESHOLDS
): RiskAssessmentResult {
  const timestamp = new Date().toISOString();
  const ruleSetVersion = 'v2.4-EIA-Statutory';
  const methodology = 'Deterministic Rule-Based Assessment Matrix (Zero Machine Learning / Non-Probabilistic)';

  const validReadings = readings.filter(r => r.isValid !== false && typeof r.value === 'number' && !isNaN(r.value));

  if (validReadings.length === 0) {
    return {
      riskLevel: 'Insufficient Data',
      totalEvaluated: 0,
      breachCount: 0,
      criticalBreachCount: 0,
      breaches: [],
      methodology,
      ruleSetVersion,
      timestamp,
      summary: 'Insufficient valid environmental readings available to perform a reliable risk assessment.',
    };
  }

  const breaches: BreachDetail[] = [];
  let criticalCount = 0;

  for (const reading of validReadings) {
    const config = thresholds[reading.parameter];
    if (!config) continue;

    let breached = false;
    let isCritical = false;
    let thresholdDesc = '';

    if (config.maxLimit !== undefined && reading.value > config.maxLimit) {
      breached = true;
      thresholdDesc = `Max ${config.maxLimit} ${config.unit}`;
      if (config.criticalLimit !== undefined && reading.value >= config.criticalLimit) {
        isCritical = true;
      }
    }

    if (config.minLimit !== undefined && reading.value < config.minLimit) {
      breached = true;
      thresholdDesc = `Min ${config.minLimit} ${config.unit}`;
      if (config.criticalLimit !== undefined && reading.value <= config.criticalLimit) {
        isCritical = true;
      }
    }

    if (breached) {
      if (isCritical) {
        criticalCount++;
      }

      const diff = config.maxLimit !== undefined
        ? `+${(((reading.value - config.maxLimit) / config.maxLimit) * 100).toFixed(1)}% above maximum threshold`
        : `-${(((config.minLimit! - reading.value) / config.minLimit!) * 100).toFixed(1)}% below minimum allowable standard`;

      breaches.push({
        parameter: reading.parameter,
        category: reading.category,
        readingValue: reading.value,
        unit: reading.unit,
        thresholdValue: thresholdDesc,
        ruleId: config.ruleId,
        ruleTitle: config.ruleTitle,
        standardReference: config.standardReference,
        isCritical,
        explanation: `Reading of ${reading.value} ${reading.unit} breaches statutory limit (${thresholdDesc}) by ${diff}. Rule: ${config.ruleTitle} (${config.standardReference}).`,
        recommendedMitigation: config.recommendedMitigation,
      });
    }
  }

  let riskLevel: RiskLevel = 'Low';
  let summary = '';

  if (breaches.length === 0) {
    riskLevel = 'Low';
    summary = `All ${validReadings.length} evaluated parameters conform strictly to environmental baseline thresholds.`;
  } else if (criticalCount > 0 || breaches.length >= 2) {
    riskLevel = 'High';
    summary = `High Environmental Risk: ${breaches.length} threshold breach(es) detected, including ${criticalCount} critical violation(s). Immediate mitigation enforcement required.`;
  } else {
    riskLevel = 'Medium';
    summary = `Medium Environmental Risk: ${breaches.length} threshold breach detected. Corrective actions must be logged and monitored.`;
  }

  return {
    riskLevel,
    totalEvaluated: validReadings.length,
    breachCount: breaches.length,
    criticalBreachCount: criticalCount,
    breaches,
    methodology,
    ruleSetVersion,
    timestamp,
    summary,
  };
}
