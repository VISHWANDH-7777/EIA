import datetime
from typing import List, Dict, Any, Tuple
from ..config import settings
from ..models.models import EnvironmentalReading

RULES_CATALOG = {
    "PM2.5": {
        "category": "air",
        "unit": "µg/m³",
        "max_limit": settings.THRESHOLD_PM25_MAX,
        "critical_limit": 55.0,
        "rule_id": "AIR-R01",
        "rule_title": "Particulate Matter 2.5 Daily Exposure Standard",
        "standard_ref": "National Ambient Air Quality Standard (NAAQS) 24h limit",
        "mitigation": "Deploy mobile wet mist dust suppression cannons and suspend earth excavation operations in designated sectors.",
    },
    "PM10": {
        "category": "air",
        "unit": "µg/m³",
        "max_limit": settings.THRESHOLD_PM10_MAX,
        "critical_limit": 250.0,
        "rule_id": "AIR-R02",
        "rule_title": "Coarse Particulate Matter 10 Limit",
        "standard_ref": "Clean Air Act Title 40 CFR Part 50",
        "mitigation": "Enforce vehicle tire washing, install perimeter barrier screening, and apply aggregate covers to uncovered stockpiles.",
    },
    "NO2": {
        "category": "air",
        "unit": "µg/m³",
        "max_limit": settings.THRESHOLD_NO2_MAX,
        "critical_limit": 150.0,
        "rule_id": "AIR-R03",
        "rule_title": "Nitrogen Dioxide Ambient Quality Standard",
        "standard_ref": "WHO Ambient Air Quality Guidelines",
        "mitigation": "Inspect diesel machinery for exhaust scrubbers and restrict heavy vehicle idling times to max 3 minutes.",
    },
    "SO2": {
        "category": "air",
        "unit": "µg/m³",
        "max_limit": settings.THRESHOLD_SO2_MAX,
        "critical_limit": 120.0,
        "rule_id": "AIR-R04",
        "rule_title": "Sulfur Dioxide Maximum Exposure Limit",
        "standard_ref": "Industrial Emission Standards Directive",
        "mitigation": "Switch auxiliary generators to low-sulfur ULSD fuel and conduct immediate fuel assay inspection.",
    },
    "pH": {
        "category": "water",
        "unit": "pH",
        "min_limit": settings.THRESHOLD_PH_MIN,
        "max_limit": settings.THRESHOLD_PH_MAX,
        "critical_limit": 9.2,
        "rule_id": "WAT-R01",
        "rule_title": "Effluent and Surface Runoff pH Equilibrium",
        "standard_ref": "Clean Water Act Section 304(a) Criteria",
        "mitigation": "Activate neutralizing injection basins (CO2 dosing or limestone buffer beds) prior to settling pond discharge.",
    },
    "Turbidity": {
        "category": "water",
        "unit": "NTU",
        "max_limit": settings.THRESHOLD_TURBIDITY_MAX,
        "critical_limit": 25.0,
        "rule_id": "WAT-R02",
        "rule_title": "Sediment and Suspended Solids Turbidity Limit",
        "standard_ref": "Surface Water Quality Standard Class II",
        "mitigation": "Inspect and replace silt fence geotextiles; add flocculant dosage in sediment retention ponds.",
    },
    "DO": {
        "category": "water",
        "unit": "mg/L",
        "min_limit": settings.THRESHOLD_DO_MIN,
        "critical_limit": 3.5,
        "rule_id": "WAT-R03",
        "rule_title": "Aquatic Ecosystem Dissolved Oxygen Minimum",
        "standard_ref": "Freshwater Aquatic Life Protection Guideline",
        "mitigation": "Activate mechanical aerators and oxygenation bubblers across stream receiving zones; halt organic runoff discharges.",
    },
    "Noise_Day": {
        "category": "noise",
        "unit": "dBA",
        "max_limit": settings.THRESHOLD_NOISE_DAY_MAX,
        "critical_limit": 75.0,
        "rule_id": "NOI-R01",
        "rule_title": "Daytime Acoustic Boundary Limit (07:00 - 22:00)",
        "standard_ref": "Noise Pollution (Regulation and Control) Rules",
        "mitigation": "Erect temporary acoustic noise absorption hoarding panels (min 3.5m height) around high-decibel cutting and drilling zones.",
    },
    "Noise_Night": {
        "category": "noise",
        "unit": "dBA",
        "max_limit": settings.THRESHOLD_NOISE_NIGHT_MAX,
        "critical_limit": 65.0,
        "rule_id": "NOI-R02",
        "rule_title": "Nighttime Sensitive Receptor Sound Limit (22:00 - 07:00)",
        "standard_ref": "Environmental Noise Guidelines for Residential Zones",
        "mitigation": "Immediately shut down non-essential impact generators, hydraulic pile hammers, and heavy vibratory equipment until daytime hours.",
    },
}

def evaluate_risk(readings: List[EnvironmentalReading]) -> Dict[str, Any]:
    """
    Pure deterministic rule-based risk assessment.
    Zero machine learning, zero AI generation.
    """
    methodology = "Deterministic Rule-Based Assessment Matrix (Statutory EIA Guidelines)"
    rule_set_version = "v2.4-EIA-Statutory"

    valid_readings = [r for r in readings if r.is_valid and r.value is not None]

    if not valid_readings:
        return {
            "risk_level": "Insufficient Data",
            "total_evaluated": 0,
            "breach_count": 0,
            "critical_breach_count": 0,
            "breaches": [],
            "methodology": methodology,
            "rule_set_version": rule_set_version,
            "summary": "Insufficient valid environmental readings available to perform a reliable risk assessment.",
        }

    breaches = []
    critical_count = 0

    for r in valid_readings:
        rule = RULES_CATALOG.get(r.parameter)
        if not rule:
            continue

        breached = False
        is_critical = False
        threshold_desc = ""

        if "max_limit" in rule and r.value > rule["max_limit"]:
            breached = True
            threshold_desc = f"Max {rule['max_limit']} {rule['unit']}"
            if "critical_limit" in rule and r.value >= rule["critical_limit"]:
                is_critical = True

        if "min_limit" in rule and r.value < rule["min_limit"]:
            breached = True
            threshold_desc = f"Min {rule['min_limit']} {rule['unit']}"
            if "critical_limit" in rule and r.value <= rule["critical_limit"]:
                is_critical = True

        if breached:
            if is_critical:
                critical_count += 1

            diff_str = (
                f"+{((r.value - rule.get('max_limit', 0)) / rule.get('max_limit', 1)) * 100:.1f}% above limit"
                if "max_limit" in rule
                else f"-{((rule.get('min_limit', 1) - r.value) / rule.get('min_limit', 1)) * 100:.1f}% below minimum"
            )

            breaches.append({
                "parameter": r.parameter,
                "category": r.category,
                "reading_value": r.value,
                "unit": r.unit,
                "threshold_value": threshold_desc,
                "rule_id": rule["rule_id"],
                "rule_title": rule["rule_title"],
                "standard_reference": rule["standard_ref"],
                "is_critical": is_critical,
                "explanation": f"Measurement of {r.value} {r.unit} breaches threshold ({threshold_desc}) by {diff_str}.",
                "recommended_mitigation": rule["mitigation"],
            })

    if len(breaches) == 0:
        risk_level = "Low"
        summary = f"All {len(valid_readings)} evaluated parameters conform strictly to environmental baseline thresholds."
    elif critical_count > 0 or len(breaches) >= 2:
        risk_level = "High"
        summary = f"High Environmental Risk: {len(breaches)} breach(es) detected, including {critical_count} critical violation(s)."
    else:
        risk_level = "Medium"
        summary = f"Medium Environmental Risk: {len(breaches)} threshold breach detected. Corrective actions required."

    return {
        "risk_level": risk_level,
        "total_evaluated": len(valid_readings),
        "breach_count": len(breaches),
        "critical_breach_count": critical_count,
        "breaches": breaches,
        "methodology": methodology,
        "rule_set_version": rule_set_version,
        "summary": summary,
    }
