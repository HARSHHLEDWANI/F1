"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Zap,
  Search,
  ChevronRight,
  Radio,
  Flag,
  Timer,
  RotateCcw,
} from "lucide-react";
import CircuitMinimap from "@/components/3d/CircuitMinimap";
import { apiFetch } from "@/lib/api";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface CircuitData {
  id: string;
  name: string;
  locality: string;
  country: string;
  countryCode: string;
  flag: string;
  lapRecord: string;
  lapRecordHolder: string;
  lapRecordYear: number;
  laps: number;
  distance: number; // km
  drsZones: number;
  difficulty: number; // 0-100
  trackType: "STREET" | "PERMANENT" | "MIXED";
  svgPath: string;
  drsZonesFractions: [number, number][];
  round: number;
}

// ─────────────────────────────────────────────────────────────
// Hardcoded circuit data (real F1 2025 season data)
// ─────────────────────────────────────────────────────────────

const CIRCUITS_DATA: CircuitData[] = [
  {
    id: "bahrain",
    name: "Bahrain International Circuit",
    locality: "Sakhir",
    country: "Bahrain",
    countryCode: "BH",
    flag: "🇧🇭",
    lapRecord: "1:31.447",
    lapRecordHolder: "Pedro de la Rosa",
    lapRecordYear: 2005,
    laps: 57,
    distance: 5.412,
    drsZones: 3,
    difficulty: 62,
    trackType: "PERMANENT",
    round: 1,
    drsZonesFractions: [[0.08, 0.18], [0.52, 0.62], [0.78, 0.88]],
    svgPath:
      "M 160 40 L 220 40 Q 260 40 260 80 L 260 100 Q 260 120 240 120 L 200 120 Q 180 120 180 140 L 180 160 Q 180 180 200 180 L 240 180 Q 260 180 260 200 L 260 220 Q 260 240 240 240 L 180 240 Q 160 240 150 220 L 130 180 Q 110 150 100 140 L 80 120 Q 60 100 80 80 L 100 60 Q 120 40 160 40 Z",
  },
  {
    id: "jeddah",
    name: "Jeddah Corniche Circuit",
    locality: "Jeddah",
    country: "Saudi Arabia",
    countryCode: "SA",
    flag: "🇸🇦",
    lapRecord: "1:30.734",
    lapRecordHolder: "Lewis Hamilton",
    lapRecordYear: 2021,
    laps: 50,
    distance: 6.174,
    drsZones: 3,
    difficulty: 78,
    trackType: "STREET",
    round: 2,
    drsZonesFractions: [[0.05, 0.2], [0.45, 0.58], [0.75, 0.88]],
    svgPath:
      "M 50 200 L 50 60 Q 50 40 70 40 L 80 40 Q 95 40 95 55 L 95 70 Q 95 85 110 85 L 200 85 Q 215 85 215 100 L 215 115 Q 215 130 200 130 L 160 130 Q 145 130 145 145 L 145 160 Q 145 175 160 175 L 230 175 Q 250 175 250 195 L 250 210 Q 250 230 230 230 L 70 230 Q 50 230 50 210 Z",
  },
  {
    id: "australia",
    name: "Albert Park Circuit",
    locality: "Melbourne",
    country: "Australia",
    countryCode: "AU",
    flag: "🇦🇺",
    lapRecord: "1:19.813",
    lapRecordHolder: "Charles Leclerc",
    lapRecordYear: 2022,
    laps: 58,
    distance: 5.278,
    drsZones: 4,
    difficulty: 55,
    trackType: "MIXED",
    round: 3,
    drsZonesFractions: [[0.1, 0.22], [0.35, 0.45], [0.6, 0.7], [0.82, 0.92]],
    svgPath:
      "M 80 130 Q 60 100 80 70 L 110 50 Q 140 35 170 50 L 220 70 Q 250 85 255 115 L 255 145 Q 250 175 225 185 L 190 195 Q 165 200 155 190 L 140 175 Q 130 160 115 165 L 100 175 Q 80 185 75 170 Z",
  },
  {
    id: "japan",
    name: "Suzuka International Racing Course",
    locality: "Suzuka",
    country: "Japan",
    countryCode: "JP",
    flag: "🇯🇵",
    lapRecord: "1:30.983",
    lapRecordHolder: "Lewis Hamilton",
    lapRecordYear: 2019,
    laps: 53,
    distance: 5.807,
    drsZones: 2,
    difficulty: 85,
    trackType: "PERMANENT",
    round: 4,
    drsZonesFractions: [[0.08, 0.18], [0.62, 0.74]],
    svgPath:
      "M 150 30 L 220 30 Q 250 30 255 60 L 255 90 Q 255 115 235 120 L 210 125 Q 190 128 185 145 L 185 165 Q 188 185 205 190 L 230 193 Q 255 196 255 220 L 255 235 Q 250 255 225 255 L 170 255 Q 145 255 140 235 L 135 215 Q 130 195 115 190 L 95 188 Q 70 188 65 165 L 65 140 Q 68 118 90 112 L 115 108 Q 135 106 138 88 L 140 65 Q 140 45 150 30 Z",
  },
  {
    id: "china",
    name: "Shanghai International Circuit",
    locality: "Shanghai",
    country: "China",
    countryCode: "CN",
    flag: "🇨🇳",
    lapRecord: "1:32.238",
    lapRecordHolder: "Michael Schumacher",
    lapRecordYear: 2004,
    laps: 56,
    distance: 5.451,
    drsZones: 2,
    difficulty: 60,
    trackType: "PERMANENT",
    round: 5,
    drsZonesFractions: [[0.06, 0.18], [0.55, 0.68]],
    svgPath:
      "M 155 45 Q 200 30 235 55 L 255 80 Q 265 105 250 130 L 225 150 Q 205 162 185 155 L 165 147 Q 148 140 140 155 L 138 175 Q 138 200 160 210 L 200 220 Q 225 228 230 250 Q 225 265 205 268 L 105 268 Q 80 265 75 245 L 75 90 Q 80 55 115 45 Z",
  },
  {
    id: "miami",
    name: "Miami International Autodrome",
    locality: "Miami",
    country: "USA",
    countryCode: "US",
    flag: "🇺🇸",
    lapRecord: "1:29.708",
    lapRecordHolder: "Max Verstappen",
    lapRecordYear: 2023,
    laps: 57,
    distance: 5.412,
    drsZones: 3,
    difficulty: 58,
    trackType: "STREET",
    round: 6,
    drsZonesFractions: [[0.05, 0.16], [0.42, 0.54], [0.72, 0.84]],
    svgPath:
      "M 60 160 L 60 90 Q 65 65 90 60 L 200 55 Q 230 55 240 75 L 245 95 Q 248 115 230 120 L 200 125 Q 182 128 180 145 L 180 160 Q 183 178 200 182 L 235 185 Q 255 188 255 210 L 255 225 Q 250 245 228 248 L 82 248 Q 60 243 60 220 Z",
  },
  {
    id: "imola",
    name: "Autodromo Enzo e Dino Ferrari",
    locality: "Imola",
    country: "Italy",
    countryCode: "IT",
    flag: "🇮🇹",
    lapRecord: "1:15.484",
    lapRecordHolder: "Rubens Barrichello",
    lapRecordYear: 2004,
    laps: 63,
    distance: 4.909,
    drsZones: 2,
    difficulty: 72,
    trackType: "PERMANENT",
    round: 7,
    drsZonesFractions: [[0.1, 0.22], [0.6, 0.74]],
    svgPath:
      "M 80 200 Q 60 175 70 150 L 90 120 Q 105 100 130 100 L 160 102 Q 178 104 185 88 L 190 70 Q 195 52 215 48 L 235 50 Q 255 56 258 78 L 255 105 Q 250 125 232 130 L 210 133 Q 192 135 188 152 L 188 172 Q 190 192 210 198 L 240 202 Q 258 208 258 228 Q 252 248 230 250 L 100 250 Q 78 246 75 226 Z",
  },
  {
    id: "monaco",
    name: "Circuit de Monaco",
    locality: "Monte Carlo",
    country: "Monaco",
    countryCode: "MC",
    flag: "🇲🇨",
    lapRecord: "1:12.909",
    lapRecordHolder: "Lewis Hamilton",
    lapRecordYear: 2021,
    laps: 78,
    distance: 3.337,
    drsZones: 1,
    difficulty: 95,
    trackType: "STREET",
    round: 8,
    drsZonesFractions: [[0.55, 0.7]],
    svgPath:
      "M 70 180 L 70 140 Q 68 118 85 108 L 110 98 Q 128 94 132 78 L 136 58 Q 140 42 160 38 L 195 38 Q 218 40 222 62 L 220 88 Q 218 108 200 114 L 178 118 Q 162 122 160 138 L 162 155 Q 168 170 185 172 L 220 175 Q 242 178 245 198 L 240 220 Q 232 238 210 240 L 92 240 Q 70 236 70 215 Z",
  },
  {
    id: "canada",
    name: "Circuit Gilles Villeneuve",
    locality: "Montreal",
    country: "Canada",
    countryCode: "CA",
    flag: "🇨🇦",
    lapRecord: "1:13.078",
    lapRecordHolder: "Valtteri Bottas",
    lapRecordYear: 2019,
    laps: 70,
    distance: 4.361,
    drsZones: 2,
    difficulty: 65,
    trackType: "MIXED",
    round: 9,
    drsZonesFractions: [[0.08, 0.22], [0.58, 0.72]],
    svgPath:
      "M 90 50 L 230 50 Q 252 52 255 72 L 255 90 Q 252 108 232 110 L 180 112 L 180 130 L 232 132 Q 252 134 255 154 L 255 172 Q 252 190 232 192 L 90 192 Q 68 190 65 170 L 65 90 Q 68 50 90 50 Z",
  },
  {
    id: "spain",
    name: "Circuit de Barcelona-Catalunya",
    locality: "Barcelona",
    country: "Spain",
    countryCode: "ES",
    flag: "🇪🇸",
    lapRecord: "1:16.330",
    lapRecordHolder: "Max Verstappen",
    lapRecordYear: 2023,
    laps: 66,
    distance: 4.657,
    drsZones: 2,
    difficulty: 58,
    trackType: "PERMANENT",
    round: 10,
    drsZonesFractions: [[0.06, 0.18], [0.52, 0.65]],
    svgPath:
      "M 60 150 L 60 85 Q 65 62 88 58 L 165 55 Q 188 56 195 72 L 198 90 Q 196 108 180 112 L 158 115 Q 142 118 140 132 L 142 148 Q 148 162 165 165 L 195 168 Q 215 170 220 188 L 220 205 Q 215 225 192 228 L 82 228 Q 60 224 60 200 Z",
  },
  {
    id: "austria",
    name: "Red Bull Ring",
    locality: "Spielberg",
    country: "Austria",
    countryCode: "AT",
    flag: "🇦🇹",
    lapRecord: "1:05.619",
    lapRecordHolder: "Carlos Sainz",
    lapRecordYear: 2020,
    laps: 71,
    distance: 4.318,
    drsZones: 3,
    difficulty: 52,
    trackType: "PERMANENT",
    round: 11,
    drsZonesFractions: [[0.05, 0.2], [0.38, 0.52], [0.72, 0.86]],
    svgPath:
      "M 100 200 L 80 140 Q 72 110 90 90 L 120 68 Q 148 52 175 68 L 200 88 Q 215 108 210 132 L 200 160 L 230 175 Q 248 190 240 210 L 220 228 Q 198 240 172 232 L 145 215 Q 125 205 100 215 Z",
  },
  {
    id: "britain",
    name: "Silverstone Circuit",
    locality: "Silverstone",
    country: "Great Britain",
    countryCode: "GB",
    flag: "🇬🇧",
    lapRecord: "1:27.097",
    lapRecordHolder: "Max Verstappen",
    lapRecordYear: 2020,
    laps: 52,
    distance: 5.891,
    drsZones: 2,
    difficulty: 70,
    trackType: "PERMANENT",
    round: 12,
    drsZonesFractions: [[0.06, 0.18], [0.54, 0.68]],
    svgPath:
      "M 65 145 Q 58 110 78 85 L 108 62 Q 138 48 168 58 L 200 72 Q 225 88 238 115 L 245 145 Q 245 175 228 192 L 202 208 Q 175 220 148 215 L 120 205 Q 98 195 85 178 Z",
  },
  {
    id: "hungary",
    name: "Hungaroring",
    locality: "Budapest",
    country: "Hungary",
    countryCode: "HU",
    flag: "🇭🇺",
    lapRecord: "1:16.627",
    lapRecordHolder: "Lewis Hamilton",
    lapRecordYear: 2020,
    laps: 70,
    distance: 4.381,
    drsZones: 2,
    difficulty: 68,
    trackType: "PERMANENT",
    round: 13,
    drsZonesFractions: [[0.08, 0.2], [0.55, 0.68]],
    svgPath:
      "M 70 165 Q 58 140 65 115 L 85 88 Q 108 68 135 70 L 158 75 Q 175 80 180 98 L 182 118 Q 180 138 162 145 L 142 150 Q 125 155 122 172 L 125 192 Q 132 212 152 218 L 188 222 Q 212 225 218 248 Q 205 260 180 260 L 88 255 Q 65 248 62 225 Z",
  },
  {
    id: "belgium",
    name: "Circuit de Spa-Francorchamps",
    locality: "Stavelot",
    country: "Belgium",
    countryCode: "BE",
    flag: "🇧🇪",
    lapRecord: "1:46.286",
    lapRecordHolder: "Valtteri Bottas",
    lapRecordYear: 2018,
    laps: 44,
    distance: 7.004,
    drsZones: 2,
    difficulty: 82,
    trackType: "PERMANENT",
    round: 14,
    drsZonesFractions: [[0.06, 0.2], [0.62, 0.78]],
    svgPath:
      "M 55 175 L 55 100 Q 58 72 80 62 L 115 55 Q 142 52 155 68 L 162 88 Q 165 108 150 120 L 135 130 Q 120 140 125 158 L 138 175 Q 155 190 180 188 L 218 182 Q 248 178 255 200 L 252 225 Q 245 248 218 250 L 78 250 Q 55 244 55 220 Z",
  },
  {
    id: "netherlands",
    name: "Circuit Zandvoort",
    locality: "Zandvoort",
    country: "Netherlands",
    countryCode: "NL",
    flag: "🇳🇱",
    lapRecord: "1:11.097",
    lapRecordHolder: "Lewis Hamilton",
    lapRecordYear: 2021,
    laps: 72,
    distance: 4.259,
    drsZones: 2,
    difficulty: 72,
    trackType: "PERMANENT",
    round: 15,
    drsZonesFractions: [[0.08, 0.22], [0.56, 0.7]],
    svgPath:
      "M 90 55 L 210 55 Q 240 56 248 80 L 248 100 Q 244 122 222 125 L 200 127 Q 182 130 180 148 L 180 168 Q 182 188 200 192 L 222 195 Q 244 198 248 222 L 245 242 Q 238 258 215 260 L 85 260 Q 62 256 58 232 L 58 80 Q 64 55 90 55 Z",
  },
  {
    id: "italy",
    name: "Autodromo Nazionale Monza",
    locality: "Monza",
    country: "Italy",
    countryCode: "IT",
    flag: "🇮🇹",
    lapRecord: "1:21.046",
    lapRecordHolder: "Rubens Barrichello",
    lapRecordYear: 2004,
    laps: 53,
    distance: 5.793,
    drsZones: 2,
    difficulty: 45,
    trackType: "PERMANENT",
    round: 16,
    drsZonesFractions: [[0.05, 0.22], [0.58, 0.75]],
    svgPath:
      "M 75 145 L 75 90 Q 80 65 105 60 L 175 58 Q 200 60 205 82 L 202 105 Q 198 125 178 128 L 155 130 L 155 145 L 178 148 Q 198 152 202 172 L 205 195 Q 200 218 175 220 L 105 218 Q 80 215 75 192 Z",
  },
  {
    id: "azerbaijan",
    name: "Baku City Circuit",
    locality: "Baku",
    country: "Azerbaijan",
    countryCode: "AZ",
    flag: "🇦🇿",
    lapRecord: "1:43.009",
    lapRecordHolder: "Charles Leclerc",
    lapRecordYear: 2019,
    laps: 51,
    distance: 6.003,
    drsZones: 2,
    difficulty: 76,
    trackType: "STREET",
    round: 17,
    drsZonesFractions: [[0.04, 0.28], [0.6, 0.8]],
    svgPath:
      "M 55 200 L 55 55 Q 60 38 80 35 L 220 35 Q 245 38 248 60 L 245 78 Q 240 95 220 98 L 168 100 Q 148 102 145 118 L 145 135 Q 148 152 168 155 L 220 158 Q 245 162 248 185 L 245 205 Q 240 225 218 228 L 78 228 Q 55 222 55 200 Z",
  },
  {
    id: "singapore",
    name: "Marina Bay Street Circuit",
    locality: "Singapore",
    country: "Singapore",
    countryCode: "SG",
    flag: "🇸🇬",
    lapRecord: "1:35.867",
    lapRecordHolder: "Kevin Magnussen",
    lapRecordYear: 2018,
    laps: 61,
    distance: 5.063,
    drsZones: 3,
    difficulty: 88,
    trackType: "STREET",
    round: 18,
    drsZonesFractions: [[0.05, 0.15], [0.38, 0.5], [0.72, 0.84]],
    svgPath:
      "M 75 230 L 75 80 Q 78 58 98 52 L 115 50 Q 132 52 135 68 L 135 85 Q 133 100 118 104 L 105 108 Q 92 112 92 128 L 95 145 Q 102 158 118 160 L 148 162 Q 165 162 168 148 L 168 132 Q 166 115 150 110 L 138 107 Q 125 102 128 86 L 135 68 M 168 148 L 172 165 Q 178 185 198 188 L 230 190 Q 252 192 255 215 L 252 232 Q 245 250 222 252 L 95 252 Q 72 248 72 228 Z",
  },
  {
    id: "usa",
    name: "Circuit of the Americas",
    locality: "Austin",
    country: "USA",
    countryCode: "US",
    flag: "🇺🇸",
    lapRecord: "1:36.169",
    lapRecordHolder: "Charles Leclerc",
    lapRecordYear: 2019,
    laps: 56,
    distance: 5.513,
    drsZones: 2,
    difficulty: 74,
    trackType: "PERMANENT",
    round: 19,
    drsZonesFractions: [[0.06, 0.18], [0.55, 0.68]],
    svgPath:
      "M 80 220 L 60 140 Q 55 105 75 78 L 105 55 Q 138 38 165 52 L 185 68 Q 200 85 195 108 L 185 130 Q 175 150 158 155 L 140 158 Q 125 160 122 175 L 125 195 Q 132 215 152 220 L 195 225 Q 225 228 232 252 Q 218 265 195 265 L 98 262 Q 75 255 75 235 Z",
  },
  {
    id: "mexico",
    name: "Autodromo Hermanos Rodriguez",
    locality: "Mexico City",
    country: "Mexico",
    countryCode: "MX",
    flag: "🇲🇽",
    lapRecord: "1:17.774",
    lapRecordHolder: "Valtteri Bottas",
    lapRecordYear: 2021,
    laps: 71,
    distance: 4.304,
    drsZones: 3,
    difficulty: 60,
    trackType: "PERMANENT",
    round: 20,
    drsZonesFractions: [[0.06, 0.18], [0.42, 0.55], [0.75, 0.88]],
    svgPath:
      "M 65 150 Q 55 120 68 95 L 92 70 Q 118 52 148 56 L 175 62 Q 198 70 205 95 L 208 118 Q 208 140 192 150 L 175 158 Q 158 162 155 178 L 158 198 Q 165 218 188 222 L 220 225 Q 242 228 245 250 Q 232 262 208 262 L 88 260 Q 65 252 62 228 Z",
  },
  {
    id: "brazil",
    name: "Autodromo Jose Carlos Pace",
    locality: "São Paulo",
    country: "Brazil",
    countryCode: "BR",
    flag: "🇧🇷",
    lapRecord: "1:10.540",
    lapRecordHolder: "Valtteri Bottas",
    lapRecordYear: 2018,
    laps: 71,
    distance: 4.309,
    drsZones: 2,
    difficulty: 68,
    trackType: "PERMANENT",
    round: 21,
    drsZonesFractions: [[0.08, 0.22], [0.58, 0.72]],
    svgPath:
      "M 90 60 L 205 60 Q 228 62 232 82 L 230 105 Q 225 125 205 128 L 168 130 Q 148 132 145 148 L 148 168 Q 155 185 175 188 L 218 192 Q 238 196 240 218 L 235 238 Q 225 255 200 258 L 88 255 Q 65 248 62 225 L 65 85 Q 68 58 90 60 Z",
  },
  {
    id: "las-vegas",
    name: "Las Vegas Street Circuit",
    locality: "Las Vegas",
    country: "USA",
    countryCode: "US",
    flag: "🇺🇸",
    lapRecord: "1:35.490",
    lapRecordHolder: "Oscar Piastri",
    lapRecordYear: 2024,
    laps: 50,
    distance: 6.201,
    drsZones: 2,
    difficulty: 55,
    trackType: "STREET",
    round: 22,
    drsZonesFractions: [[0.05, 0.25], [0.58, 0.78]],
    svgPath:
      "M 55 215 L 55 55 Q 58 38 78 35 L 225 35 Q 248 38 250 58 L 250 78 Q 247 95 228 98 L 78 102 L 78 120 L 228 124 Q 248 128 250 148 L 250 168 Q 247 188 228 190 L 78 194 L 78 212 L 228 215 Q 248 218 250 238 L 248 252 Q 240 265 218 268 L 75 268 Q 52 260 52 238 Z",
  },
  {
    id: "qatar",
    name: "Lusail International Circuit",
    locality: "Lusail",
    country: "Qatar",
    countryCode: "QA",
    flag: "🇶🇦",
    lapRecord: "1:24.319",
    lapRecordHolder: "Max Verstappen",
    lapRecordYear: 2023,
    laps: 57,
    distance: 5.419,
    drsZones: 2,
    difficulty: 65,
    trackType: "PERMANENT",
    round: 23,
    drsZonesFractions: [[0.06, 0.2], [0.55, 0.7]],
    svgPath:
      "M 80 145 Q 65 112 78 82 L 102 58 Q 132 40 162 50 L 190 65 Q 212 82 218 110 L 222 138 Q 222 165 205 182 L 182 198 Q 158 208 132 200 L 108 188 Q 88 172 80 145 Z",
  },
  {
    id: "abu-dhabi",
    name: "Yas Marina Circuit",
    locality: "Abu Dhabi",
    country: "Abu Dhabi",
    countryCode: "AE",
    flag: "🇦🇪",
    lapRecord: "1:26.103",
    lapRecordHolder: "Max Verstappen",
    lapRecordYear: 2021,
    laps: 58,
    distance: 5.281,
    drsZones: 2,
    difficulty: 52,
    trackType: "PERMANENT",
    round: 24,
    drsZonesFractions: [[0.06, 0.2], [0.6, 0.74]],
    svgPath:
      "M 75 145 L 75 90 Q 80 65 105 58 L 175 55 Q 200 58 208 78 L 210 100 Q 208 122 188 128 L 162 132 Q 145 135 142 152 L 145 172 Q 152 190 172 195 L 205 198 Q 228 202 235 222 L 232 242 Q 225 258 202 260 L 102 258 Q 78 252 75 228 Z",
  },
];

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const TRACK_TYPE_STYLES: Record<string, { bg: string; border: string; text: string; label: string }> = {
  STREET: { bg: "bg-amber-500/15", border: "border-amber-500/40", text: "text-amber-400", label: "STREET" },
  PERMANENT: { bg: "bg-cyan-500/15", border: "border-cyan-500/40", text: "text-cyan-400", label: "PERMANENT" },
  MIXED: { bg: "bg-violet-500/15", border: "border-violet-500/40", text: "text-violet-400", label: "MIXED" },
};

const SEASONS = [2020, 2021, 2022, 2023, 2024, 2025, 2026];

const COUNTRIES = Array.from(new Set(CIRCUITS_DATA.map((c) => c.country))).sort();

// ─────────────────────────────────────────────────────────────
// Track card
// ─────────────────────────────────────────────────────────────

interface TrackCardProps {
  circuit: CircuitData;
  index: number;
  onClick: () => void;
}

function TrackCard({ circuit, index, onClick }: TrackCardProps) {
  const typeStyle = TRACK_TYPE_STYLES[circuit.trackType] ?? TRACK_TYPE_STYLES.PERMANENT;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 32, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.95 }}
      transition={{ delay: index * 0.04, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      onClick={onClick}
      className="group relative rounded-2xl border border-white/[0.07] bg-white/3 backdrop-blur-sm overflow-hidden cursor-pointer flex flex-col"
      style={{
        background:
          "linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      {/* Red accent top stripe */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{ boxShadow: "inset 0 0 60px rgba(225,6,0,0.06)" }}
      />

      {/* SVG Minimap area */}
      <div className="relative w-full bg-[#0a0a10] overflow-hidden flex items-center justify-center py-2"
           style={{ minHeight: 160 }}>
        {/* Round number badge */}
        <div className="absolute top-3 left-3 font-mono text-[10px] font-bold text-white/30 tracking-widest uppercase">
          RD {String(circuit.round).padStart(2, "0")}
        </div>

        {/* Track type badge */}
        <span
          className={`absolute top-3 right-3 text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded border ${typeStyle.bg} ${typeStyle.border} ${typeStyle.text}`}
        >
          {typeStyle.label}
        </span>

        <CircuitMinimap
          path={circuit.svgPath}
          drsZones={circuit.drsZonesFractions}
          color="#e10600"
          width={280}
          height={150}
        />
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Country + DRS */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg leading-none">{circuit.flag}</span>
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
              {circuit.country}
            </span>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded border border-red-600/30 bg-red-600/10">
            <Zap size={9} className="text-red-500" />
            <span className="text-[9px] font-black text-red-400 tracking-wider">{circuit.drsZones} DRS</span>
          </div>
        </div>

        {/* Track name */}
        <h3 className="text-base font-black uppercase tracking-tight leading-tight mb-0.5 text-white group-hover:text-red-400 transition-colors duration-200 line-clamp-2">
          {circuit.name}
        </h3>
        <p className="text-[11px] text-neutral-500 mb-4">{circuit.locality}</p>

        {/* Lap record */}
        <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-white/4 border border-white/6">
          <Timer size={11} className="text-red-500 shrink-0" />
          <div className="min-w-0">
            <p className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold">Lap Record</p>
            <p className="font-mono text-xs font-bold text-white truncate">
              {circuit.lapRecord}{" "}
              <span className="text-neutral-400 font-normal">{circuit.lapRecordHolder}</span>
            </p>
          </div>
          <span className="ml-auto text-[9px] text-neutral-600 font-bold shrink-0">{circuit.lapRecordYear}</span>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-white/4 border border-white/5 rounded-lg p-2 text-center">
            <p className="text-[9px] text-neutral-500 uppercase tracking-wider font-bold mb-0.5">Laps</p>
            <p className="font-mono text-xs font-black text-white">{circuit.laps}</p>
          </div>
          <div className="bg-white/4 border border-white/5 rounded-lg p-2 text-center">
            <p className="text-[9px] text-neutral-500 uppercase tracking-wider font-bold mb-0.5">Length</p>
            <p className="font-mono text-xs font-black text-white">{circuit.distance.toFixed(3)}</p>
            <p className="text-[8px] text-neutral-600">km</p>
          </div>
          <div className="bg-white/4 border border-white/5 rounded-lg p-2 text-center">
            <p className="text-[9px] text-neutral-500 uppercase tracking-wider font-bold mb-0.5">Total</p>
            <p className="font-mono text-xs font-black text-white">
              {(circuit.distance * circuit.laps).toFixed(1)}
            </p>
            <p className="text-[8px] text-neutral-600">km</p>
          </div>
        </div>

        {/* Difficulty bar */}
        <div className="mb-4">
          <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-1.5">
            <span>Track Difficulty</span>
            <span className={circuit.difficulty >= 80 ? "text-red-400" : circuit.difficulty >= 60 ? "text-amber-400" : "text-cyan-400"}>
              {circuit.difficulty}/100
            </span>
          </div>
          <div className="h-1 w-full bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${circuit.difficulty}%` }}
              transition={{ delay: index * 0.04 + 0.3, duration: 0.6, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{
                background:
                  circuit.difficulty >= 80
                    ? "linear-gradient(90deg, #e10600, #ff4444)"
                    : circuit.difficulty >= 60
                    ? "linear-gradient(90deg, #e10600, #f59e0b)"
                    : "linear-gradient(90deg, #06b6d4, #0ea5e9)",
                boxShadow:
                  circuit.difficulty >= 80
                    ? "0 0 8px rgba(225,6,0,0.6)"
                    : "0 0 8px rgba(6,182,212,0.4)",
              }}
            />
          </div>
        </div>

        {/* CTA button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="mt-auto w-full py-2.5 rounded-lg border border-white/10 bg-white/5 text-white text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 group-hover:bg-red-600 group-hover:border-red-600 group-hover:text-white transition-all duration-200"
        >
          VIEW DETAILS
          <ChevronRight size={12} />
        </button>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────

export default function TracksPage() {
  const router = useRouter();

  // Filter state
  const [search, setSearch] = useState("");
  const [selectedSeason, setSelectedSeason] = useState<number>(2025);
  const [selectedCountry, setSelectedCountry] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  // API enrichment (non-blocking fallback)
  const [apiEnrichment, setApiEnrichment] = useState<Record<string, Partial<CircuitData>>>({});
  const [apiLoading, setApiLoading] = useState(false);

  useEffect(() => {
    const enrich = async () => {
      setApiLoading(true);
      try {
        const data = await apiFetch("/tracks");
        if (Array.isArray(data) && data.length > 0) {
          const map: Record<string, Partial<CircuitData>> = {};
          data.forEach((t: Record<string, unknown>) => {
            const name = typeof t.name === "string" ? t.name : "";
            if (name) {
              map[name.toLowerCase()] = {
                laps: typeof t.laps === "number" ? t.laps : undefined,
                distance: typeof t.lap_distance === "number" ? t.lap_distance : undefined,
                drsZones: typeof t.drs_zones === "number" ? t.drs_zones : undefined,
                difficulty: typeof t.difficulty === "number" ? t.difficulty : undefined,
                lapRecord: typeof t.lap_record_time === "string" ? t.lap_record_time : undefined,
                lapRecordHolder: typeof t.lap_record_holder === "string" ? t.lap_record_holder : undefined,
              };
            }
          });
          setApiEnrichment(map);
        }
      } catch {
        // silently ignore — we use hardcoded data as primary source
      } finally {
        setApiLoading(false);
      }
    };
    enrich();
  }, []);

  // Merge API enrichment into hardcoded data
  const circuits = useMemo<CircuitData[]>(() => {
    return CIRCUITS_DATA.map((c) => {
      const key = c.name.toLowerCase();
      const enriched = apiEnrichment[key] ?? {};
      return { ...c, ...Object.fromEntries(Object.entries(enriched).filter(([, v]) => v !== undefined)) } as CircuitData;
    });
  }, [apiEnrichment]);

  // Filtered circuits
  const filtered = useMemo(() => {
    return circuits.filter((c) => {
      if (
        search &&
        !c.name.toLowerCase().includes(search.toLowerCase()) &&
        !c.country.toLowerCase().includes(search.toLowerCase()) &&
        !c.locality.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      if (selectedCountry !== "ALL" && c.country !== selectedCountry) return false;
      if (selectedType !== "ALL" && c.trackType !== selectedType) return false;
      return true;
    });
  }, [circuits, search, selectedCountry, selectedType]);

  const resetFilters = () => {
    setSearch("");
    setSelectedCountry("ALL");
    setSelectedType("ALL");
  };

  const hasActiveFilters = search || selectedCountry !== "ALL" || selectedType !== "ALL";

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(225,6,0,0.08) 0%, transparent 70%), #050508",
      }}
    >
      {/* Carbon fiber texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.3) 2px, rgba(255,255,255,0.3) 3px), repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.3) 2px, rgba(255,255,255,0.3) 3px)",
          backgroundSize: "4px 4px",
        }}
      />

      <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">
        {/* ── PAGE HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          {/* Season chip */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-600/30 bg-red-600/10 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-black text-red-400 tracking-[0.2em] uppercase">
              {selectedSeason} Formula 1 World Championship
            </span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter leading-none mb-3">
                <span className="text-white">CIRCUITS</span>
                <span
                  className="ml-4 text-red-600"
                  style={{ textShadow: "0 0 40px rgba(225,6,0,0.4)" }}
                >
                  {filtered.length}
                </span>
              </h1>
              <p className="text-neutral-400 text-base max-w-lg">
                {filtered.length} of {circuits.length} circuits across{" "}
                {new Set(circuits.map((c) => c.country)).size} countries. From Monaco's tight streets to
                Monza's temple of speed.
              </p>
            </div>

            {/* Season selector */}
            <div className="flex items-center gap-2">
              {SEASONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSeason(s)}
                  className={`px-3 py-1.5 rounded text-[11px] font-black tracking-wider transition-all ${
                    selectedSeason === s
                      ? "bg-red-600 text-white"
                      : "border border-white/10 text-neutral-400 hover:border-white/30 hover:text-white"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── FILTER BAR ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
              />
              <input
                type="text"
                placeholder="Search circuit, country..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/8 text-white placeholder:text-neutral-600 text-sm focus:outline-none focus:border-red-600/50 focus:bg-white/[0.07] transition-all"
              />
            </div>

            {/* Country filter */}
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/8 text-sm text-white focus:outline-none focus:border-red-600/50 transition-all cursor-pointer"
              style={{ background: "#0d0d14" }}
            >
              <option value="ALL">All Countries</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Track type filter */}
            <div className="flex gap-1">
              {(["ALL", "STREET", "PERMANENT", "MIXED"] as const).map((t) => {
                const active = selectedType === t;
                const style = t !== "ALL" ? TRACK_TYPE_STYLES[t] : null;
                return (
                  <button
                    key={t}
                    onClick={() => setSelectedType(t)}
                    className={`px-3 py-2 rounded-lg text-[10px] font-black tracking-widest uppercase border transition-all ${
                      active
                        ? t === "ALL"
                          ? "bg-red-600 border-red-600 text-white"
                          : `${style?.bg} ${style?.border} ${style?.text}`
                        : "border-white/8 text-neutral-500 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>

            {/* Reset */}
            {hasActiveFilters && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={resetFilters}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 text-neutral-400 hover:text-white text-[11px] font-bold tracking-wider transition-all hover:border-white/20"
              >
                <RotateCcw size={11} />
                RESET
              </motion.button>
            )}
          </div>

          {/* Active filter pills */}
          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex flex-wrap gap-2 mt-3"
            >
              {search && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/[0.08] text-[10px] text-neutral-300 font-bold">
                  <Search size={8} />"{search}"
                </span>
              )}
              {selectedCountry !== "ALL" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/[0.08] text-[10px] text-neutral-300 font-bold">
                  <MapPin size={8} />
                  {selectedCountry}
                </span>
              )}
              {selectedType !== "ALL" && (
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${TRACK_TYPE_STYLES[selectedType]?.text}`}
                >
                  <Flag size={8} />
                  {selectedType}
                </span>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* ── STATS STRIP ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="grid grid-cols-4 gap-4 mb-10"
        >
          {[
            { label: "Total Circuits", value: circuits.length, icon: <Flag size={14} /> },
            { label: "Street Circuits", value: circuits.filter((c) => c.trackType === "STREET").length, icon: <MapPin size={14} /> },
            { label: "DRS Zones", value: circuits.reduce((a, c) => a + c.drsZones, 0), icon: <Zap size={14} /> },
            { label: "Countries", value: new Set(circuits.map((c) => c.country)).size, icon: <Radio size={14} /> },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col gap-1 px-4 py-3 rounded-xl border border-white/6 bg-white/2"
            >
              <div className="flex items-center gap-2 text-neutral-500">
                {stat.icon}
                <span className="text-[9px] uppercase tracking-widest font-bold">{stat.label}</span>
              </div>
              <span className="font-mono text-2xl font-black text-white">{stat.value}</span>
            </div>
          ))}
        </motion.div>

        {/* ── GRID ── */}
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-32 gap-4"
          >
            <div className="text-5xl">🏁</div>
            <p className="text-neutral-400 text-lg font-bold">No circuits match your filters</p>
            <button
              onClick={resetFilters}
              className="mt-2 px-5 py-2 rounded-lg bg-red-600 text-white text-sm font-black tracking-wider hover:bg-red-500 transition-all"
            >
              CLEAR FILTERS
            </button>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            >
              {filtered.map((circuit, index) => (
                <TrackCard
                  key={circuit.id}
                  circuit={circuit}
                  index={index}
                  onClick={() => router.push(`/tracks/${circuit.id}`)}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* ── FOOTER NOTE ── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center text-[10px] text-neutral-700 uppercase tracking-widest font-bold"
        >
          F1 {selectedSeason} · {filtered.length} Circuits · Data subject to FIA confirmation
          {apiLoading && (
            <span className="ml-3 inline-flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
              Syncing with backend...
            </span>
          )}
        </motion.p>
      </div>
    </div>
  );
}
