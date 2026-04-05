"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flag, Trophy, Zap, Clock, Users, AlertTriangle,
  ChevronDown, ChevronUp, CheckCircle2, Circle,
  BookOpen, HelpCircle, RotateCcw,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Module {
  id: string;
  icon: React.ElementType;
  title: string;
  tagline: string;
  color: string;
  content: React.ReactNode;
}

interface Question {
  id: string;
  category: "drivers" | "teams" | "tracks" | "rules" | "history";
  difficulty: "easy" | "medium" | "hard";
  question: string;
  options: string[];
  correct: string;
  explanation: string;
}

type Category = "all" | "drivers" | "teams" | "tracks" | "rules" | "history";
type Difficulty = "all" | "easy" | "medium" | "hard";
type QuizState = "idle" | "running" | "finished";

// ── Utility ────────────────────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Constants ──────────────────────────────────────────────────────────────────
const QUIZ_LENGTH = 10;

const CATEGORY_META: Record<
  Exclude<Category, "all">,
  { label: string; color: string; bg: string; border: string; emoji: string }
> = {
  drivers: { label: "Drivers",  color: "text-blue-400",   bg: "bg-blue-500/15",   border: "border-blue-500/30",   emoji: "🏎️" },
  teams:   { label: "Teams",    color: "text-orange-400", bg: "bg-orange-500/15", border: "border-orange-500/30", emoji: "🏗️" },
  tracks:  { label: "Tracks",   color: "text-green-400",  bg: "bg-green-500/15",  border: "border-green-500/30",  emoji: "🗺️" },
  rules:   { label: "Rules",    color: "text-purple-400", bg: "bg-purple-500/15", border: "border-purple-500/30", emoji: "📋" },
  history: { label: "History",  color: "text-amber-400",  bg: "bg-amber-500/15",  border: "border-amber-500/30",  emoji: "📜" },
};

const DIFFICULTY_META: Record<
  Exclude<Difficulty, "all">,
  { label: string; color: string; bg: string; border: string }
> = {
  easy:   { label: "Easy",   color: "text-green-400",  bg: "bg-green-500/15",  border: "border-green-500/30"  },
  medium: { label: "Medium", color: "text-yellow-400", bg: "bg-yellow-500/15", border: "border-yellow-500/30" },
  hard:   { label: "Hard",   color: "text-red-400",    bg: "bg-red-500/15",    border: "border-red-500/30"    },
};

// ── Question Bank (60 questions) ───────────────────────────────────────────────
const QUESTION_BANK: Question[] = [
  // ── DRIVERS ──────────────────────────────────────────────────────────────────
  {
    id: "d1", category: "drivers", difficulty: "easy",
    question: "Which driver won the 2023 F1 World Championship?",
    options: ["Lewis Hamilton", "Max Verstappen", "Charles Leclerc", "Lando Norris"],
    correct: "Max Verstappen",
    explanation: "Verstappen won his third consecutive title in 2023, setting an all-time record with 19 race wins in a single season.",
  },
  {
    id: "d2", category: "drivers", difficulty: "easy",
    question: "How many Formula 1 World Championships has Lewis Hamilton won?",
    options: ["5", "6", "7", "8"],
    correct: "7",
    explanation: "Hamilton shares the all-time record of 7 championships with Michael Schumacher, winning in 2008, 2014–2015, and 2017–2020.",
  },
  {
    id: "d3", category: "drivers", difficulty: "easy",
    question: "Which driver is nicknamed 'The Iceman'?",
    options: ["Michael Schumacher", "Kimi Räikkönen", "Mika Häkkinen", "Alain Prost"],
    correct: "Kimi Räikkönen",
    explanation: "Kimi Räikkönen earned the nickname 'The Iceman' for his cool, unflustered demeanour on and off the track.",
  },
  {
    id: "d4", category: "drivers", difficulty: "easy",
    question: "What nationality is two-time champion Fernando Alonso?",
    options: ["Italian", "French", "Spanish", "Brazilian"],
    correct: "Spanish",
    explanation: "Fernando Alonso is from Oviedo, Spain. He won back-to-back championships in 2005 and 2006.",
  },
  {
    id: "d5", category: "drivers", difficulty: "medium",
    question: "With which team did Fernando Alonso win his two World Championships?",
    options: ["Ferrari", "McLaren", "Renault", "Mercedes"],
    correct: "Renault",
    explanation: "Alonso won in 2005 and 2006 with the Renault F1 Team, becoming the youngest champion at the time.",
  },
  {
    id: "d6", category: "drivers", difficulty: "medium",
    question: "Lewis Hamilton moved from McLaren to which team ahead of the 2013 season?",
    options: ["Ferrari", "Mercedes", "Red Bull", "Williams"],
    correct: "Mercedes",
    explanation: "Hamilton's move to Mercedes proved transformative — he won 6 of his 7 championships with the team.",
  },
  {
    id: "d7", category: "drivers", difficulty: "medium",
    question: "Who became the youngest F1 World Champion at the time, winning his first title in 2010 at age 23?",
    options: ["Fernando Alonso", "Lewis Hamilton", "Max Verstappen", "Sebastian Vettel"],
    correct: "Sebastian Vettel",
    explanation: "Vettel was 23 years old when he clinched the 2010 title in a dramatic finale in Abu Dhabi. He still holds the record as youngest F1 champion.",
  },
  {
    id: "d8", category: "drivers", difficulty: "medium",
    question: "Who holds the record for most wins in a single F1 season, with 19 victories in 2023?",
    options: ["Sebastian Vettel", "Michael Schumacher", "Lewis Hamilton", "Max Verstappen"],
    correct: "Max Verstappen",
    explanation: "Verstappen shattered the previous joint record of 13 wins in a season held by Schumacher (2004) and Hamilton (2020).",
  },
  {
    id: "d9", category: "drivers", difficulty: "hard",
    question: "Which driver holds the record for most consecutive Grand Prix wins, claiming 9 in a row in 2013?",
    options: ["Lewis Hamilton", "Michael Schumacher", "Sebastian Vettel", "Ayrton Senna"],
    correct: "Sebastian Vettel",
    explanation: "Vettel won 9 consecutive races from Belgium to Brazil in 2013 — an all-time F1 record.",
  },
  {
    id: "d10", category: "drivers", difficulty: "hard",
    question: "Who was the most recent British F1 World Champion before Lewis Hamilton's first title in 2008?",
    options: ["Nigel Mansell", "Damon Hill", "Jenson Button", "Mike Hawthorn"],
    correct: "Damon Hill",
    explanation: "Damon Hill won the 1996 championship with Williams — the last Brit to do so before Hamilton in 2008.",
  },
  {
    id: "d11", category: "drivers", difficulty: "hard",
    question: "With which team did Ayrton Senna win all three of his World Championships?",
    options: ["Williams", "Ferrari", "Lotus", "McLaren"],
    correct: "McLaren",
    explanation: "Senna won with McLaren in 1988, 1990, and 1991, powered by Honda engines.",
  },
  {
    id: "d12", category: "drivers", difficulty: "hard",
    question: "How many Formula 1 World Championships did Michael Schumacher win in total?",
    options: ["5", "6", "7", "8"],
    correct: "7",
    explanation: "Schumacher won 7 titles: 1994–1995 with Benetton, then 2000–2004 with Ferrari — a record he shares with Lewis Hamilton.",
  },

  // ── TEAMS ─────────────────────────────────────────────────────────────────────
  {
    id: "t1", category: "teams", difficulty: "easy",
    question: "Which F1 team has won the most Constructors' Championships in history?",
    options: ["McLaren", "Williams", "Ferrari", "Mercedes"],
    correct: "Ferrari",
    explanation: "Scuderia Ferrari has won 16 Constructors' Championships — more than any other team in F1 history.",
  },
  {
    id: "t2", category: "teams", difficulty: "easy",
    question: "What colour are Ferrari's Formula 1 cars?",
    options: ["Red", "Silver", "Orange", "Blue"],
    correct: "Red",
    explanation: "Ferrari's iconic 'Rosso Corsa' (Racing Red) dates back to the pre-war era when Italian racing cars were painted red by national convention.",
  },
  {
    id: "t3", category: "teams", difficulty: "easy",
    question: "McLaren's cars are famous for what signature colour?",
    options: ["Bright Yellow", "Papaya Orange", "Electric Blue", "Forest Green"],
    correct: "Papaya Orange",
    explanation: "McLaren's iconic papaya orange originated in the 1960s when founder Bruce McLaren raced in that colour.",
  },
  {
    id: "t4", category: "teams", difficulty: "easy",
    question: "Which team does Max Verstappen race for?",
    options: ["McLaren", "Mercedes", "Red Bull Racing", "Ferrari"],
    correct: "Red Bull Racing",
    explanation: "Verstappen joined Red Bull's senior team in 2016 and has won four World Championships with them.",
  },
  {
    id: "t5", category: "teams", difficulty: "medium",
    question: "Which constructor won 7 consecutive Constructors' Championships from 2014 to 2020?",
    options: ["Red Bull", "Ferrari", "McLaren", "Mercedes"],
    correct: "Mercedes",
    explanation: "Mercedes-AMG Petronas dominated the hybrid era, winning every Constructors' title from 2014 to 2020.",
  },
  {
    id: "t6", category: "teams", difficulty: "medium",
    question: "Alpine F1 Team was rebranded from which team at the start of 2021?",
    options: ["Force India", "Renault", "Lotus", "Jaguar"],
    correct: "Renault",
    explanation: "Renault rebranded their works team to Alpine in 2021, named after their iconic sports car brand.",
  },
  {
    id: "t7", category: "teams", difficulty: "medium",
    question: "Which team was Aston Martin F1 before rebranding in 2021?",
    options: ["Force India", "Racing Point", "Jordan", "BAR Honda"],
    correct: "Racing Point",
    explanation: "After Lawrence Stroll's investment, the team ran as Racing Point (2019–2020) before becoming Aston Martin F1.",
  },
  {
    id: "t8", category: "teams", difficulty: "medium",
    question: "Red Bull's sister team ran as AlphaTauri before rebranding in 2024. What is it called now?",
    options: ["Toro Rosso", "RB (Visa Cash App RB)", "Red Bull B-Team", "Scuderia Alpha"],
    correct: "RB (Visa Cash App RB)",
    explanation: "AlphaTauri became Visa Cash App RB — commonly called RB — for the 2024 season.",
  },
  {
    id: "t9", category: "teams", difficulty: "hard",
    question: "Which team won the very first Formula 1 Constructors' Championship in 1958?",
    options: ["Ferrari", "BRM", "Vanwall", "Cooper"],
    correct: "Vanwall",
    explanation: "British constructor Vanwall won the inaugural 1958 Constructors' Championship, beating Ferrari with drivers Stirling Moss and Tony Brooks.",
  },
  {
    id: "t10", category: "teams", difficulty: "hard",
    question: "Williams Racing is headquartered near which English town?",
    options: ["Woking, Surrey", "Grove, Oxfordshire", "Brackley, Northamptonshire", "Enstone, Oxfordshire"],
    correct: "Grove, Oxfordshire",
    explanation: "Williams is based in Grove, Oxfordshire. McLaren is in Woking, Mercedes in Brackley, and Alpine/Renault in Enstone.",
  },
  {
    id: "t11", category: "teams", difficulty: "hard",
    question: "Which team pioneered 'ground effect' aerodynamics in F1 in the late 1970s, revolutionising downforce?",
    options: ["Ferrari", "Brabham", "Tyrrell", "Lotus"],
    correct: "Lotus",
    explanation: "Lotus, led by designer Colin Chapman, introduced the revolutionary wing car with venturi tunnels in the Lotus 78 (1977) and 79 (1978).",
  },
  {
    id: "t12", category: "teams", difficulty: "hard",
    question: "How many Formula 1 Constructors' Championships has McLaren won in total?",
    options: ["6", "7", "8", "9"],
    correct: "8",
    explanation: "McLaren has won 8 Constructors' Championships: 1974, 1984, 1985, 1988, 1989, 1990, 1991, and 1998.",
  },

  // ── TRACKS ────────────────────────────────────────────────────────────────────
  {
    id: "tr1", category: "tracks", difficulty: "easy",
    question: "Which Italian circuit is nicknamed 'The Temple of Speed'?",
    options: ["Imola", "Monza", "Mugello", "Fiorano"],
    correct: "Monza",
    explanation: "The Autodromo Nazionale di Monza is famous for its high-speed layout and passionate tifosi fans.",
  },
  {
    id: "tr2", category: "tracks", difficulty: "easy",
    question: "The British Grand Prix is held at which circuit?",
    options: ["Brands Hatch", "Donington Park", "Silverstone", "Oulton Park"],
    correct: "Silverstone",
    explanation: "Silverstone has hosted the British Grand Prix since 1950, including the very first F1 World Championship race.",
  },
  {
    id: "tr3", category: "tracks", difficulty: "easy",
    question: "Suzuka Circuit, famous for its unique figure-of-eight layout, is in which country?",
    options: ["South Korea", "China", "Japan", "Singapore"],
    correct: "Japan",
    explanation: "Suzuka is in Mie Prefecture, Japan. Its complex, flowing corners make it a favourite among drivers.",
  },
  {
    id: "tr4", category: "tracks", difficulty: "easy",
    question: "The Australian Grand Prix is held in which city?",
    options: ["Sydney", "Melbourne", "Brisbane", "Perth"],
    correct: "Melbourne",
    explanation: "The Australian GP is held at Albert Park in Melbourne and traditionally opens the F1 season.",
  },
  {
    id: "tr5", category: "tracks", difficulty: "medium",
    question: "Which circuit is nicknamed 'The Green Hell' due to its gruelling 154-corner layout?",
    options: ["Spa-Francorchamps", "Nürburgring Nordschleife", "Suzuka", "Monaco"],
    correct: "Nürburgring Nordschleife",
    explanation: "The Nordschleife spans 20.8 km through the Eifel forests. Jackie Stewart coined the nickname in the 1970s.",
  },
  {
    id: "tr6", category: "tracks", difficulty: "medium",
    question: "Which iconic corner at Spa-Francorchamps is one of the most photographed in motorsport?",
    options: ["La Source", "Eau Rouge / Raidillon", "Pouhon", "Bus Stop"],
    correct: "Eau Rouge / Raidillon",
    explanation: "Eau Rouge (officially Raidillon) is a high-speed uphill left-right-left flick that tests driver bravery and car downforce.",
  },
  {
    id: "tr7", category: "tracks", difficulty: "medium",
    question: "The Circuit of the Americas (COTA) is located in which US city?",
    options: ["Los Angeles, California", "Miami, Florida", "Austin, Texas", "Las Vegas, Nevada"],
    correct: "Austin, Texas",
    explanation: "COTA opened in 2012 and hosts the United States Grand Prix. Its layout was inspired by several classic F1 circuits.",
  },
  {
    id: "tr8", category: "tracks", difficulty: "medium",
    question: "In which year did the Singapore Grand Prix become Formula 1's first-ever night race?",
    options: ["2006", "2007", "2008", "2010"],
    correct: "2008",
    explanation: "The inaugural Singapore GP in 2008 at Marina Bay Street Circuit was the first F1 race held entirely under floodlights.",
  },
  {
    id: "tr9", category: "tracks", difficulty: "hard",
    question: "How many corners does the Monaco Grand Prix street circuit have?",
    options: ["16", "17", "19", "22"],
    correct: "19",
    explanation: "Monaco has 19 corners packed into just 3.337 km — the shortest and most technically demanding circuit on the calendar.",
  },
  {
    id: "tr10", category: "tracks", difficulty: "hard",
    question: "Which circuit in Canada is famous for its 'Wall of Champions', where multiple title-holders have crashed?",
    options: ["Circuit Mont-Tremblant", "Circuit Gilles Villeneuve", "Mosport Park", "Circuit Notre-Dame"],
    correct: "Circuit Gilles Villeneuve",
    explanation: "The exit wall of the final chicane earned the nickname after Hill, Schumacher, and Villeneuve all hit it during the 1999 Canadian GP.",
  },
  {
    id: "tr11", category: "tracks", difficulty: "hard",
    question: "The Bahrain International Circuit is built in which desert area of Bahrain?",
    options: ["Manama", "Sakhir", "Muharraq", "Riffa"],
    correct: "Sakhir",
    explanation: "Built in the Sakhir desert, the circuit is also referred to as the Sakhir Circuit. Bahrain also uses a shorter Outer Circuit layout for some events.",
  },
  {
    id: "tr12", category: "tracks", difficulty: "hard",
    question: "The first-ever round of the 1950 F1 World Championship was held at which circuit?",
    options: ["Monaco", "Spa-Francorchamps", "Reims", "Silverstone"],
    correct: "Silverstone",
    explanation: "The British Grand Prix at Silverstone on 13 May 1950 was Round 1 of the inaugural FIA Formula One World Championship.",
  },

  // ── RULES ─────────────────────────────────────────────────────────────────────
  {
    id: "r1", category: "rules", difficulty: "easy",
    question: "How many championship points does the winner of a Formula 1 race receive?",
    options: ["20", "25", "30", "10"],
    correct: "25",
    explanation: "The current points system awards 25 for a win, 18 for P2, 15 for P3, and so on down to 1 point for P10.",
  },
  {
    id: "r2", category: "rules", difficulty: "easy",
    question: "What does DRS stand for in Formula 1?",
    options: ["Dynamic Racing System", "Drag Reduction System", "Differential Rear Spoiler", "Driver Response Signal"],
    correct: "Drag Reduction System",
    explanation: "DRS opens a flap on the rear wing to reduce drag, giving the chasing car a speed boost of ~10–15 km/h to aid overtaking.",
  },
  {
    id: "r3", category: "rules", difficulty: "easy",
    question: "What does DNF mean in racing results?",
    options: ["Did Not Finish", "Did Not Fuel", "Driver Not Found", "Did Not Form"],
    correct: "Did Not Finish",
    explanation: "DNF means the driver retired before completing the race — due to mechanical failure, collision, or other reasons.",
  },
  {
    id: "r4", category: "rules", difficulty: "easy",
    question: "How many cars does each F1 team enter per race weekend?",
    options: ["1", "2", "3", "4"],
    correct: "2",
    explanation: "Each of the 10 teams enters exactly 2 cars, giving a full grid of 20 drivers.",
  },
  {
    id: "r5", category: "rules", difficulty: "medium",
    question: "In which year was the Drag Reduction System (DRS) first introduced to Formula 1?",
    options: ["2009", "2010", "2011", "2013"],
    correct: "2011",
    explanation: "DRS debuted in the 2011 season to increase overtaking after concerns about processional racing in the V8 era.",
  },
  {
    id: "r6", category: "rules", difficulty: "medium",
    question: "What is 'parc fermé' in Formula 1?",
    options: [
      "The area where cars are weighed after a race",
      "A zone where cars cannot be significantly altered after qualifying",
      "The pit lane speed limit zone",
      "The designated media pen for drivers",
    ],
    correct: "A zone where cars cannot be significantly altered after qualifying",
    explanation: "Once cars enter parc fermé after qualifying, teams can only make approved changes — no performance-altering setup modifications are permitted.",
  },
  {
    id: "r7", category: "rules", difficulty: "medium",
    question: "What does VSC stand for in Formula 1?",
    options: ["Variable Speed Control", "Vehicle Safety Circuit", "Virtual Safety Car", "Variable Sector Calculation"],
    correct: "Virtual Safety Car",
    explanation: "The Virtual Safety Car (introduced 2015) requires all drivers to maintain a prescribed delta time without a physical safety car needing to lead the field.",
  },
  {
    id: "r8", category: "rules", difficulty: "medium",
    question: "How many bonus championship points does a driver earn for the fastest lap (if finishing in the top 10)?",
    options: ["0.5", "1", "2", "3"],
    correct: "1",
    explanation: "Since 2019, 1 bonus point is awarded for the fastest lap — but only if the driver finishes in the top 10.",
  },
  {
    id: "r9", category: "rules", difficulty: "hard",
    question: "How many Internal Combustion Engines (ICE) can a driver use per season before taking a grid penalty?",
    options: ["2", "3", "4", "5"],
    correct: "3",
    explanation: "Each driver is limited to 3 ICEs per season. A 10-place grid penalty is applied for each additional engine used beyond the allocation.",
  },
  {
    id: "r10", category: "rules", difficulty: "hard",
    question: "What minimum percentage of the race distance must be completed for full points to be awarded?",
    options: ["50%", "66%", "75%", "90%"],
    correct: "75%",
    explanation: "If a race ends before 75% distance, only half points are awarded. Full points require at least 75% of the scheduled distance to be completed.",
  },
  {
    id: "r11", category: "rules", difficulty: "hard",
    question: "How many Sprint races are included in the 2024 Formula 1 season calendar?",
    options: ["4", "5", "6", "8"],
    correct: "6",
    explanation: "The 2024 calendar features 6 Sprint weekends. Each Sprint race is ~100 km and awards points from P1 (8 pts) down to P8 (1 pt).",
  },
  {
    id: "r12", category: "rules", difficulty: "hard",
    question: "What is the minimum weight of an F1 car including the driver for the 2024 season?",
    options: ["752 kg", "775 kg", "800 kg", "822 kg"],
    correct: "800 kg",
    explanation: "The 2024 minimum combined car and driver weight is 800 kg. Teams can add ballast to reach this limit and optimise weight distribution.",
  },

  // ── HISTORY ───────────────────────────────────────────────────────────────────
  {
    id: "h1", category: "history", difficulty: "easy",
    question: "In which year did the Formula 1 World Championship begin?",
    options: ["1945", "1950", "1955", "1960"],
    correct: "1950",
    explanation: "The first FIA Formula One World Championship race was held at Silverstone on 13 May 1950.",
  },
  {
    id: "h2", category: "history", difficulty: "easy",
    question: "Who was the first Formula 1 World Champion?",
    options: ["Juan Manuel Fangio", "Giuseppe Farina", "Alberto Ascari", "Jack Brabham"],
    correct: "Giuseppe Farina",
    explanation: "Italian driver 'Nino' Farina won the inaugural 1950 championship driving an Alfa Romeo 158.",
  },
  {
    id: "h3", category: "history", difficulty: "easy",
    question: "Which decade saw Michael Schumacher win 5 consecutive World Championships?",
    options: ["1990s", "2000s", "2010s", "1980s"],
    correct: "2000s",
    explanation: "Schumacher won from 2000 to 2004 with Ferrari — five consecutive titles that seemed unbeatable at the time.",
  },
  {
    id: "h4", category: "history", difficulty: "easy",
    question: "What nationality was the legendary racing driver Ayrton Senna?",
    options: ["Argentine", "Mexican", "Brazilian", "Colombian"],
    correct: "Brazilian",
    explanation: "Ayrton Senna was from São Paulo, Brazil. He is widely regarded as one of the greatest drivers in F1 history.",
  },
  {
    id: "h5", category: "history", difficulty: "medium",
    question: "In which year did Ayrton Senna tragically lose his life at the San Marino Grand Prix?",
    options: ["1992", "1993", "1994", "1995"],
    correct: "1994",
    explanation: "Senna died on 1 May 1994 at Imola's Tamburello corner — one of the darkest days in motorsport history.",
  },
  {
    id: "h6", category: "history", difficulty: "medium",
    question: "How many Formula 1 World Championships did the legendary Juan Manuel Fangio win?",
    options: ["3", "4", "5", "6"],
    correct: "5",
    explanation: "Argentine driver Fangio won 5 championships (1951, 1954–1957) — a record that stood for 45 years until Schumacher broke it in 2003.",
  },
  {
    id: "h7", category: "history", difficulty: "medium",
    question: "In 1988, McLaren won 15 of 16 races. Who were their two drivers that season?",
    options: ["Nigel Mansell and Nelson Piquet", "Ayrton Senna and Alain Prost", "Niki Lauda and James Hunt", "Michael Schumacher and Damon Hill"],
    correct: "Ayrton Senna and Alain Prost",
    explanation: "The 1988 McLaren-Honda with Senna (8 wins) and Prost (7 wins) produced the most dominant single season in F1 history.",
  },
  {
    id: "h8", category: "history", difficulty: "medium",
    question: "Lewis Hamilton clinched his first World Championship on the final lap of which 2008 race?",
    options: ["Japanese Grand Prix", "Brazilian Grand Prix", "Abu Dhabi Grand Prix", "Chinese Grand Prix"],
    correct: "Brazilian Grand Prix",
    explanation: "In a dramatic finale at Interlagos, Hamilton overtook Timo Glock on the last lap to take P5 and the title by just 1 point over Felipe Massa.",
  },
  {
    id: "h9", category: "history", difficulty: "hard",
    question: "Which team won back-to-back Constructors' Championships in 1992 and 1993 with different drivers each year?",
    options: ["McLaren", "Ferrari", "Williams", "Benetton"],
    correct: "Williams",
    explanation: "Williams-Renault won with Nigel Mansell in 1992 and Alain Prost in 1993, powered by the dominant Renault V10.",
  },
  {
    id: "h10", category: "history", difficulty: "hard",
    question: "The 'Turbo Era' of Formula 1, when turbocharged engines were used, roughly spanned which years?",
    options: ["1969–1979", "1977–1988", "1983–1994", "1985–1995"],
    correct: "1977–1988",
    explanation: "Turbos were introduced by Renault in 1977 and banned after 1988. At their peak, qualifying engines produced over 1,400 hp.",
  },
  {
    id: "h11", category: "history", difficulty: "hard",
    question: "Niki Lauda's near-fatal accident at the 1976 German Grand Prix was depicted in which film?",
    options: ["Senna", "Rush", "Grand Prix", "Le Mans '66"],
    correct: "Rush",
    explanation: "The 2013 film 'Rush' by Ron Howard depicts the 1976 title battle between Niki Lauda (Ferrari) and James Hunt (McLaren).",
  },
  {
    id: "h12", category: "history", difficulty: "hard",
    question: "The iconic 1976 F1 title fight ended with Niki Lauda and which British driver going to the final race in Japan?",
    options: ["James Hunt", "Jody Scheckter", "John Watson", "Carlos Reutemann"],
    correct: "James Hunt",
    explanation: "Hunt won the 1976 title by 1 point after Lauda withdrew from the rain-soaked Japanese GP. Hunt finished third, claiming the championship.",
  },
];

// ── Module Content ─────────────────────────────────────────────────────────────
const modules: Module[] = [
  {
    id: "what-is-f1",
    icon: Zap,
    title: "What is Formula 1?",
    tagline: "The fastest sport on the planet",
    color: "#DC0000",
    content: (
      <div className="space-y-6">
        <p className="text-neutral-300 text-lg leading-relaxed">
          Imagine 20 drivers in the world's fastest cars — each one pushing over{" "}
          <span className="text-red-500 font-bold">300 km/h</span> (that's faster
          than most commercial aircraft take off!) — competing on famous tracks
          across the globe. That's Formula 1.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Top Speed", value: "350+ km/h", sub: "faster than a bullet train" },
            { label: "G-Force", value: "6G", sub: "like 6× your body weight" },
            { label: "Race Calendar", value: "24 races", sub: "across 5 continents" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
              <p className="text-3xl font-black text-red-500 mb-1">{stat.value}</p>
              <p className="text-xs font-bold uppercase text-neutral-400 tracking-widest">{stat.label}</p>
              <p className="text-xs text-neutral-500 mt-1">{stat.sub}</p>
            </div>
          ))}
        </div>
        <Callout icon="💡" title="Fun Analogy">
          Think of F1 like a combination of chess and sprinting. You need lightning-fast
          reflexes <em>and</em> a clever strategy — both driver and team matter!
        </Callout>
      </div>
    ),
  },
  {
    id: "race-weekend",
    icon: Clock,
    title: "The Race Weekend",
    tagline: "Three days, three phases",
    color: "#0600EF",
    content: (
      <div className="space-y-6">
        <p className="text-neutral-300 leading-relaxed">
          A Grand Prix isn't just one race — it's an entire weekend of action across three days.
        </p>
        <div className="space-y-3">
          {[
            {
              day: "Friday",
              sessions: ["FP1 – Free Practice 1", "FP2 – Free Practice 2"],
              desc: "Teams test setups, learn the track, collect data. Like studying before an exam.",
              badge: "Practice",
              badgeColor: "bg-blue-600/20 text-blue-400 border-blue-600/30",
            },
            {
              day: "Saturday",
              sessions: ["FP3 – Free Practice 3", "Qualifying"],
              desc: "Qualifying decides starting positions. Fastest lap wins pole position — P1 on the grid.",
              badge: "Qualify",
              badgeColor: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
            },
            {
              day: "Sunday",
              sessions: ["THE RACE 🏁"],
              desc: "The main event! Drivers race for championship points. First to cross the finish line wins.",
              badge: "Race Day",
              badgeColor: "bg-red-600/20 text-red-400 border-red-600/30",
            },
          ].map((d) => (
            <div key={d.day} className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-black text-lg">{d.day}</h3>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${d.badgeColor}`}>
                  {d.badge}
                </span>
              </div>
              <div className="flex gap-2 flex-wrap mb-2">
                {d.sessions.map((s) => (
                  <span key={s} className="text-xs bg-white/10 px-3 py-1 rounded-full font-mono">
                    {s}
                  </span>
                ))}
              </div>
              <p className="text-sm text-neutral-400">{d.desc}</p>
            </div>
          ))}
        </div>
        <Callout icon="🏎️" title="Sprint Weekends">
          Some races also have a Sprint — a shorter 100km race on Saturday that also awards
          points. Think of it as bonus content!
        </Callout>
      </div>
    ),
  },
  {
    id: "teams-drivers",
    icon: Users,
    title: "Teams & Drivers",
    tagline: "10 teams, 20 drivers, infinite drama",
    color: "#FF8700",
    content: (
      <div className="space-y-6">
        <p className="text-neutral-300 leading-relaxed">
          F1 has <span className="text-red-500 font-bold">10 teams</span> (called{" "}
          <em>constructors</em>), and each team runs{" "}
          <span className="text-red-500 font-bold">2 cars</span> with 2 drivers.
          That gives us exactly 20 drivers on the grid.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { team: "Red Bull", color: "#0600EF", drivers: "Verstappen & Perez", champs: "4× recent champs" },
            { team: "Ferrari", color: "#DC0000", drivers: "Leclerc & Sainz", champs: "Most wins ever (16)" },
            { team: "Mercedes", color: "#00D4BE", drivers: "Hamilton & Russell", champs: "7× constructors" },
            { team: "McLaren", color: "#FF8700", drivers: "Norris & Piastri", champs: "Rising in 2024" },
            { team: "Aston Martin", color: "#006F62", drivers: "Alonso & Stroll", champs: "Alonso: 2× champ" },
            { team: "Alpine", color: "#0082FA", drivers: "Gasly & Ocon", champs: "French flag carrier" },
          ].map((t) => (
            <div
              key={t.team}
              className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10"
            >
              <div
                className="w-2 self-stretch rounded-full flex-shrink-0"
                style={{ backgroundColor: t.color }}
              />
              <div className="min-w-0">
                <p className="font-black">{t.team}</p>
                <p className="text-xs text-neutral-400">{t.drivers}</p>
                <p className="text-xs text-neutral-600 mt-0.5 italic">{t.champs}</p>
              </div>
            </div>
          ))}
        </div>
        <Callout icon="🧠" title="Key Difference: Driver vs Constructor Championship">
          There are TWO championships each year — one for the best{" "}
          <strong>driver</strong> and one for the best <strong>team</strong>.
          A team earns points from both its cars combined.
        </Callout>
      </div>
    ),
  },
  {
    id: "points",
    icon: Trophy,
    title: "The Points System",
    tagline: "How drivers earn their championship",
    color: "#FFD700",
    content: (
      <div className="space-y-6">
        <p className="text-neutral-300 leading-relaxed">
          After every race, the top 10 drivers collect championship points.
          At the end of the season, whoever has the most points becomes{" "}
          <span className="text-yellow-400 font-bold">World Champion</span>.
        </p>
        <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
          {[
            { pos: "P1", pts: 25, medal: "🥇" },
            { pos: "P2", pts: 18, medal: "🥈" },
            { pos: "P3", pts: 15, medal: "🥉" },
            { pos: "P4", pts: 12, medal: "" },
            { pos: "P5", pts: 10, medal: "" },
            { pos: "P6", pts: 8, medal: "" },
            { pos: "P7", pts: 6, medal: "" },
            { pos: "P8", pts: 4, medal: "" },
            { pos: "P9", pts: 2, medal: "" },
            { pos: "P10", pts: 1, medal: "" },
          ].map((p) => (
            <div key={p.pos} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
              <p className="text-[10px] font-bold text-neutral-500 uppercase">{p.pos}</p>
              <p className="text-xl font-black text-white">{p.pts}</p>
              {p.medal && <p className="text-sm">{p.medal}</p>}
            </div>
          ))}
        </div>
        <Callout icon="⚡" title="Bonus Point: Fastest Lap">
          One extra point is awarded for the fastest single lap of the race —
          but only if that driver finishes in the top 10!
        </Callout>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <p className="text-sm font-bold mb-2 text-neutral-300">Example season:</p>
          <p className="text-sm text-neutral-400">
            If you win every race, you'd score <strong className="text-white">25 × 24 = 600 points</strong>.
            In reality, the 2024 champion scored around <strong className="text-white">437 points</strong> —
            no one wins every race!
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "flags",
    icon: Flag,
    title: "F1 Flags Explained",
    tagline: "What marshals are trying to tell drivers",
    color: "#22c55e",
    content: (
      <div className="space-y-4">
        <p className="text-neutral-300 leading-relaxed">
          Marshals wave flags at the trackside to communicate with drivers during a race.
          Each colour has a specific meaning — drivers must obey them instantly.
        </p>
        <div className="space-y-3">
          {[
            { flag: "🟢", name: "Green Flag", meaning: "All clear — go full speed! Track is safe." },
            { flag: "🟡", name: "Yellow Flag", meaning: "Danger ahead. Slow down, NO overtaking. A car may be stopped on track." },
            { flag: "🔴", name: "Red Flag", meaning: "Race STOPPED. Everyone slows down and returns to pit lane. Serious incident ahead." },
            { flag: "🏁", name: "Chequered Flag", meaning: "The race is OVER! First car to see this flag wins." },
            { flag: "🔵", name: "Blue Flag", meaning: "A faster car (usually a lap ahead) is about to overtake you. Move aside!" },
            { flag: "⬛🟨", name: "Black & Yellow Flag", meaning: "Your car has damage — return to the pit for repairs." },
            { flag: "⬛", name: "Black Flag", meaning: "You are disqualified. Come into the pit immediately." },
            { flag: "🏳️", name: "White Flag", meaning: "A slow vehicle (like a Safety Car) is on the track ahead." },
          ].map((f) => (
            <div key={f.name} className="flex items-start gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl">
              <span className="text-2xl flex-shrink-0 w-8 text-center">{f.flag}</span>
              <div>
                <p className="font-bold text-white">{f.name}</p>
                <p className="text-sm text-neutral-400">{f.meaning}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "pit-stops",
    icon: AlertTriangle,
    title: "Pit Stops",
    tagline: "The art of changing 4 tyres in under 2 seconds",
    color: "#a855f7",
    content: (
      <div className="space-y-6">
        <p className="text-neutral-300 leading-relaxed">
          During a race, cars must stop at least once to change their tyres — this is called
          a <strong className="text-white">pit stop</strong>. A top team can swap all 4 tyres
          in under <span className="text-red-500 font-bold">2 seconds</span>!
        </p>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h3 className="font-black mb-4 text-white">How a Pit Stop Works</h3>
          <ol className="space-y-3">
            {[
              'Driver radios in: "Box, box" means come to the pits',
              "Car drives down the pit lane (~80km/h speed limit)",
              "Car stops in its exact garage spot — millimetre precision",
              "20 mechanics surround the car simultaneously",
              "3 mechanics per wheel: one removes nut, one takes old tyre, one puts new tyre",
              "Green light goes on — driver accelerates back into the race",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-neutral-300">
                <span className="bg-red-600/20 text-red-500 border border-red-600/30 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-xs mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { type: "Soft 🔴", desc: "Fastest, but wears out quickly. Best for short stints or one hot lap." },
            { type: "Medium 🟡", desc: "Balanced tyre. Good speed AND durability. Most common strategy." },
            { type: "Hard ⚪", desc: "Slowest, but lasts the longest. Great for long stints without stopping." },
          ].map((t) => (
            <div key={t.type} className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <p className="font-black text-sm mb-2">{t.type}</p>
              <p className="text-xs text-neutral-400">{t.desc}</p>
            </div>
          ))}
        </div>
        <Callout icon="🎯" title="Strategy matters!">
          Deciding when to pit — and which tyre to switch to — is one of the biggest tactical
          decisions in F1. Teams run simulations on supercomputers during the race.
        </Callout>
      </div>
    ),
  },
  {
    id: "drs",
    icon: Zap,
    title: "DRS: The Overtaking Superpower",
    tagline: "How drivers get an aerodynamic boost",
    color: "#06b6d4",
    content: (
      <div className="space-y-6">
        <p className="text-neutral-300 leading-relaxed">
          DRS stands for <strong className="text-white">Drag Reduction System</strong>.
          It's a flap on the rear wing that opens up to reduce air resistance — giving a driver
          a speed boost of around <span className="text-red-500 font-bold">10-15 km/h</span>.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="font-black mb-2 flex items-center gap-2">
              <span className="text-green-400">✅</span> DRS Open
            </p>
            <p className="text-sm text-neutral-400">
              Rear wing flap opens → less air resistance → more top speed.
              Like opening a parachute in reverse!
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="font-black mb-2 flex items-center gap-2">
              <span className="text-red-400">❌</span> DRS Closed
            </p>
            <p className="text-sm text-neutral-400">
              Wing stays closed → more downforce → better cornering grip.
              Essential through fast corners.
            </p>
          </div>
        </div>
        <div className="bg-red-600/10 border border-red-600/20 rounded-2xl p-5">
          <h3 className="font-black mb-3 text-red-400">Rules for DRS</h3>
          <ul className="space-y-2 text-sm text-neutral-300">
            <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-green-500 flex-shrink-0 mt-0.5" /> You must be within <strong>1 second</strong> of the car ahead to use it</li>
            <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-green-500 flex-shrink-0 mt-0.5" /> It can only be used in designated <strong>DRS zones</strong> (straights)</li>
            <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-green-500 flex-shrink-0 mt-0.5" /> DRS is disabled in wet or dangerous conditions</li>
            <li className="flex items-start gap-2"><Circle size={16} className="text-yellow-500 flex-shrink-0 mt-0.5" /> Each circuit has <strong>1–4 DRS zones</strong></li>
          </ul>
        </div>
        <Callout icon="🤔" title="Why does DRS exist?">
          Before DRS (introduced in 2011), overtaking was very difficult because the car
          behind gets hit by turbulent "dirty air". DRS helps level the playing field!
        </Callout>
      </div>
    ),
  },
];

// ── Helper Components ──────────────────────────────────────────────────────────
function Callout({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex gap-4">
      <span className="text-2xl flex-shrink-0">{icon}</span>
      <div>
        <p className="font-black text-sm mb-1 text-white">{title}</p>
        <p className="text-sm text-neutral-400 leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function LearnPage() {
  // Learn tab
  const [activeTab, setActiveTab] = useState<"learn" | "quiz">("learn");
  const [openModule, setOpenModule] = useState<string | null>("what-is-f1");
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  // Quiz tab
  const [category, setCategory] = useState<Category>("all");
  const [difficulty, setDifficulty] = useState<Difficulty>("all");
  const [quizState, setQuizState] = useState<QuizState>("idle");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [answerLog, setAnswerLog] = useState<boolean[]>([]);

  const availableCount = useMemo(
    () =>
      QUESTION_BANK.filter(
        (q) =>
          (category === "all" || q.category === category) &&
          (difficulty === "all" || q.difficulty === difficulty)
      ).length,
    [category, difficulty]
  );

  const currentQuestion = questions[currentIndex];

  const startQuiz = () => {
    const pool = QUESTION_BANK.filter(
      (q) =>
        (category === "all" || q.category === category) &&
        (difficulty === "all" || q.difficulty === difficulty)
    );
    const selected = shuffle(pool)
      .slice(0, QUIZ_LENGTH)
      .map((q) => ({ ...q, options: shuffle(q.options) }));
    setQuestions(selected);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setRevealed(false);
    setScore(0);
    setAnswerLog([]);
    setQuizState("running");
  };

  const handleAnswer = (option: string) => {
    if (revealed) return;
    setSelectedAnswer(option);
    setRevealed(true);
    const correct = option === currentQuestion.correct;
    if (correct) setScore((s) => s + 1);
    setAnswerLog((prev) => [...prev, correct]);
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      setQuizState("finished");
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setRevealed(false);
    }
  };

  const resetQuiz = () => {
    setQuizState("idle");
    setQuestions([]);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setRevealed(false);
    setScore(0);
    setAnswerLog([]);
  };

  const getGrade = (s: number) => {
    if (s === QUIZ_LENGTH) return { label: "Race Winner",      emoji: "🏆", color: "text-yellow-400", border: "border-yellow-500/40", bg: "bg-yellow-500/10" };
    if (s >= 8)           return { label: "Podium Finisher",   emoji: "🥈", color: "text-green-400",  border: "border-green-500/40",  bg: "bg-green-500/10"  };
    if (s >= 6)           return { label: "Points Finisher",   emoji: "✅", color: "text-blue-400",   border: "border-blue-500/40",   bg: "bg-blue-500/10"   };
    if (s >= 4)           return { label: "Midfield Driver",   emoji: "🔄", color: "text-yellow-500", border: "border-yellow-600/40", bg: "bg-yellow-600/10" };
    return                       { label: "Back of the Grid",  emoji: "📚", color: "text-red-400",    border: "border-red-500/40",    bg: "bg-red-500/10"    };
  };

  const getOptionClass = (option: string) => {
    const base = "w-full text-left px-5 py-4 rounded-2xl border text-sm font-medium transition-all duration-150";
    if (!revealed)
      return `${base} bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/25 cursor-pointer`;
    if (option === currentQuestion.correct)
      return `${base} bg-green-500/20 border-green-500/50 text-green-300`;
    if (option === selectedAnswer)
      return `${base} bg-red-500/20 border-red-500/50 text-red-300`;
    return `${base} bg-white/3 border-white/5 text-neutral-600 cursor-default`;
  };

  const toggleModule = (id: string) => {
    setOpenModule((prev) => (prev === id ? null : id));
    setCompleted((prev) => new Set([...prev, id]));
  };

  return (
    <div className="min-h-screen bg-[#050508]">
      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6 pt-24 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-600/10 border border-red-600/20 rounded-full text-sm text-red-400 font-bold mb-6">
            <Zap size={14} fill="currentColor" />
            Beginner Friendly
          </div>
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter mb-4">
            LEARN{" "}
            <span className="text-red-600 font-normal not-italic">F1</span>
          </h1>
          <p className="text-neutral-400 text-xl max-w-2xl leading-relaxed">
            New to Formula 1? Work through the modules then test yourself with
            60+ quiz questions across Drivers, Teams, Tracks, Rules and History.
          </p>
        </motion.div>

        {/* ── TAB SWITCHER ─────────────────────────────────────────────────────── */}
        <div className="mt-8 flex gap-2">
          {(["learn", "quiz"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black uppercase tracking-tighter text-sm transition-all ${
                activeTab === tab
                  ? "bg-white/10 text-white border border-white/20"
                  : "text-neutral-500 hover:text-neutral-300 border border-transparent"
              }`}
            >
              {tab === "learn" ? (
                <><BookOpen size={15} /> Learn Modules</>
              ) : (
                <><HelpCircle size={15} /> Quiz</>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── LEARN TAB ────────────────────────────────────────────────────────── */}
      {activeTab === "learn" && (
        <div className="max-w-4xl mx-auto px-6 pb-24">
          {/* Progress */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6 p-5 bg-white/5 border border-white/10 rounded-2xl"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-bold text-neutral-300">
                Progress: {completed.size} / {modules.length} modules
              </span>
              <span className="text-xs text-neutral-500">
                {completed.size === modules.length ? "🏆 All done!" : "Keep going!"}
              </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full"
                animate={{ width: `${(completed.size / modules.length) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {modules.map((m) => (
                <div
                  key={m.id}
                  className={`w-6 h-2 rounded-full transition-colors ${
                    completed.has(m.id) ? "bg-red-500" : "bg-white/10"
                  }`}
                />
              ))}
            </div>
          </motion.div>

          {/* Modules */}
          <div className="space-y-4">
            {modules.map((mod, index) => {
              const Icon = mod.icon;
              const isOpen = openModule === mod.id;
              const isDone = completed.has(mod.id);

              return (
                <motion.div
                  key={mod.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  className="bg-[#0a0a0f] border border-white/10 rounded-3xl overflow-hidden"
                >
                  <button
                    onClick={() => toggleModule(mod.id)}
                    className="w-full flex items-center gap-5 p-6 text-left group"
                  >
                    <div
                      className="p-3 rounded-2xl flex-shrink-0 transition-all duration-300"
                      style={{ backgroundColor: `${mod.color}20`, border: `1px solid ${mod.color}40` }}
                    >
                      <Icon size={22} style={{ color: mod.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-0.5">
                        <h2 className="font-black text-lg text-white group-hover:text-red-400 transition-colors">
                          {mod.title}
                        </h2>
                        {isDone && (
                          <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full font-bold flex-shrink-0">
                            ✓ Read
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-500">{mod.tagline}</p>
                    </div>
                    <div className="flex-shrink-0 text-neutral-500 group-hover:text-white transition-colors">
                      {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        key="body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div
                          className="px-6 pb-8"
                          style={{ borderTop: `1px solid ${mod.color}30` }}
                        >
                          <div className="pt-6">{mod.content}</div>
                          <button
                            onClick={() => {
                              setCompleted((prev) => new Set([...prev, mod.id]));
                              const currentIdx = modules.findIndex((m) => m.id === mod.id);
                              const next = modules[currentIdx + 1];
                              if (next) setOpenModule(next.id);
                              else setOpenModule(null);
                            }}
                            className="mt-8 w-full py-4 rounded-2xl font-black uppercase tracking-tighter text-sm transition-all"
                            style={{
                              backgroundColor: `${mod.color}20`,
                              border: `1px solid ${mod.color}50`,
                              color: mod.color,
                            }}
                          >
                            {modules.findIndex((m) => m.id === mod.id) < modules.length - 1
                              ? "Got it — next module →"
                              : "🏆 Complete!"}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}

            {completed.size === modules.length && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-red-600/20 to-red-900/10 border border-red-600/30 rounded-3xl p-10 text-center"
              >
                <div className="text-5xl mb-4">🏆</div>
                <h2 className="text-3xl font-black italic mb-2">You're an F1 Expert!</h2>
                <p className="text-neutral-400 mb-6">
                  You've completed all {modules.length} modules. Ready to test your knowledge?
                </p>
                <button
                  onClick={() => setActiveTab("quiz")}
                  className="inline-block bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-tighter text-sm transition-all"
                >
                  Take the Quiz →
                </button>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* ── QUIZ TAB ─────────────────────────────────────────────────────────── */}
      {activeTab === "quiz" && (
        <div className="max-w-4xl mx-auto px-6 pb-24">
          <AnimatePresence mode="wait">

            {/* ── IDLE: Settings ─────────────────────────────────────────────── */}
            {quizState === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                className="space-y-6"
              >
                {/* Category */}
                <div className="bg-[#0a0a0f] border border-white/10 rounded-3xl p-6">
                  <h3 className="font-black text-sm uppercase tracking-widest text-neutral-400 mb-4">
                    Category
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setCategory("all")}
                      className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                        category === "all"
                          ? "bg-white/15 border-white/30 text-white"
                          : "bg-white/5 border-white/10 text-neutral-400 hover:text-white"
                      }`}
                    >
                      All Categories
                    </button>
                    {(Object.entries(CATEGORY_META) as [Exclude<Category, "all">, typeof CATEGORY_META[keyof typeof CATEGORY_META]][]).map(([key, meta]) => (
                      <button
                        key={key}
                        onClick={() => setCategory(key)}
                        className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                          category === key
                            ? `${meta.bg} ${meta.border} ${meta.color}`
                            : "bg-white/5 border-white/10 text-neutral-400 hover:text-white"
                        }`}
                      >
                        {meta.emoji} {meta.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty */}
                <div className="bg-[#0a0a0f] border border-white/10 rounded-3xl p-6">
                  <h3 className="font-black text-sm uppercase tracking-widest text-neutral-400 mb-4">
                    Difficulty
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setDifficulty("all")}
                      className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                        difficulty === "all"
                          ? "bg-white/15 border-white/30 text-white"
                          : "bg-white/5 border-white/10 text-neutral-400 hover:text-white"
                      }`}
                    >
                      All Difficulties
                    </button>
                    {(Object.entries(DIFFICULTY_META) as [Exclude<Difficulty, "all">, typeof DIFFICULTY_META[keyof typeof DIFFICULTY_META]][]).map(([key, meta]) => (
                      <button
                        key={key}
                        onClick={() => setDifficulty(key)}
                        className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                          difficulty === key
                            ? `${meta.bg} ${meta.border} ${meta.color}`
                            : "bg-white/5 border-white/10 text-neutral-400 hover:text-white"
                        }`}
                      >
                        {meta.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Info + Start */}
                <div className="flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-2xl">
                  <div>
                    <p className="text-white font-bold">{availableCount} questions available</p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Up to {QUIZ_LENGTH} will be selected at random
                    </p>
                  </div>
                  <button
                    onClick={startQuiz}
                    disabled={availableCount === 0}
                    className="bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-7 py-3 rounded-2xl font-black uppercase tracking-tighter text-sm transition-all"
                  >
                    Start Quiz →
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── RUNNING: Question ──────────────────────────────────────────── */}
            {quizState === "running" && currentQuestion && (
              <motion.div
                key={`q-${currentIndex}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                {/* Progress bar */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-neutral-500 font-bold">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  <span className="text-sm text-white font-black">
                    Score: {score}/{currentIndex + (revealed ? 1 : 0)}
                  </span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full transition-all duration-300"
                    style={{ width: `${((currentIndex + (revealed ? 1 : 0)) / questions.length) * 100}%` }}
                  />
                </div>

                {/* Question card */}
                <div className="bg-[#0a0a0f] border border-white/10 rounded-3xl p-6 space-y-5">
                  {/* Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${CATEGORY_META[currentQuestion.category].bg} ${CATEGORY_META[currentQuestion.category].border} ${CATEGORY_META[currentQuestion.category].color}`}>
                      {CATEGORY_META[currentQuestion.category].emoji} {CATEGORY_META[currentQuestion.category].label}
                    </span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${DIFFICULTY_META[currentQuestion.difficulty].bg} ${DIFFICULTY_META[currentQuestion.difficulty].border} ${DIFFICULTY_META[currentQuestion.difficulty].color}`}>
                      {DIFFICULTY_META[currentQuestion.difficulty].label}
                    </span>
                  </div>

                  {/* Question */}
                  <h2 className="text-xl font-black text-white leading-snug">
                    {currentQuestion.question}
                  </h2>

                  {/* Options */}
                  <div className="space-y-3">
                    {currentQuestion.options.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleAnswer(option)}
                        disabled={revealed}
                        className={getOptionClass(option)}
                      >
                        <span className="flex items-center justify-between gap-3">
                          <span>{option}</span>
                          {revealed && option === currentQuestion.correct && (
                            <CheckCircle2 size={18} className="text-green-400 flex-shrink-0" />
                          )}
                          {revealed && option === selectedAnswer && option !== currentQuestion.correct && (
                            <span className="text-red-400 flex-shrink-0 text-lg leading-none">✕</span>
                          )}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Explanation */}
                  <AnimatePresence>
                    {revealed && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-2 border-t border-white/10">
                          <p className="text-xs font-bold uppercase text-neutral-500 tracking-widest mb-1.5">
                            {selectedAnswer === currentQuestion.correct ? "✅ Correct!" : "❌ Incorrect"}
                          </p>
                          <p className="text-sm text-neutral-300 leading-relaxed">
                            {currentQuestion.explanation}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Next button */}
                {revealed && (
                  <motion.button
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={handleNext}
                    className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase tracking-tighter text-sm transition-all"
                  >
                    {currentIndex + 1 >= questions.length ? "See Results →" : "Next Question →"}
                  </motion.button>
                )}
              </motion.div>
            )}

            {/* ── FINISHED: Results ──────────────────────────────────────────── */}
            {quizState === "finished" && (
              <motion.div
                key="finished"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                {/* Score card */}
                {(() => {
                  const grade = getGrade(score);
                  return (
                    <div className={`${grade.bg} border ${grade.border} rounded-3xl p-8 text-center`}>
                      <p className="text-5xl mb-3">{grade.emoji}</p>
                      <p className={`text-4xl font-black mb-1 ${grade.color}`}>
                        {score} / {questions.length}
                      </p>
                      <p className={`text-lg font-black uppercase tracking-tighter ${grade.color}`}>
                        {grade.label}
                      </p>
                      <p className="text-sm text-neutral-400 mt-2">
                        {score === questions.length
                          ? "Perfect score! You really know your F1."
                          : score >= 8
                          ? "Outstanding — you clearly follow F1 closely."
                          : score >= 6
                          ? "Solid effort — a few more races and you'll be an expert."
                          : score >= 4
                          ? "Good start! Keep reading the Learn modules."
                          : "Time to study! Work through the Learn modules first."}
                      </p>
                    </div>
                  );
                })()}

                {/* Answer breakdown */}
                <div className="bg-[#0a0a0f] border border-white/10 rounded-3xl p-6">
                  <h3 className="font-black text-sm uppercase tracking-widest text-neutral-400 mb-4">
                    Review
                  </h3>
                  <div className="space-y-3">
                    {questions.map((q, i) => (
                      <div
                        key={q.id}
                        className={`flex items-start gap-3 p-3 rounded-2xl border ${
                          answerLog[i]
                            ? "bg-green-500/10 border-green-500/20"
                            : "bg-red-500/10 border-red-500/20"
                        }`}
                      >
                        <span className={`flex-shrink-0 font-black text-sm mt-0.5 ${answerLog[i] ? "text-green-400" : "text-red-400"}`}>
                          {answerLog[i] ? "✓" : "✕"}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm text-neutral-300 leading-snug">{q.question}</p>
                          {!answerLog[i] && (
                            <p className="text-xs text-green-400 mt-1 font-bold">
                              Correct: {q.correct}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={startQuiz}
                    className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase tracking-tighter text-sm transition-all"
                  >
                    Play Again
                  </button>
                  <button
                    onClick={resetQuiz}
                    className="flex items-center gap-2 px-5 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 rounded-2xl font-black uppercase tracking-tighter text-sm transition-all"
                  >
                    <RotateCcw size={15} />
                    Settings
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
