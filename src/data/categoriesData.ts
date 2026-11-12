export interface ToolItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  targetScreen: string;
  categoryId?: string;
  categoryName?: string;
}

export interface SubCategory {
  id: string;
  name: string;
  icon: string;
  gradientClass: string;
  description: string;
  tools: ToolItem[];
}

export interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  gradientClass: string;
  description: string;
  tools: ToolItem[];
  subcategories?: SubCategory[];
}

export const CATEGORIES_DATA: Record<string, CategoryItem> = {
  "calculator": {
    "id": "calculator",
    "name": "Calculator",
    "icon": "calc",
    "gradientClass": "g4",
    "description": "Precision computation, scientific functions and math tools",
    "tools": [
      {
        "id": "std-calc",
        "name": "Standard Calculator",
        "description": "Clean arithmetic with live evaluation and memory",
        "icon": "calc",
        "targetScreen": "std-calc"
      },
      {
        "id": "sci-calc",
        "name": "Scientific Calculator",
        "description": "Trigonometry (DEG/RAD), powers, square root & parentheses",
        "icon": "spark",
        "targetScreen": "sci-calc"
      },
      {
        "id": "unit-calc",
        "name": "Unit & Metric Calculator",
        "description": "Instant multi-metric conversion and calculation",
        "icon": "conv",
        "targetScreen": "unit-calc"
      },
      {
        "id": "pct-calc",
        "name": "Percentage Calculator",
        "description": "Quick percent increase, decrease & margin values",
        "icon": "calc",
        "targetScreen": "pct-calc"
      },
      {
        "id": "age-calc",
        "name": "Date & Age Calculator",
        "description": "Exact day, month, and year intervals between dates",
        "icon": "dev",
        "targetScreen": "age-calc"
      }
    ]
  },
  "finance": {
    "id": "finance",
    "name": "Finance & Money",
    "icon": "finance",
    "gradientClass": "g2",
    "description": "Personal financial calculators, currency conversion, tips, discount and loan estimates",
    "tools": [
      {
        "id": "expense-tracker",
        "name": "Expenses Tracker",
        "description": "Log income & expenses, track budget balance and category breakdowns",
        "icon": "wallet",
        "targetScreen": "expense-tracker"
      },
      {
        "id": "cur-conv",
        "name": "Currency Converter",
        "description": "Real-time exchange rates with live public market feeds",
        "icon": "conv",
        "targetScreen": "cur-conv"
      },
      {
        "id": "emi-calc",
        "name": "Loan & EMI Estimator",
        "description": "Monthly loan installment and interest breakdown",
        "icon": "sliders",
        "targetScreen": "emi-calc"
      },
      {
        "id": "disc-calc",
        "name": "Discount & Sale Price",
        "description": "Determine markdown savings and sales tax",
        "icon": "star",
        "targetScreen": "disc-calc"
      },
      {
        "id": "tip-calc",
        "name": "Tip & Bill Splitter",
        "description": "Calculate restaurant gratuity and split across diners",
        "icon": "bolt",
        "targetScreen": "tip-calc"
      }
    ]
  },
  "converter": {
    "id": "converter",
    "name": "Converter",
    "icon": "conv",
    "gradientClass": "g2",
    "description": "Universal unit metrics and measurement transformations",
    "tools": [
      {
        "id": "len-conv",
        "name": "Length Converter",
        "description": "Meters, kilometers, centimeters, inches, feet & miles",
        "icon": "conv",
        "targetScreen": "len-conv"
      },
      {
        "id": "wt-conv",
        "name": "Weight & Mass",
        "description": "Kilograms, grams, pounds, ounces & milligrams",
        "icon": "conv",
        "targetScreen": "wt-conv"
      },
      {
        "id": "temp-conv",
        "name": "Temperature Converter",
        "description": "Celsius, Fahrenheit, and Kelvin temperature scales",
        "icon": "sun",
        "targetScreen": "temp-conv"
      },
      {
        "id": "spd-conv",
        "name": "Speed Converter",
        "description": "km/h, mph, meters per second, and nautical knots",
        "icon": "gauge",
        "targetScreen": "spd-conv"
      },
      {
        "id": "data-conv",
        "name": "Digital Storage Units",
        "description": "Bytes, Kilobytes, Megabytes, Gigabytes & Terabytes",
        "icon": "dev",
        "targetScreen": "data-conv"
      },
      {
        "id": "area-conv",
        "name": "Area Converter",
        "description": "Square meters, feet, acres, and hectares",
        "icon": "crop",
        "targetScreen": "area-conv"
      },
      {
        "id": "vol-conv",
        "name": "Volume & Capacity",
        "description": "Liters, milliliters, gallons, fluid ounces & cups",
        "icon": "pip",
        "targetScreen": "vol-conv"
      },
      {
        "id": "time-conv",
        "name": "Time Duration Converter",
        "description": "Milliseconds, seconds, minutes, hours & days",
        "icon": "bolt",
        "targetScreen": "time-conv"
      }
    ]
  },
  "network": {
    "id": "network",
    "name": "Internet & Network",
    "icon": "wifi",
    "gradientClass": "g1",
    "description": "Internet connectivity, DNS resolving, ping and latency tools",
    "tools": [
      {
        "id": "internet-speed-tester",
        "name": "Internet Speed Tester",
        "description": "Measure download and upload throughput with a live network test",
        "icon": "gauge",
        "targetScreen": "internet-speed-tester"
      },
      {
        "id": "ip-lookup",
        "name": "IP Address & Geo",
        "description": "Check public IP address, hostname, and reverse DNS mapping",
        "icon": "search",
        "targetScreen": "ip-lookup"
      },
      {
        "id": "ping-latency",
        "name": "Ping & Latency",
        "description": "Measure connection round-trip response time",
        "icon": "ping",
        "targetScreen": "ping-latency"
      },
      {
        "id": "dns-lookup",
        "name": "DNS Lookup",
        "description": "Resolve domain DNS records via secure DNS-over-HTTPS",
        "icon": "globe",
        "targetScreen": "dns-lookup"
      }
    ]
  },
  "text": {
    "id": "text",
    "name": "Text Tools",
    "icon": "text",
    "gradientClass": "g3",
    "description": "Text manipulation, string formatting, encoders and counters",
    "tools": [
      {
        "id": "case-conv",
        "name": "Text Case Converter",
        "description": "Convert to UPPERCASE, lowercase, Title Case, camelCase",
        "icon": "text",
        "targetScreen": "case-conv"
      },
      {
        "id": "word-count",
        "name": "Word & Character Counter",
        "description": "Count total words, characters, sentences & reading duration",
        "icon": "file",
        "targetScreen": "word-count"
      },
      {
        "id": "lorem-gen",
        "name": "Lorem Ipsum Generator",
        "description": "Produce dummy text paragraphs for UI mockups",
        "icon": "spark",
        "targetScreen": "lorem-gen"
      },
      {
        "id": "url-enc",
        "name": "URL Encoder / Decoder",
        "description": "Encode URI special characters and query strings",
        "icon": "globe",
        "targetScreen": "url-enc"
      },
      {
        "id": "base64-txt",
        "name": "Base64 Text Encoder",
        "description": "Encode text strings into Base64 format and back",
        "icon": "code",
        "targetScreen": "base64-txt"
      },
      {
        "id": "slug-gen",
        "name": "URL Slug Generator",
        "description": "Transform article headlines into URL-safe slugs",
        "icon": "arrow",
        "targetScreen": "slug-gen"
      },
      {
        "id": "line-clean",
        "name": "Duplicate Line Remover",
        "description": "Sort, deduplicate, and clean raw text listings",
        "icon": "trash",
        "targetScreen": "line-clean"
      },
      {
        "id": "diff-text",
        "name": "Text Diff & Comparator",
        "description": "Highlight differences between two text snippets",
        "icon": "sliders",
        "targetScreen": "diff-text"
      }
    ]
  },
  "image": {
    "id": "image",
    "name": "Image Tools",
    "icon": "img",
    "gradientClass": "g3",
    "description": "Client-side image processing, compression, formats and colors",
    "tools": [
      {
        "id": "img-compress",
        "name": "Image Compressor",
        "description": "Reduce file size with adjustable quality slider",
        "icon": "comp",
        "targetScreen": "img-compress"
      },
      {
        "id": "img-resize",
        "name": "Image Resizer",
        "description": "Scale pixel width and height proportionally",
        "icon": "resize",
        "targetScreen": "img-resize"
      },
      {
        "id": "color-picker",
        "name": "Color Picker & Eyedropper",
        "description": "Pick screen colors, copy HEX codes & preset palette",
        "icon": "pip",
        "targetScreen": "color-picker"
      },
      {
        "id": "img-base64",
        "name": "Image to Base64",
        "description": "Encode image files directly into Data URI strings",
        "icon": "img",
        "targetScreen": "img-base64"
      },
      {
        "id": "format-conv",
        "name": "Format Converter",
        "description": "Convert between PNG, JPEG, and WebP formats",
        "icon": "file",
        "targetScreen": "format-conv"
      },
      {
        "id": "crop-tool",
        "name": "Crop Image",
        "description": "Cut and adjust frame aspect ratios with canvas",
        "icon": "crop",
        "targetScreen": "crop-tool"
      },
      {
        "id": "exif-data",
        "name": "EXIF Metadata Inspector",
        "description": "Read camera settings, timestamp & orientation",
        "icon": "info",
        "targetScreen": "exif-data"
      },
      {
        "id": "svg-opt",
        "name": "SVG Optimizer",
        "description": "Clean vector code and minify XML structures",
        "icon": "spark",
        "targetScreen": "svg-opt"
      }
    ]
  },
  "qr": {
    "id": "qr",
    "name": "QR & Barcode",
    "icon": "qr",
    "gradientClass": "g4",
    "description": "Instant QR code generator, laser scanner and barcode decoder",
    "tools": [
      {
        "id": "qr-scan",
        "name": "QR Code Scanner",
        "description": "Scan QR codes using camera viewfinder or file upload",
        "icon": "scan",
        "targetScreen": "qr-scan"
      },
      {
        "id": "qr-gen",
        "name": "QR Code Generator",
        "description": "Create high-resolution downloadable QR code images",
        "icon": "gen",
        "targetScreen": "qr-gen"
      },
      {
        "id": "wifi-qr",
        "name": "Wi-Fi Network QR",
        "description": "Generate scan-to-connect Wi-Fi credential codes",
        "icon": "wifi",
        "targetScreen": "wifi-qr"
      },
      {
        "id": "url-qr",
        "name": "Website Link QR",
        "description": "Convert URLs into easily shareable barcodes",
        "icon": "globe",
        "targetScreen": "url-qr"
      },
      {
        "id": "vcard-qr",
        "name": "vCard Contact Code",
        "description": "Encode address book contact information into QR",
        "icon": "dev",
        "targetScreen": "vcard-qr"
      },
      {
        "id": "barcode-scan",
        "name": "Barcode Reader",
        "description": "Detect standard product barcodes and numbers",
        "icon": "qr",
        "targetScreen": "barcode-scan"
      }
    ]
  },
  "developer": {
    "id": "developer",
    "name": "Developer",
    "icon": "code",
    "gradientClass": "g4",
    "description": "Engineering utilities, JSON tools, crypto hashing and formatting",
    "tools": [
      {
        "id": "json-format",
        "name": "JSON Formatter & Validator",
        "description": "Prettify, minify and validate JSON syntax structures",
        "icon": "code",
        "targetScreen": "json-format"
      },
      {
        "id": "hash-gen",
        "name": "Hash Generator",
        "description": "Calculate MD5, SHA-1, and SHA-256 message digests",
        "icon": "shield",
        "targetScreen": "hash-gen"
      },
      {
        "id": "epoch-conv",
        "name": "Unix Timestamp Converter",
        "description": "Convert Unix epoch seconds to human UTC/local dates",
        "icon": "dev",
        "targetScreen": "epoch-conv"
      }
    ]
  },
  "security": {
    "id": "security",
    "name": "Security",
    "icon": "shield",
    "gradientClass": "g4",
    "description": "Password generators, entropy analyzers and privacy tools",
    "tools": [
      {
        "id": "pwd-gen",
        "name": "Strong Password Generator",
        "description": "Generate high-entropy alphanumeric and symbol passwords",
        "icon": "shield",
        "targetScreen": "pwd-gen"
      },
      {
        "id": "pwd-entropy",
        "name": "Password Strength Analyzer",
        "description": "Analyze entropy bits and estimated crack time",
        "icon": "bolt",
        "targetScreen": "pwd-entropy"
      },
      {
        "id": "sha256-chk",
        "name": "SHA-256 Checksum Calculator",
        "description": "Compute file digest to verify download integrity",
        "icon": "file",
        "targetScreen": "sha256-chk"
      },
      {
        "id": "privacy-chk",
        "name": "Browser Privacy & Permissions",
        "description": "Check active camera, microphone, and geolocation status",
        "icon": "globe",
        "targetScreen": "privacy-chk"
      },
      {
        "id": "secret-tokens",
        "name": "Random Secret Key Generator",
        "description": "Generate secure hex tokens for API keys and salts",
        "icon": "star",
        "targetScreen": "secret-tokens"
      },
      {
        "id": "passphrase-gen",
        "name": "Diceware Passphrase Generator",
        "description": "Generate multi-word memorable security passphrases",
        "icon": "text",
        "targetScreen": "passphrase-gen"
      }
    ]
  },
  "device": {
    "id": "device",
    "name": "Device Info",
    "icon": "dev",
    "gradientClass": "g3",
    "description": "Hardware specifications, battery state, display and platform metrics",
    "tools": [
      {
        "id": "device-overview",
        "name": "Hardware & OS Overview",
        "description": "System platform, user agent and browser engine details",
        "icon": "dev",
        "targetScreen": "device-overview"
      },
      {
        "id": "battery-status",
        "name": "Battery Diagnostics",
        "description": "Current battery level percentage and charging state",
        "icon": "bolt",
        "targetScreen": "battery-status"
      },
      {
        "id": "screen-display",
        "name": "Screen & Viewport Metrics",
        "description": "Screen resolution, device pixel ratio, and orientation",
        "icon": "crop",
        "targetScreen": "screen-display"
      },
      {
        "id": "hardware-concurrency",
        "name": "CPU Cores & Memory",
        "description": "Logical CPU thread count and estimated device RAM",
        "icon": "sliders",
        "targetScreen": "hardware-concurrency"
      },
      {
        "id": "storage-quota",
        "name": "Storage Quota & Persistence",
        "description": "Estimate browser local storage and IndexedDB space",
        "icon": "file",
        "targetScreen": "storage-quota"
      }
    ]
  },
  "datetime": {
    "id": "datetime",
    "name": "Date & Time",
    "icon": "clock",
    "gradientClass": "g2",
    "description": "Clocks, time zones, calendar, stopwatch, timer & productivity counters",
    "tools": [
      {
        "id": "analog-clock",
        "name": "Analog Clock",
        "description": "Live analog clock face with smooth hour, minute & second hands",
        "icon": "clock",
        "targetScreen": "analog-clock"
      },
      {
        "id": "digital-clock",
        "name": "Digital Clock",
        "description": "Live digital time display with 12h/24h toggle, date & weekday",
        "icon": "clock",
        "targetScreen": "digital-clock"
      },
      {
        "id": "tz-conv",
        "name": "Time Zone Converter",
        "description": "Convert times and dates between global time zones with DST",
        "icon": "globe",
        "targetScreen": "tz-conv"
      },
      {
        "id": "calendar",
        "name": "Calendar",
        "description": "Monthly calendar with date navigation, today highlight & weekends",
        "icon": "calendar",
        "targetScreen": "calendar"
      },
      {
        "id": "stopwatch",
        "name": "Stopwatch",
        "description": "Precise stopwatch with start, pause, reset & split lap times",
        "icon": "stopwatch",
        "targetScreen": "stopwatch"
      },
      {
        "id": "timer",
        "name": "Timer",
        "description": "Custom countdown timer with progress ring and finish alerts",
        "icon": "timer",
        "targetScreen": "timer"
      },
      {
        "id": "pomodoro",
        "name": "Pomodoro Timer",
        "description": "Productivity timer with work, short break & long break cycles",
        "icon": "pomodoro",
        "targetScreen": "pomodoro"
      },
      {
        "id": "tally-counter",
        "name": "Tally Counter",
        "description": "Digital clicker with large count, haptic tap and local persistence",
        "icon": "counter",
        "targetScreen": "tally-counter"
      }
    ]
  },
  "measurement": {
    "id": "measurement",
    "name": "Measurement",
    "icon": "ruler",
    "gradientClass": "g3",
    "description": "Ruler, protractor, spirit level, vibratometer, pedometer, speed test, pendulum, sound and light meters",
    "tools": [
      {
        "id": "ruler",
        "name": "Ruler",
        "description": "Screen ruler with mm, cm, and inch scales, adjustable DPI calibration, and drag markers",
        "icon": "ruler",
        "targetScreen": "ruler"
      },
      {
        "id": "protractor",
        "name": "Protractor",
        "description": "Measure angles with interactive degree dial, draggable angle arms, and camera overlay option",
        "icon": "protractor",
        "targetScreen": "protractor"
      },
      {
        "id": "spirit-level",
        "name": "Spirit Level",
        "description": "2D digital bubble level with x/y tilt angles, bullseye center gauge, and zero calibration",
        "icon": "level",
        "targetScreen": "spirit-level"
      },
      {
        "id": "vibratometer",
        "name": "Vibratometer",
        "description": "Vibration and seismic intensity detector with live acceleration waveform graph and severity scale",
        "icon": "activity",
        "targetScreen": "vibratometer"
      },
      {
        "id": "pedometer",
        "name": "Pedometer",
        "description": "Step counter with motion detection, distance, calorie estimator, and persistent logs",
        "icon": "footprints",
        "targetScreen": "pedometer"
      },
      {
        "id": "pendulum",
        "name": "Pendulum",
        "description": "Interactive physics pendulum simulation with adjustable length, gravity, damping, and motion sync",
        "icon": "pendulum",
        "targetScreen": "pendulum"
      },
      {
        "id": "sound-meter",
        "name": "Sound Meter",
        "description": "Decibel (dB) sound level meter using microphone input with live gauge, peak dB, and noise scale",
        "icon": "mic",
        "targetScreen": "sound-meter"
      },
      {
        "id": "light-meter",
        "name": "Light Meter",
        "description": "Ambient illuminance (Lux) and photography Exposure Value (EV) meter with light condition guide",
        "icon": "sun",
        "targetScreen": "light-meter"
      },
      {
        "id": "metal-detector",
        "name": "Metal Detector",
        "description": "Magnetic field and metal sensor with microtesla (µT) gauge, proximity alerts, and vibration feedback",
        "icon": "magnet",
        "targetScreen": "metal-detector"
      }
    ]
  },
  "lab": {
    "id": "lab",
    "name": "Lab",
    "icon": "flask",
    "gradientClass": "g4",
    "description": "Interactive HTML editor, C compiler, and Python 3 programming environment",
    "tools": [
      {
        "id": "html-play",
        "name": "HTML",
        "description": "Interactive HTML editor with live preview canvas, sample code, and sandboxed execution",
        "icon": "code",
        "targetScreen": "html-play"
      },
      {
        "id": "c-play",
        "name": "C",
        "description": "C programming playground with WebAssembly GCC compiler engine, syntax highlighting, and execution console",
        "icon": "terminal",
        "targetScreen": "c-play"
      },
      {
        "id": "python-play",
        "name": "Python",
        "description": "Python 3 environment powered by WebAssembly Pyodide runtime with interactive console & output",
        "icon": "terminal",
        "targetScreen": "python-play"
      }
    ]
  }
};

export interface CategorySummary { id: string; name: string; icon: string; gradientClass: string; }
export const CATEGORIES_LIST: CategorySummary[] = [
  {
    "id": "lab",
    "name": "Lab",
    "icon": "flask",
    "gradientClass": "g4"
  },
  {
    "id": "measurement",
    "name": "Measurement",
    "icon": "ruler",
    "gradientClass": "g3"
  },
  {
    "id": "datetime",
    "name": "Date & Time",
    "icon": "clock",
    "gradientClass": "g2"
  },
  {
    "id": "network",
    "name": "Internet & Network",
    "icon": "wifi",
    "gradientClass": "g1"
  },
  {
    "id": "converter",
    "name": "Converter",
    "icon": "conv",
    "gradientClass": "g2"
  },
  {
    "id": "calculator",
    "name": "Calculator",
    "icon": "calc",
    "gradientClass": "g4"
  },
  {
    "id": "finance",
    "name": "Finance & Money",
    "icon": "finance",
    "gradientClass": "g2"
  },
  {
    "id": "text",
    "name": "Text Tools",
    "icon": "text",
    "gradientClass": "g3"
  },
  {
    "id": "image",
    "name": "Image Tools",
    "icon": "img",
    "gradientClass": "g3"
  },
  {
    "id": "qr",
    "name": "QR & Barcode",
    "icon": "qr",
    "gradientClass": "g4"
  },
  {
    "id": "developer",
    "name": "Developer",
    "icon": "code",
    "gradientClass": "g4"
  },
  {
    "id": "security",
    "name": "Security",
    "icon": "shield",
    "gradientClass": "g4"
  },
  {
    "id": "device",
    "name": "Device Info",
    "icon": "dev",
    "gradientClass": "g3"
  }
];

export const ALL_TOOLS: { tool: ToolItem; categoryName: string; categoryId: string }[] = [];
export const TOOL_MAP: Record<string, ToolItem> = {};

Object.keys(CATEGORIES_DATA).forEach((k) => {
  const cat = CATEGORIES_DATA[k];
  if (cat && cat.tools) {
    cat.tools.forEach((tool) => {
      tool.categoryId = k;
      tool.categoryName = cat.name;
      tool.targetScreen = tool.id;
      ALL_TOOLS.push({ tool, categoryName: cat.name, categoryId: cat.id });
      TOOL_MAP[tool.id] = tool;
    });
  }
  if (cat && cat.subcategories) {
    cat.subcategories.forEach((sub) => {
      if (sub.tools) {
        sub.tools.forEach((tool) => {
          tool.categoryId = sub.id;
          tool.categoryName = sub.name;
          tool.targetScreen = tool.id;
          ALL_TOOLS.push({ tool, categoryName: sub.name, categoryId: sub.id });
          TOOL_MAP[tool.id] = tool;
        });
      }
    });
  }
});
