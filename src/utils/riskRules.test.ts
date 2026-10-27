import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateEnvironmentalRisk,
  DEFAULT_THRESHOLDS,
  EnvironmentalReading,
} from './riskRules.ts';

test('returns Insufficient Data when no valid readings provided', () => {
  const result = evaluateEnvironmentalRisk([]);
  assert.equal(result.riskLevel, 'Insufficient Data');
  assert.equal(result.totalEvaluated, 0);
  assert.equal(result.breachCount, 0);
  assert.match(result.summary, /Insufficient valid environmental readings/);
});

test('classifies as Low Risk when all readings comply with thresholds', () => {
  const normalReadings: EnvironmentalReading[] = [
    {
      projectId: 'p1',
      category: 'air',
      parameter: 'PM2.5',
      value: 18.5, // limit 35
      unit: 'µg/m³',
      timestamp: new Date().toISOString(),
      source: 'sensor',
    },
    {
      projectId: 'p1',
      category: 'water',
      parameter: 'pH',
      value: 7.2, // normal [6.5, 8.5]
      unit: 'pH',
      timestamp: new Date().toISOString(),
      source: 'manual',
    },
    {
      projectId: 'p1',
      category: 'noise',
      parameter: 'Noise_Day',
      value: 58.0, // limit 65
      unit: 'dBA',
      timestamp: new Date().toISOString(),
      source: 'sensor',
    },
  ];

  const result = evaluateEnvironmentalRisk(normalReadings);
  assert.equal(result.riskLevel, 'Low');
  assert.equal(result.breachCount, 0);
  assert.equal(result.totalEvaluated, 3);
  assert.match(result.summary, /conform strictly/);
});

test('classifies as Medium Risk when a single non-critical breach occurs', () => {
  const readings: EnvironmentalReading[] = [
    {
      projectId: 'p1',
      category: 'air',
      parameter: 'PM2.5',
      value: 40.0, // limit 35, critical is 55
      unit: 'µg/m³',
      timestamp: new Date().toISOString(),
      source: 'sensor',
    },
    {
      projectId: 'p1',
      category: 'water',
      parameter: 'pH',
      value: 7.4,
      unit: 'pH',
      timestamp: new Date().toISOString(),
      source: 'sensor',
    },
  ];

  const result = evaluateEnvironmentalRisk(readings);
  assert.equal(result.riskLevel, 'Medium');
  assert.equal(result.breachCount, 1);
  assert.equal(result.criticalBreachCount, 0);
  assert.equal(result.breaches[0].parameter, 'PM2.5');
  assert.equal(result.breaches[0].ruleId, 'AIR-R01');
  assert.ok(result.breaches[0].recommendedMitigation.includes('mist dust suppression'));
});

test('classifies as High Risk when critical limit is exceeded', () => {
  const readings: EnvironmentalReading[] = [
    {
      projectId: 'p1',
      category: 'air',
      parameter: 'PM2.5',
      value: 68.0, // critical limit is 55
      unit: 'µg/m³',
      timestamp: new Date().toISOString(),
      source: 'sensor',
    },
  ];

  const result = evaluateEnvironmentalRisk(readings);
  assert.equal(result.riskLevel, 'High');
  assert.equal(result.breachCount, 1);
  assert.equal(result.criticalBreachCount, 1);
  assert.equal(result.breaches[0].isCritical, true);
});

test('classifies as High Risk when multiple parameters breach thresholds', () => {
  const readings: EnvironmentalReading[] = [
    {
      projectId: 'p1',
      category: 'water',
      parameter: 'DO',
      value: 4.2, // minLimit 5.0, so breached
      unit: 'mg/L',
      timestamp: new Date().toISOString(),
      source: 'manual',
    },
    {
      projectId: 'p1',
      category: 'noise',
      parameter: 'Noise_Day',
      value: 69.5, // maxLimit 65.0, so breached
      unit: 'dBA',
      timestamp: new Date().toISOString(),
      source: 'sensor',
    },
  ];

  const result = evaluateEnvironmentalRisk(readings);
  assert.equal(result.riskLevel, 'High');
  assert.equal(result.breachCount, 2);
  assert.equal(result.breaches.length, 2);
});
