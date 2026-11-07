export interface ConverterConfig {
  cat: string;
  title: string;
  units: Record<string, number>;
  names: Record<string, string>;
  defFrom: string;
  defTo: string;
  isTemp?: boolean;
}

export const CONVERTERS: Record<string, ConverterConfig> = {
  'len-conv': {
    cat: 'converter',
    title: 'Length Converter',
    units: { m: 1, km: 1000, cm: 0.01, mm: 0.001, mi: 1609.344, yd: 0.9144, ft: 0.3048, in: 0.0254, nmi: 1852 },
    names: {
      m: 'Meter (m)',
      km: 'Kilometer (km)',
      cm: 'Centimeter (cm)',
      mm: 'Millimeter (mm)',
      mi: 'Mile (mi)',
      yd: 'Yard (yd)',
      ft: 'Foot (ft)',
      in: 'Inch (in)',
      nmi: 'Nautical Mile (nmi)',
    },
    defFrom: 'm',
    defTo: 'km',
  },
  'wt-conv': {
    cat: 'converter',
    title: 'Weight & Mass',
    units: { kg: 1, g: 0.001, mg: 1e-6, lb: 0.45359237, oz: 0.028349523, t: 1000 },
    names: {
      kg: 'Kilogram (kg)',
      g: 'Gram (g)',
      mg: 'Milligram (mg)',
      lb: 'Pound (lb)',
      oz: 'Ounce (oz)',
      t: 'Metric Ton (t)',
    },
    defFrom: 'kg',
    defTo: 'lb',
  },
  'temp-conv': {
    cat: 'converter',
    title: 'Temperature Converter',
    units: { '°C': 1, '°F': 1, K: 1 },
    names: { '°C': 'Celsius (°C)', '°F': 'Fahrenheit (°F)', K: 'Kelvin (K)' },
    defFrom: '°C',
    defTo: '°F',
    isTemp: true,
  },
  'spd-conv': {
    cat: 'converter',
    title: 'Speed Converter',
    units: { 'km/h': 1, 'm/s': 3.6, mph: 1.609344, knot: 1.852, 'ft/s': 1.09728 },
    names: {
      'km/h': 'Kilometer/hr (km/h)',
      'm/s': 'Meter/sec (m/s)',
      mph: 'Miles/hr (mph)',
      knot: 'Knots (kn)',
      'ft/s': 'Feet/sec (ft/s)',
    },
    defFrom: 'km/h',
    defTo: 'mph',
  },
  'data-conv': {
    cat: 'converter',
    title: 'Digital Storage Units',
    units: {
      Bytes: 1,
      KB: 1024,
      MB: 1048576,
      GB: 1073741824,
      TB: 1099511627776,
      PB: 1125899906842624,
    },
    names: {
      Bytes: 'Bytes (B)',
      KB: 'Kilobytes (KB)',
      MB: 'Megabytes (MB)',
      GB: 'Gigabytes (GB)',
      TB: 'Terabytes (TB)',
      PB: 'Petabytes (PB)',
    },
    defFrom: 'MB',
    defTo: 'GB',
  },
  'area-conv': {
    cat: 'converter',
    title: 'Area Converter',
    units: { m2: 1, km2: 1000000, ft2: 0.092903, yd2: 0.836127, acre: 4046.856, ha: 10000 },
    names: {
      m2: 'Square Meter (m²)',
      km2: 'Square Kilometer (km²)',
      ft2: 'Square Foot (ft²)',
      yd2: 'Square Yard (yd²)',
      acre: 'Acre (ac)',
      ha: 'Hectare (ha)',
    },
    defFrom: 'm2',
    defTo: 'ft2',
  },
  'vol-conv': {
    cat: 'converter',
    title: 'Volume & Capacity',
    units: { L: 1, mL: 0.001, gal: 3.78541, floz: 0.0295735, cup: 0.24, pt: 0.473176, m3: 1000 },
    names: {
      L: 'Liter (L)',
      mL: 'Milliliter (mL)',
      gal: 'US Gallon (gal)',
      floz: 'Fluid Ounce (fl oz)',
      cup: 'Cup (cup)',
      pt: 'Pint (pt)',
      m3: 'Cubic Meter (m³)',
    },
    defFrom: 'L',
    defTo: 'gal',
  },
  'time-conv': {
    cat: 'converter',
    title: 'Time Duration Converter',
    units: { ms: 0.001, s: 1, min: 60, h: 3600, d: 86400, wk: 604800, yr: 31536000 },
    names: {
      ms: 'Milliseconds (ms)',
      s: 'Seconds (s)',
      min: 'Minutes (min)',
      h: 'Hours (h)',
      d: 'Days (d)',
      wk: 'Weeks (wk)',
      yr: 'Years (yr)',
    },
    defFrom: 'h',
    defTo: 'min',
  },
};
