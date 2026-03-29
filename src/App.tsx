import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Dumbbell,
  Footprints,
  Medal,
  PauseCircle,
  PlayCircle,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Shield,
  SkipForward,
  Sparkles,
  Target,
  Timer,
  Trash2,
  Trophy,
  Wind,
  X,
  Zap,
} from "lucide-react";

const cx = (...classes) => classes.filter(Boolean).join(" ");

const DRILLS = [
  { id: "shadow-6", type: "Footwork", category: "Court Movement", name: "Shadow 6-Point Pattern", difficulty: "Beginner", intensity: "Medium", mode: "time", timerSeconds: 45, sets: 3, desc: "Move from base to all six corners and recover with a split-step every rep.", cues: ["Stay low", "Push back to base", "No extra steps"] },
  { id: "rear-recovery", type: "Footwork", category: "Court Movement", name: "Rear-Court Recovery", difficulty: "Intermediate", intensity: "High", mode: "reps", timerSeconds: 40, sets: 3, reps: "6 / side", desc: "Move to rear corner, simulate an overhead, then scissor-recover to base.", cues: ["Turn hips", "Land balanced", "Recover fast"] },
  { id: "net-lunge", type: "Footwork", category: "Court Movement", name: "Net Lunge + Push Back", difficulty: "Beginner", intensity: "Medium", mode: "reps", timerSeconds: 40, sets: 3, reps: "8 / side", desc: "Lunge forward to the net, then explode back to base under control.", cues: ["Controlled knee drive", "Chest up", "Push through front leg"] },
  { id: "smash-combo", type: "Footwork", category: "Court Movement", name: "Smash Footwork Combo", difficulty: "Intermediate", intensity: "High", mode: "reps", timerSeconds: 35, sets: 3, reps: "5 / side", desc: "Move to the rear court, simulate a jump-smash, then recover immediately.", cues: ["Fast first step", "Quiet landing", "Recover right away"] },
  { id: "mirror", type: "Footwork", category: "Reaction", name: "Mirror / Reactive Drill", difficulty: "Intermediate", intensity: "High", mode: "time", timerSeconds: 30, sets: 4, desc: "React to a partner or random callouts and mirror the movement pattern.", cues: ["Stay ready", "Short steps", "Don’t cross feet carelessly"] },
  { id: "band-footwork", type: "Band", category: "Resistance", name: "Resistance-Band Footwork", difficulty: "Intermediate", intensity: "High", mode: "reps", timerSeconds: 45, sets: 3, reps: "6 / direction", desc: "Use flat-band tension for side steps, backward runs, or controlled lunges.", cues: ["Fight the pull", "Keep posture stable", "Move with intent"] },
  { id: "split-step-hops", type: "Footwork", category: "Court Movement", name: "Split-Step Hop Series", difficulty: "Beginner", intensity: "Medium", mode: "time", timerSeconds: 30, sets: 3, desc: "Practice timing the split-step and pushing into the first movement.", cues: ["Stay light", "Land ready", "Push instantly"] },
  { id: "lateral-shuffle", type: "Footwork", category: "Court Movement", name: "Lateral Shuffle Burst", difficulty: "Beginner", intensity: "Medium", mode: "time", timerSeconds: 20, sets: 4, desc: "Short side-to-side bursts for faster base recovery and cleaner hips.", cues: ["Stay square", "Don’t click heels", "Quick reset"] },
  { id: "reverse-chase", type: "Footwork", category: "Court Movement", name: "Backpedal to Turn Chase", difficulty: "Intermediate", intensity: "Medium", mode: "reps", timerSeconds: 30, sets: 3, reps: "5 / side", desc: "Backpedal, turn the hips, then chase the imaginary rear corner shot.", cues: ["Turn smoothly", "Stay balanced", "Recover to base"] },
  { id: "squats", type: "Strength", category: "Lower Body", name: "Squats", difficulty: "Beginner", intensity: "Medium", mode: "reps", timerSeconds: 50, sets: 3, reps: "8–12", desc: "Build lower-body strength for better push-off power and stability.", cues: ["Brace core", "Drive through midfoot", "Control the descent"] },
  { id: "lunges", type: "Strength", category: "Lower Body", name: "Multi-Directional Lunges", difficulty: "Beginner", intensity: "Medium", mode: "reps", timerSeconds: 50, sets: 3, reps: "8 / leg", desc: "Forward, reverse, and lateral lunges for badminton-specific leg strength.", cues: ["Stay tall", "Own the landing", "Push out of the floor"] },
  { id: "rdl", type: "Strength", category: "Lower Body", name: "Romanian Deadlift Pattern", difficulty: "Intermediate", intensity: "Medium", mode: "reps", timerSeconds: 50, sets: 3, reps: "8–12", desc: "Hip hinge work for hamstrings, glutes, and posterior chain power.", cues: ["Hips back", "Flat back", "Feel hamstrings load"] },
  { id: "pushups", type: "Strength", category: "Upper Body", name: "Push-Ups", difficulty: "Beginner", intensity: "Medium", mode: "reps", timerSeconds: 40, sets: 3, reps: "8–15", desc: "Upper-body pushing strength for overall athletic balance and power.", cues: ["Body straight", "Shoulders away from ears", "Full range when possible"] },
  { id: "rows", type: "Strength", category: "Upper Body", name: "Rows", difficulty: "Beginner", intensity: "Medium", mode: "reps", timerSeconds: 45, sets: 3, reps: "10–15", desc: "Back strength for posture, control, and shoulder support.", cues: ["Pull elbow back", "Don’t shrug", "Pause at the top"] },
  { id: "plyo-jumps", type: "Power", category: "Explosive", name: "Plyo Squat Jumps", difficulty: "Intermediate", intensity: "High", mode: "reps", timerSeconds: 30, sets: 3, reps: "6–8", desc: "Explosive lower-body work to improve first-step quickness and jump output.", cues: ["Land soft", "Reset between reps", "Explode upward"] },
  { id: "planks", type: "Core", category: "Core", name: "Planks + Side Planks", difficulty: "Beginner", intensity: "Low", mode: "time", timerSeconds: 45, sets: 3, desc: "Build trunk stiffness for balance, stability, and transfer of force.", cues: ["Ribs down", "Squeeze glutes", "No sagging"] },
  { id: "band-shoulders", type: "Band", category: "Upper Body", name: "Flat-Band Shoulder Stability", difficulty: "Beginner", intensity: "Low", mode: "reps", timerSeconds: 40, sets: 3, reps: "10–12", desc: "External rotations and Y-T-W raises for shoulder health and smash control.", cues: ["Slow and clean", "Don’t crank range", "Feel upper back working"] },
  { id: "single-leg-calf", type: "Strength", category: "Lower Body", name: "Single-Leg Calf Raises", difficulty: "Beginner", intensity: "Low", mode: "reps", timerSeconds: 35, sets: 3, reps: "12–18 / leg", desc: "Build ankle stiffness and lower-leg endurance for quicker push-offs.", cues: ["Full range", "Pause at top", "Control the drop"] },
  { id: "glute-bridge", type: "Strength", category: "Lower Body", name: "Glute Bridges", difficulty: "Beginner", intensity: "Low", mode: "reps", timerSeconds: 35, sets: 3, reps: "12–15", desc: "Train glute drive for better hip extension and more stable lunges.", cues: ["Squeeze glutes", "Don’t overarch", "Pause at top"] },
  { id: "dead-bug", type: "Core", category: "Core", name: "Dead Bug", difficulty: "Beginner", intensity: "Low", mode: "reps", timerSeconds: 35, sets: 3, reps: "8–10 / side", desc: "Core stability for cleaner force transfer and less trunk wobble.", cues: ["Lower back stays down", "Move slow", "Breathe"] },
  { id: "hollow-hold", type: "Core", category: "Core", name: "Hollow Hold", difficulty: "Intermediate", intensity: "Medium", mode: "time", timerSeconds: 25, sets: 3, desc: "Improve full-body tension and control for more stable movement.", cues: ["Flatten back", "Reach long", "Don’t flare ribs"] },
  { id: "band-pullapart", type: "Band", category: "Upper Body", name: "Band Pull-Aparts", difficulty: "Beginner", intensity: "Low", mode: "reps", timerSeconds: 30, sets: 3, reps: "12–20", desc: "Upper-back endurance for posture and shoulder control.", cues: ["Don’t shrug", "Pull evenly", "Stay smooth"] },
  { id: "split-squat", type: "Strength", category: "Lower Body", name: "Split Squats", difficulty: "Intermediate", intensity: "Medium", mode: "reps", timerSeconds: 45, sets: 3, reps: "8–10 / leg", desc: "Single-leg strength that transfers nicely to lunges and push-offs.", cues: ["Stay stacked", "Front foot stable", "Drive up hard"] },
  { id: "skater-hop", type: "Power", category: "Explosive", name: "Skater Hops", difficulty: "Intermediate", intensity: "High", mode: "reps", timerSeconds: 30, sets: 3, reps: "8 / side", desc: "Lateral explosive power for faster court pushes.", cues: ["Stick the landing", "Use arms", "Jump sideways cleanly"] },
  { id: "mountain-climber", type: "Conditioning", category: "Conditioning", name: "Mountain Climbers", difficulty: "Beginner", intensity: "Medium", mode: "time", timerSeconds: 25, sets: 3, desc: "Simple conditioning finisher for work capacity and trunk control.", cues: ["Stay braced", "Drive knees", "Keep hips steady"] },
];

const WEEK_PLAN = [
  { week: 1, title: "Foundation", duration: 45, maxExercises: 8, workSetsBonus: 0, workTimeScale: 1.0, restScale: 1.0, xpGoal: 300, focus: "Technique first. Keep sessions shorter, cleaner, and controlled." },
  { week: 2, title: "Volume Build", duration: 50, maxExercises: 8, workSetsBonus: 0, workTimeScale: 1.05, restScale: 0.95, xpGoal: 420, focus: "Slightly more work density. Same cap, better quality and consistency." },
  { week: 3, title: "Movement Upgrade", duration: 55, maxExercises: 9, workSetsBonus: 1, workTimeScale: 1.1, restScale: 0.9, xpGoal: 560, focus: "Add a little volume and more demanding footwork choices." },
  { week: 4, title: "Power Phase", duration: 60, maxExercises: 9, workSetsBonus: 1, workTimeScale: 1.15, restScale: 0.85, xpGoal: 720, focus: "More explosive work, stronger pushes, tighter recovery under fatigue." },
  { week: 5, title: "Sharpness", duration: 65, maxExercises: 10, workSetsBonus: 1, workTimeScale: 1.2, restScale: 0.8, xpGoal: 900, focus: "Heavier mix of speed and power, but still keep the movement clean." },
  { week: 6, title: "Peak Week", duration: 70, maxExercises: 10, workSetsBonus: 2, workTimeScale: 1.25, restScale: 0.75, xpGoal: 1100, focus: "Best mix of footwork, explosiveness, and repeatability." },
];

const DEFAULT_SESSION = ["shadow-6", "rear-recovery", "net-lunge", "squats", "lunges", "pushups"];
const INITIAL_LOGS = [];
const WARMUP_STEPS = [
  { id: "warm-1", label: "2 min light jog or marching", seconds: 120 },
  { id: "warm-2", label: "Arm swings and shoulder circles", seconds: 40 },
  { id: "warm-3", label: "Skips / butt kickers", seconds: 40 },
  { id: "warm-4", label: "Dynamic lunges and leg swings", seconds: 50 },
  { id: "warm-5", label: "Light band shoulder activation", seconds: 40 },
];
const COOLDOWN_STEPS = [
  { id: "cool-1", label: "2 min light walk or easy jog", seconds: 120 },
  { id: "cool-2", label: "Quads stretch", seconds: 30 },
  { id: "cool-3", label: "Hamstrings stretch", seconds: 30 },
  { id: "cool-4", label: "Calves stretch", seconds: 30 },
  { id: "cool-5", label: "Shoulders / forearms stretch", seconds: 30 },
];
const REST_RULES = { warmupTransition: 15, cooldownTransition: 15, timedSetRest: 20, repSetRest: 35, exerciseTransition: 45 };
const XP_PER_LEVEL = 250;
const MAX_LEVEL = 20;
const RANKS = ["Foundation Athlete", "Movement Builder", "Court Technician", "Performance Trainee", "Rally Specialist", "Footwork Operator", "Power Developer", "Match Engine", "Court Competitor", "Advanced Performer", "Precision Attacker", "Endurance Driver", "Movement Specialist", "Explosive Athlete", "Court Leader", "High-Performance Player", "Elite Developer", "Elite Performer", "Court Commander", "Peak Athlete"];
const ACHIEVEMENTS = [
  { name: "First Session", description: "Complete your first logged workout.", check: ({ logs }) => logs.length >= 1 },
  { name: "Volume Builder", description: "Log 10 sessions.", check: ({ logs }) => logs.length >= 10 },
  { name: "Week Crusher", description: "Hit a weekly XP goal.", check: ({ weekProgress }) => weekProgress >= 100 },
  { name: "Advanced Cycle", description: "Reach Week 6.", check: ({ week }) => week >= 6 },
  { name: "Level 10", description: "Reach Level 10.", check: ({ level }) => level >= 10 },
];

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
function formatTime(totalSeconds) { const mins = Math.floor(totalSeconds / 60); const secs = totalSeconds % 60; return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`; }
function displayPrescription(item, currentWeek) { const adjustedSets = item.sets + currentWeek.workSetsBonus; if (item.mode === "reps") return `${adjustedSets} x ${item.reps}`; const scaledTime = Math.round(item.timerSeconds * currentWeek.workTimeScale); return `${adjustedSets} x ${formatTime(scaledTime)}`; }
function getRank(level) { return RANKS[clamp(level - 1, 0, RANKS.length - 1)]; }
function getSessionSteps(chosenItems, currentWeek) {
  const steps = [];
  WARMUP_STEPS.forEach((step, index) => {
    steps.push({ id: step.id, label: step.label, seconds: step.seconds, kind: "Warm-Up", locked: true });
    if (index < WARMUP_STEPS.length - 1) {
      const restSeconds = Math.round(REST_RULES.warmupTransition * currentWeek.restScale);
      steps.push({ id: `${step.id}-rest`, label: "Transition Rest", seconds: restSeconds, kind: "Rest", locked: true, prescription: formatTime(restSeconds) });
    }
  });
  chosenItems.forEach((item, itemIndex) => {
    const totalSets = item.sets + currentWeek.workSetsBonus;
    const scaledTime = Math.round(item.timerSeconds * currentWeek.workTimeScale);
    for (let i = 0; i < totalSets; i += 1) {
      steps.push({ id: `${item.id}-${i + 1}`, label: `${item.name} · Set ${i + 1}`, seconds: item.mode === "time" ? scaledTime : 0, kind: item.mode === "time" ? "Timed Drill" : "Work Block", locked: item.mode === "time", prescription: item.mode === "reps" ? item.reps : formatTime(scaledTime) });
      if (i < totalSets - 1) {
        const baseRest = item.mode === "time" ? REST_RULES.timedSetRest : REST_RULES.repSetRest;
        const scaledRest = Math.round(baseRest * currentWeek.restScale);
        steps.push({ id: `${item.id}-${i + 1}-rest`, label: `${item.name} · Rest`, seconds: scaledRest, kind: "Rest", locked: true, prescription: formatTime(scaledRest) });
      }
    }
    if (itemIndex < chosenItems.length - 1) {
      const transitionSeconds = Math.round(REST_RULES.exerciseTransition * currentWeek.restScale);
      steps.push({ id: `${item.id}-transition`, label: "Exercise Transition", seconds: transitionSeconds, kind: "Rest", locked: true, prescription: formatTime(transitionSeconds) });
    }
  });
  COOLDOWN_STEPS.forEach((step, index) => {
    steps.push({ id: step.id, label: step.label, seconds: step.seconds, kind: "Cooldown", locked: true });
    if (index < COOLDOWN_STEPS.length - 1) {
      const restSeconds = Math.round(REST_RULES.cooldownTransition * currentWeek.restScale);
      steps.push({ id: `${step.id}-rest`, label: "Transition Rest", seconds: restSeconds, kind: "Rest", locked: true, prescription: formatTime(restSeconds) });
    }
  });
  return steps;
}

function runSanityChecks() {
  const repItem = DRILLS.find((d) => d.id === "squats");
  const timeItem = DRILLS.find((d) => d.id === "shadow-6");
  const weekOne = WEEK_PLAN[0];
  const weekSix = WEEK_PLAN[5];
  console.assert(repItem && timeItem, "Base drills should exist.");
  if (!repItem || !timeItem) return;
  console.assert(displayPrescription(repItem, weekOne) === "3 x 8–12", "Rep prescription should format sets x reps.");
  console.assert(displayPrescription(timeItem, weekOne) === "3 x 00:45", "Week 1 timed prescription should be 45 seconds.");
  console.assert(displayPrescription(timeItem, weekSix) === "5 x 00:56", "Week 6 timed prescription should scale sets and time.");
}
runSanityChecks();

function Card({ className = "", children }) { return <div className={cx("rounded-[28px] border border-slate-700 bg-slate-900 shadow-2xl", className)}>{children}</div>; }
function CardHeader({ className = "", children }) { return <div className={cx("p-6", className)}>{children}</div>; }
function CardContent({ className = "", children }) { return <div className={cx("px-6 pb-6", className)}>{children}</div>; }
function CardTitle({ className = "", children }) { return <div className={cx("font-semibold", className)}>{children}</div>; }
function CardDescription({ className = "", children }) { return <div className={cx("text-slate-300", className)}>{children}</div>; }
function Badge({ className = "", children }) { return <span className={cx("inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium", className)}>{children}</span>; }
function Button({ className = "", variant = "default", size = "default", children, ...props }) {
  const variants = {
    default: "bg-emerald-600 text-white hover:bg-emerald-500 border-transparent",
    secondary: "border border-slate-600 bg-slate-800 text-slate-50 hover:bg-slate-700",
    ghost: "border-transparent bg-transparent text-slate-200 hover:bg-slate-700 hover:text-white",
  };
  const sizes = { default: "h-11 px-4 py-2", sm: "h-9 px-3 py-2", icon: "h-10 w-10 p-0 justify-center" };
  return <button {...props} className={cx("inline-flex items-center justify-center gap-2 rounded-2xl text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50", variants[variant], sizes[size], className)}>{children}</button>;
}
function Input(props) { return <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input {...props} className={cx("h-11 w-full rounded-2xl border border-slate-600 bg-slate-800 pl-10 pr-4 text-white outline-none placeholder:text-slate-400 focus:border-emerald-500", props.className)} /></div>; }
function Progress({ value, className = "" }) { return <div className={cx("h-3 overflow-hidden rounded-full bg-slate-800", className)}><div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>; }
function Checkbox({ checked, onCheckedChange }) { return <button type="button" onClick={onCheckedChange} className={cx("flex h-5 w-5 items-center justify-center rounded-md border transition", checked ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-500 bg-slate-900 text-transparent")}><Check className="h-3.5 w-3.5" /></button>; }
function Tabs({ defaultValue, children, className = "" }) { const [value, setValue] = useState(defaultValue); const items = React.Children.map(children, (child) => React.isValidElement(child) ? React.cloneElement(child, { tabsValue: value, setTabsValue: setValue }) : child); return <div className={className}>{items}</div>; }
function TabsList({ children, tabsValue, setTabsValue, className = "" }) { const items = React.Children.map(children, (child) => React.isValidElement(child) ? React.cloneElement(child, { tabsValue, setTabsValue }) : child); return <div className={className}>{items}</div>; }
function TabsTrigger({ value, children, tabsValue, setTabsValue, className = "" }) { const active = tabsValue === value; return <button onClick={() => setTabsValue(value)} className={cx("rounded-2xl px-3 py-2 text-sm transition", active ? "bg-emerald-600 text-white" : "text-slate-300 hover:text-white", className)}>{children}</button>; }
function TabsContent({ value, children, tabsValue }) { return tabsValue === value ? <div>{children}</div> : null; }
function Select({ value, onValueChange, children }) { return <select value={value} onChange={(e) => onValueChange(e.target.value)} className="h-11 w-full rounded-2xl border border-slate-600 bg-slate-800 px-4 text-white outline-none focus:border-emerald-500">{children}</select>; }
function SelectItem({ value, children }) { return <option value={value}>{children}</option>; }
function SelectTrigger({ children, className = "" }) { return <div className={className}>{children}</div>; }
function SelectValue() { return null; }
function SelectContent({ children }) { return children; }
function Dialog({ open, onOpenChange, children }) { if (!open) return null; return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => onOpenChange(false)}>{children}</div>; }
function DialogContent({ className = "", children }) { return <div className={cx("w-full max-w-md rounded-[28px] border border-slate-700 bg-slate-950 text-slate-50 shadow-2xl", className)} onClick={(e) => e.stopPropagation()}>{children}</div>; }
function DialogHeader({ children }) { return <div className="border-b border-slate-800 p-6">{children}</div>; }
function DialogTitle({ className = "", children }) { return <div className={cx("text-lg font-semibold text-white", className)}>{children}</div>; }
function DialogDescription({ className = "", children }) { return <div className={cx("mt-1 text-sm text-slate-300", className)}>{children}</div>; }

export default function BadmintonTrainingApp() {
  const [week, setWeek] = useState(1);
  const [selected, setSelected] = useState(DEFAULT_SESSION);
  const [search, setSearch] = useState("");
  const [goal, setGoal] = useState("Footwork + Power");
  const [timerOpen, setTimerOpen] = useState(false);
  const [timerLabel, setTimerLabel] = useState("Interval Timer");
  const [secondsLeft, setSecondsLeft] = useState(45);
  const [timerStartValue, setTimerStartValue] = useState(45);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerLocked, setTimerLocked] = useState(true);
  const [logs, setLogs] = useState(() => {
  const saved = localStorage.getItem("badminton_logs");
  return saved ? JSON.parse(saved) : INITIAL_LOGS;
});
  useEffect(() => {
  localStorage.setItem("badminton_logs", JSON.stringify(logs));
}, [logs]);
  const [flowIndex, setFlowIndex] = useState(0);
  const [flowRunning, setFlowRunning] = useState(false);

  const currentWeek = WEEK_PLAN[week - 1];
  const totalXP = logs.reduce((sum, entry) => sum + entry.xp, 0);
  const rawLevel = Math.floor(totalXP / XP_PER_LEVEL) + 1;
  const level = clamp(rawLevel, 1, MAX_LEVEL);
  const xpIntoLevel = totalXP % XP_PER_LEVEL;
  const xpNeeded = XP_PER_LEVEL - xpIntoLevel;
  const xpBar = level >= MAX_LEVEL ? 100 : (xpIntoLevel / XP_PER_LEVEL) * 100;
  const weeklyXP = logs.reduce((sum, entry) => sum + entry.xp, 0);
  const weekProgress = clamp((weeklyXP / currentWeek.xpGoal) * 100, 0, 100);
  const rank = getRank(level);

  const filtered = useMemo(() => DRILLS.filter((item) => (`${item.name} ${item.type} ${item.category} ${item.desc}`).toLowerCase().includes(search.toLowerCase())), [search]);
  const chosenItems = useMemo(() => DRILLS.filter((item) => selected.includes(item.id)), [selected]);
  const sessionFlow = useMemo(() => getSessionSteps(chosenItems, currentWeek), [chosenItems, currentWeek]);
  const currentFlowStep = sessionFlow[flowIndex] ?? null;
  const nextFlowStepData = sessionFlow[flowIndex + 1] ?? null;
  const flowProgress = sessionFlow.length ? (Math.min(flowIndex + 1, sessionFlow.length) / sessionFlow.length) * 100 : 0;
  const totalEstimatedSeconds = useMemo(() => sessionFlow.reduce((sum, step) => sum + step.seconds, 0), [sessionFlow]);
  const safetyMessage = useMemo(() => {
    const hardCount = chosenItems.filter((item) => item.intensity === "High").length;
    if (selected.length > currentWeek.maxExercises) return `Too many exercises for Week ${week}. This week caps at ${currentWeek.maxExercises}.`;
    if (hardCount > 4) return "This session is heavy on high-intensity work. Consider a cleaner balance if recovery starts slipping.";
    return "Session balance looks good.";
  }, [chosenItems, currentWeek, selected.length, week]);

  useEffect(() => {
    if (!timerRunning) return;
    if (secondsLeft <= 0) { setTimerRunning(false); return; }
    const id = window.setInterval(() => setSecondsLeft((value) => value - 1), 1000);
    return () => window.clearInterval(id);
  }, [timerRunning, secondsLeft]);

  useEffect(() => {
    if (!flowRunning || !currentFlowStep) return;
    if (secondsLeft <= 0) {
      const isLast = flowIndex >= sessionFlow.length - 1;
      if (isLast) setFlowRunning(false);
      else {
        const nextIndex = flowIndex + 1;
        setFlowIndex(nextIndex);
        setSecondsLeft(sessionFlow[nextIndex].seconds);
        setTimerStartValue(sessionFlow[nextIndex].seconds);
      }
      return;
    }
    const id = window.setInterval(() => setSecondsLeft((value) => value - 1), 1000);
    return () => window.clearInterval(id);
  }, [flowRunning, secondsLeft, currentFlowStep, flowIndex, sessionFlow]);

  const openTimer = (label, seconds, locked = true) => { setTimerLabel(label); setSecondsLeft(seconds); setTimerStartValue(seconds); setTimerRunning(false); setTimerLocked(locked); setTimerOpen(true); };
  const resetFlow = () => { setFlowIndex(0); setFlowRunning(false); if (sessionFlow[0]) { setSecondsLeft(sessionFlow[0].seconds); setTimerStartValue(sessionFlow[0].seconds); } };
  const startFlowStep = (index = flowIndex) => { const step = sessionFlow[index]; if (!step) return; setFlowIndex(index); setSecondsLeft(step.seconds); setTimerStartValue(step.seconds); setFlowRunning(true); };
const nextFlowStep = () => {
  const nextIndex = flowIndex + 1;

  if (nextIndex >= sessionFlow.length) {
    completeSession();
    return;
  }

  setFlowIndex(nextIndex);

  const step = sessionFlow[nextIndex];
  if (step) {
    setSecondsLeft(step.seconds);
    setTimerStartValue(step.seconds);
  }

  setFlowRunning(false);
};
  const toggleItem = (id) => setSelected((prev) => prev.includes(id) ? prev.filter((value) => value !== id) : prev.length >= currentWeek.maxExercises ? prev : [...prev, id]);
  const smartTemplates = {
  "Footwork + Power": [
    "shadow-6",
    "smash-combo",
    "rear-recovery",
    "split-step-hops",
    "lateral-shuffle",
    "reverse-chase",
    "mirror",
    "squats",
    "lunges",
    "split-squat",
    "plyo-jumps",
    "skater-hop",
    "planks",
    "single-leg-calf",
    "mountain-climber"
  ],
  "Leg Day": [
    "squats",
    "lunges",
    "split-squat",
    "rdl",
    "glute-bridge",
    "single-leg-calf",
    "plyo-jumps",
    "skater-hop",
    "planks",
    "dead-bug",
    "hollow-hold"
  ],
  "Shoulder Safety": [
    "shadow-6",
    "net-lunge",
    "pushups",
    "rows",
    "band-shoulders",
    "band-pullapart",
    "planks",
    "dead-bug",
    "glute-bridge",
    "hollow-hold"
  ],
  "Speed & Reaction": [
    "split-step-hops",
    "mirror",
    "lateral-shuffle",
    "reverse-chase",
    "shadow-6",
    "rear-recovery",
    "smash-combo",
    "skater-hop",
    "mountain-climber",
    "plyo-jumps"
  ],
  "Core & Stability": [
    "planks",
    "dead-bug",
    "hollow-hold",
    "glute-bridge",
    "band-shoulders",
    "band-pullapart",
    "single-leg-calf",
    "rows",
    "pushups"
  ],
};
const addSmartSession = () => {
  const pool = [...(smartTemplates[goal] || smartTemplates["Footwork + Power"])];
  const currentSet = new Set(selected);

  const shuffled = pool.sort(() => Math.random() - 0.5);

  const differentFirst = [
    ...shuffled.filter((id) => !currentSet.has(id)),
    ...shuffled.filter((id) => currentSet.has(id)),
  ];

  const nextSelection = differentFirst.slice(0, currentWeek.maxExercises);

  setSelected(nextSelection);
  setFlowIndex(0);
  setFlowRunning(false);
};

  // fill remaining slots
  while (selectedItems.length < currentWeek.maxExercises) {
    const remaining = pool.filter(d => !selectedItems.includes(d));
    if (remaining.length === 0) break;
    selectedItems.push(remaining[Math.floor(Math.random() * remaining.length)]);
  }

  setSelected(selectedItems.map(d => d.id));
  setFlowIndex(0);
  setFlowRunning(false);
};

  const nextSelection = differentFirst.slice(0, currentWeek.maxExercises);

  setSelected(nextSelection);
  setFlowIndex(0);
  setFlowRunning(false);
};
  const completeSession = () => { const minutes = Math.max(currentWeek.duration, Math.round(totalEstimatedSeconds / 60)); const baseXP = selected.length * 18 + currentWeek.week * 14 + currentWeek.workSetsBonus * 10; const bonus = selected.length >= currentWeek.maxExercises ? 35 : 15; const earned = baseXP + bonus; const today = new Date().toISOString().slice(0, 10); setLogs((prev) => [{ date: today, session: `${goal} • Week ${week}`, minutes, xp: earned }, ...prev].slice(0, 20)); };
  const removeFromSession = (id) => { setSelected((prev) => prev.filter((value) => value !== id)); resetFlow(); };
  const resetEverything = () => { setWeek(1); setSelected(DEFAULT_SESSION); setGoal("Footwork + Power"); setSearch(""); setLogs(INITIAL_LOGS); setTimerRunning(false); setTimerOpen(false); setSecondsLeft(45); setTimerStartValue(45); setTimerLocked(true); setTimerLabel("Interval Timer"); setFlowIndex(0); setFlowRunning(false); };
  const achievements = ACHIEVEMENTS.map((achievement) => ({ ...achievement, unlocked: achievement.check({ logs, weekProgress, week, level }) }));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 max-w-md mx-auto">
      <div className="p-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="mb-8 grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
          <Card className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
            <CardHeader className="pb-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="border-slate-600 bg-slate-800 text-slate-50">Performance Dashboard</Badge>
                <Badge className="border-emerald-500/40 bg-emerald-500/15 text-emerald-100">{rank}</Badge>
                <Badge className="border-blue-500/30 bg-blue-500/15 text-blue-100">Level {level}</Badge>
              </div>
              <CardTitle className="mt-3 text-3xl leading-tight text-white md:text-5xl">Badminton Performance Planner</CardTitle>
              <CardDescription className="max-w-2xl text-base leading-relaxed text-slate-200">A structured training system for footwork, power, stability, and weekly progression with session building, guided flow, logging, and performance tracking.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-3">
                <StatCard icon={<Trophy className="h-5 w-5" />} label="Total XP" value={`${totalXP}`} />
                <StatCard icon={<CalendarDays className="h-5 w-5" />} label="Current Week" value={`Week ${week}`} />
                <StatCard icon={<Clock3 className="h-5 w-5" />} label="Est. Session" value={`${Math.round(totalEstimatedSeconds / 60)} min`} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-white">Progress Overview</CardTitle>
              <CardDescription className="text-slate-200">Week {week}: {currentWeek.title}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-200"><span>Level Progress</span><span>{level >= MAX_LEVEL ? `${XP_PER_LEVEL}/${XP_PER_LEVEL}` : `${xpIntoLevel}/${XP_PER_LEVEL}`}</span></div>
                <Progress value={xpBar} />
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-800/80 p-4 text-sm text-slate-100">
                <div className="font-semibold text-white">Week Settings</div>
                <p className="mt-1 leading-relaxed text-slate-200">{currentWeek.focus}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge className="border-slate-600 bg-slate-900 text-slate-50">{currentWeek.duration} min target</Badge>
                  <Badge className="border-slate-600 bg-slate-900 text-slate-50">{currentWeek.maxExercises} exercise max</Badge>
                  <Badge className="border-slate-600 bg-slate-900 text-slate-50">+{currentWeek.workSetsBonus} set scaling</Badge>
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-200"><span>Weekly XP Goal</span><span>{weeklyXP}/{currentWeek.xpGoal}</span></div>
                <Progress value={weekProgress} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="secondary" onClick={() => setWeek((value) => clamp(value - 1, 1, 6))}>Previous</Button>
                <Button onClick={() => setWeek(1)}>Week 1</Button>
                <Button variant="secondary" onClick={() => setWeek((value) => clamp(value + 1, 1, 6))}>Next</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Tabs defaultValue="build" className="space-y-6">
  <TabsList className="grid w-full grid-cols-6 rounded-2xl border border-slate-700 bg-slate-900 p-1">
    <TabsTrigger value="build">Build</TabsTrigger>
    <TabsTrigger value="session">Session</TabsTrigger>
    <TabsTrigger value="flow">Guided Flow</TabsTrigger>
    <TabsTrigger value="plan">Plan</TabsTrigger>
    <TabsTrigger value="log">Log</TabsTrigger>
    <TabsTrigger value="progress">Progress</TabsTrigger>
  </TabsList>

          <TabsContent value="build">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <CardTitle className="text-2xl text-white">Exercise Library</CardTitle>
                      <CardDescription className="text-slate-200">Use Smart Build for quick sessions or customize manually within the current week cap.</CardDescription>
                    </div>
                    <div className="flex flex-col gap-3 md:flex-row md:flex-wrap">
                      <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search exercises..." className="md:w-56" />
                      <Select value={goal} onValueChange={setGoal}>
                        <SelectItem value="Footwork + Power">Footwork + Power</SelectItem>
                        <SelectItem value="Leg Day">Leg Strength</SelectItem>
                        <SelectItem value="Shoulder Safety">Shoulder Stability</SelectItem>
                        <SelectItem value="Speed & Reaction">Speed & Reaction</SelectItem>
                        <SelectItem value="Core & Stability">Core & Stability</SelectItem>
                      </Select>
                      <Button onClick={addSmartSession}><Sparkles className="h-4 w-4" /> Smart Build</Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {filtered.map((item) => {
                      const active = selected.includes(item.id);
                      const blocked = !active && selected.length >= currentWeek.maxExercises;
                      const scaledTime = Math.round(item.timerSeconds * currentWeek.workTimeScale);
                      return (
                        <motion.div key={item.id} layout>
                          <Card className={cx(active ? "border-emerald-500 bg-emerald-500/10" : "bg-slate-800/80", blocked && "opacity-60")}>
                            <CardContent className="p-5">
                              <div className="mb-3 flex items-start justify-between gap-3">
                                <div>
                                  <div className="mb-2 flex flex-wrap gap-2">
                                    <Badge className="border-slate-600 bg-slate-700 text-slate-50">{item.type}</Badge>
                                    <Badge className="border-slate-600 bg-slate-700 text-slate-50">{item.intensity}</Badge>
                                    <Badge className="border-slate-600 bg-slate-700 text-slate-50">{item.category}</Badge>
                                  </div>
                                  <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                                  <p className="mt-1 text-sm leading-relaxed text-slate-200">{item.desc}</p>
                                </div>
                                <Checkbox checked={active} onCheckedChange={() => toggleItem(item.id)} />
                              </div>
                              <div className="mb-4 rounded-2xl border border-slate-600 bg-slate-900/80 px-3 py-3 text-sm text-slate-100">
                                <div className="flex items-center justify-between gap-3">
                                  <span>Week {week}: {displayPrescription(item, currentWeek)}</span>
                                  {item.mode === "time" ? (
                                    <Button size="sm" variant="secondary" className="rounded-xl" onClick={() => openTimer(item.name, scaledTime, true)}><Timer className="h-4 w-4" /> {formatTime(scaledTime)}</Button>
                                  ) : <Badge className="border-blue-500/30 bg-blue-500/15 text-blue-100">Reps / Sets</Badge>}
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {item.cues.map((cue) => <span key={cue} className="rounded-full border border-slate-600 bg-slate-900 px-3 py-1 text-xs text-slate-100">{cue}</span>)}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="session">
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl text-white">Session Overview</CardTitle>
        <CardDescription className="text-slate-200">
          A cleaner, more professional session view with separate warm-up, work, and cooldown sections.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="rounded-2xl border border-slate-700 bg-slate-800/80 p-4">
          <div className="mb-2 flex items-center gap-2 text-slate-50">
            <Shield className="h-4 w-4" /> Session check
          </div>
          <p className={cx(
            "text-sm leading-relaxed",
            safetyMessage.includes("good") ? "text-emerald-300" : "text-amber-300"
          )}>
            {safetyMessage}
          </p>
        </div>

        <SectionCard
          icon={<Zap className="h-4 w-4" />}
          title="Warm-Up"
          subtitle="Preparation sequence"
        >
          {WARMUP_STEPS.map((step) => (
            <TimerRow
              key={step.id}
              label={step.label}
              timeLabel={formatTime(step.seconds)}
              onStart={() => openTimer(step.label, step.seconds, true)}
            />
          ))}
        </SectionCard>

        <SectionCard
          icon={<Target className="h-4 w-4" />}
          title="Main Work"
          subtitle={`Selected exercises: ${selected.length} / ${currentWeek.maxExercises}`}
          right={
            <Badge className="border-emerald-500/30 bg-emerald-500/15 text-emerald-100">
              {Math.round(
                chosenItems.reduce(
                  (sum, item) =>
                    sum +
                    Math.round(item.timerSeconds * currentWeek.workTimeScale) *
                      (item.sets + currentWeek.workSetsBonus),
                  0
                ) / 60
              )}{" "}
              min
            </Badge>
          }
        >
          <div className="space-y-2">
            {chosenItems.map((item) => {
              const scaledTime = Math.round(
                item.timerSeconds * currentWeek.workTimeScale
              );

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-slate-700 bg-slate-800/80 px-4 py-3"
                >
                  <div>
                    <div className="font-medium text-white">{item.name}</div>
                    <div className="text-sm text-slate-200">
                      {displayPrescription(item, currentWeek)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.mode === "time" ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="rounded-xl"
                        onClick={() =>
                          openTimer(item.name, scaledTime, true)
                        }
                      >
                        <Timer className="h-4 w-4" />{" "}
                        {formatTime(scaledTime)}
                      </Button>
                    ) : (
                      <Badge className="border-slate-600 bg-slate-900 text-slate-50">
                        Reps
                      </Badge>
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-xl"
                      onClick={() => removeFromSession(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard
          icon={<Wind className="h-4 w-4" />}
          title="Cooldown"
          subtitle="Recovery sequence"
        >
          {COOLDOWN_STEPS.map((step) => (
            <TimerRow
              key={step.id}
              label={step.label}
              timeLabel={formatTime(step.seconds)}
              onStart={() => openTimer(step.label, step.seconds, true)}
            />
          ))}
        </SectionCard>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="secondary"
            onClick={() => openTimer("Quick Timer", 45, false)}
          >
            <Timer className="h-4 w-4" /> Quick Timer
          </Button>

          <Button onClick={completeSession}>
            <Plus className="h-4 w-4" /> Complete Session
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</TabsContent>

          <TabsContent value="flow">
            <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl text-white">Guided Workout Flow</CardTitle>
                  <CardDescription className="text-slate-200">A cleaner follow-along view with built-in rest blocks and automatic step progression.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div><div className="mb-2 flex items-center justify-between text-sm text-slate-200"><span>Session Progress</span><span>{Math.min(flowIndex + 1, sessionFlow.length)}/{sessionFlow.length || 0}</span></div><Progress value={flowProgress} /></div>
                  <AnimatePresence mode="wait">
                    <motion.div key={currentFlowStep?.id || "empty"} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="rounded-3xl border border-slate-700 bg-slate-800/80 p-5">
                      <div className="text-sm text-slate-200">Current Step</div>
                      <div className="mt-1 text-2xl font-bold text-white">{currentFlowStep ? currentFlowStep.label : "No session steps loaded"}</div>
                      {currentFlowStep && <div className="mt-3 flex flex-wrap gap-2"><Badge className={cx(currentFlowStep.kind === "Rest" ? "border-blue-500/30 bg-blue-500/15 text-blue-100" : "border-slate-600 bg-slate-900 text-slate-50")}>{currentFlowStep.kind}</Badge><Badge className="border-slate-600 bg-slate-900 text-slate-50">{currentFlowStep.kind === "Work Block" ? currentFlowStep.prescription : formatTime(currentFlowStep.seconds)}</Badge></div>}
                      <div className="mt-4 rounded-3xl border border-slate-700 bg-slate-950 p-6 text-center">
  {currentFlowStep?.kind === "Work Block" ? (
    <div className="space-y-4">
      <div className="text-3xl font-bold text-white">{currentFlowStep.prescription}</div>
      <Button onClick={() => {
  setFlowRunning(false);
  nextFlowStep();
}}>
  Complete Set
</Button>
    </div>
  ) : (
    <div className="text-6xl font-bold text-white">{formatTime(secondsLeft)}</div>
  )}
</div>
                    </motion.div>
                  </AnimatePresence>
                  <div className="rounded-3xl border border-slate-700 bg-slate-800/60 p-4"><div className="text-sm text-slate-200">Up Next</div><div className="mt-1 text-lg font-semibold text-white">{nextFlowStepData ? nextFlowStepData.label : "Session complete"}</div><div className="mt-1 text-sm text-slate-300">{nextFlowStepData ? nextFlowStepData.kind : "Nice. You cooked."}</div></div>
                  <div className="grid grid-cols-4 gap-3"><Button onClick={() => startFlowStep(flowIndex)}><PlayCircle className="h-4 w-4" /> Start</Button><Button variant="secondary" onClick={() => setFlowRunning(false)}><PauseCircle className="h-4 w-4" /> Pause</Button><Button variant="secondary" onClick={nextFlowStep}><SkipForward className="h-4 w-4" /> Skip</Button><Button variant="secondary" onClick={resetFlow}><RefreshCw className="h-4 w-4" /> Reset</Button></div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl text-white">Session Queue</CardTitle>
                  <CardDescription className="text-slate-200">Includes warm-up, main work, rest intervals, exercise transitions, and cooldown.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[720px] overflow-y-auto pr-1">
                    {sessionFlow.map((step, index) => <button key={step.id} onClick={() => { setFlowIndex(index); setSecondsLeft(step.seconds); setTimerStartValue(step.seconds); setFlowRunning(false); }} className={cx("w-full rounded-2xl border px-4 py-3 text-left transition", index === flowIndex ? "border-emerald-500 bg-emerald-500/10" : step.kind === "Rest" ? "border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10" : "border-slate-700 bg-slate-800/80 hover:bg-slate-800")}><div className="flex items-center justify-between gap-3"><div><div className="font-medium text-white">{step.label}</div><div className="text-sm text-slate-200">{step.kind}</div></div><div className="flex items-center gap-2"><Badge className={cx(step.kind === "Rest" ? "border-blue-500/30 bg-blue-500/15 text-blue-100" : "border-slate-600 bg-slate-900 text-slate-50")}>{step.kind === "Work Block" ? step.prescription : formatTime(step.seconds)}</Badge>{index === flowIndex && <ChevronRight className="h-4 w-4 text-emerald-300" />}</div></div></button>)}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="plan">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {WEEK_PLAN.map((item) => <Card key={item.week} className={cx(week === item.week && "border-emerald-500 bg-emerald-500/10")}><CardHeader><CardTitle className="flex items-center justify-between text-xl text-white"><span>Week {item.week}</span><Badge className="border-slate-600 bg-slate-800 text-slate-50">{item.duration} min</Badge></CardTitle><CardDescription className="text-slate-200">{item.title}</CardDescription></CardHeader><CardContent><p className="mb-4 text-sm leading-relaxed text-slate-200">{item.focus}</p><div className="space-y-2 text-sm text-slate-300"><div>XP Goal: {item.xpGoal}</div><div>Exercise Max: {item.maxExercises}</div><div>Extra Set Scaling: +{item.workSetsBonus}</div></div><Button className="mt-4 w-full" variant="secondary" onClick={() => setWeek(item.week)}>Select Week</Button></CardContent></Card>)}
            </div>
          </TabsContent>

          <TabsContent value="log">
            <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
              <Card><CardHeader><CardTitle className="text-2xl text-white">Training Summary</CardTitle><CardDescription className="text-slate-200">Session history, current status, and reset controls.</CardDescription></CardHeader><CardContent className="space-y-4"><StatRow icon={<Footprints className="h-4 w-4" />} label="Sessions Logged" value={`${logs.length}`} /><StatRow icon={<Medal className="h-4 w-4" />} label="Current Rank" value={rank} /><StatRow icon={<Dumbbell className="h-4 w-4" />} label="Current Level" value={`${level}`} /><StatRow icon={<Timer className="h-4 w-4" />} label="Avg Session" value={`${Math.round(logs.reduce((sum, entry) => sum + entry.minutes, 0) / Math.max(logs.length, 1))} min`} /><Button className="w-full border border-red-500/30 bg-red-500/15 text-red-100 hover:bg-red-500/25" onClick={resetEverything}><RotateCcw className="h-4 w-4" /> Full Reset</Button></CardContent></Card>
              <Card><CardHeader><CardTitle className="text-2xl text-white">Workout Log</CardTitle><CardDescription className="text-slate-200">Completed sessions with time and earned XP.</CardDescription></CardHeader><CardContent><div className="space-y-3">{logs.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-800/40 p-6 text-center text-slate-300">No workouts logged yet.</div> : logs.map((log, idx) => <div key={`${log.date}-${idx}`} className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-700 bg-slate-800/80 p-4 md:flex-row md:items-center"><div><div className="font-medium text-white">{log.session}</div><div className="text-sm text-slate-200">{log.date}</div></div><div className="flex gap-2"><Badge className="border-slate-600 bg-slate-900 text-slate-50">{log.minutes} min</Badge><Badge className="border-emerald-500/30 bg-emerald-500/15 text-emerald-100">+{log.xp} XP</Badge></div></div>)}</div></CardContent></Card>
            </div>
          </TabsContent>

          <TabsContent value="progress">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card><CardHeader><CardTitle className="text-2xl text-white">Performance Progress</CardTitle><CardDescription className="text-slate-200">Clean rank progression, level tracking, and weekly targets.</CardDescription></CardHeader><CardContent className="space-y-5"><div className="rounded-3xl border border-slate-700 bg-slate-800/80 p-5"><div className="text-sm text-slate-200">Current Rank</div><div className="mt-1 text-3xl font-bold text-white">{rank}</div><div className="mt-4 text-sm text-slate-200">Level</div><div className="mt-1 text-xl font-semibold text-blue-100">{level}</div><div className="mt-3 text-sm text-slate-100">{totalXP} XP total</div></div><div><div className="mb-2 flex items-center justify-between text-sm text-slate-200"><span>Next Level</span><span>{level >= MAX_LEVEL ? "MAX" : `${xpNeeded} XP remaining`}</span></div><Progress value={xpBar} /></div><div><div className="mb-2 flex items-center justify-between text-sm text-slate-200"><span>Weekly Target</span><span>{weeklyXP}/{currentWeek.xpGoal}</span></div><Progress value={weekProgress} /></div></CardContent></Card>
              <Card><CardHeader><CardTitle className="text-2xl text-white">Achievements</CardTitle><CardDescription className="text-slate-200">A professional achievement system tied to real progress.</CardDescription></CardHeader><CardContent className="grid gap-3">{achievements.map((achievement) => <div key={achievement.name} className={cx("rounded-2xl border p-4", achievement.unlocked ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100" : "border-slate-700 bg-slate-800/80 text-slate-200")}><div className="flex items-center gap-2 font-medium text-white"><CheckCircle2 className="h-4 w-4" /> {achievement.name}</div><div className="mt-1 text-sm">{achievement.description}</div><div className="mt-2 text-xs uppercase tracking-wide">{achievement.unlocked ? "Unlocked" : "Locked"}</div></div>)}</CardContent></Card>
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={timerOpen} onOpenChange={setTimerOpen}>
          <DialogContent>
            <DialogHeader>
              <div className="flex items-start justify-between gap-4"><div><DialogTitle>{timerLabel}</DialogTitle><DialogDescription>{timerLocked ? "Locked to the selected exercise or session step." : "Custom timer mode."}</DialogDescription></div><button className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white" onClick={() => setTimerOpen(false)}><X className="h-4 w-4" /></button></div>
            </DialogHeader>
            <div className="space-y-6 p-6">
              <div className="rounded-3xl border border-slate-700 bg-slate-900 p-6 text-center text-6xl font-bold tracking-tight text-white">{formatTime(secondsLeft)}</div>
              {!timerLocked && <div className="grid grid-cols-3 gap-3"><Button variant="secondary" onClick={() => { setSecondsLeft(30); setTimerStartValue(30); setTimerRunning(false); }}>30s</Button><Button variant="secondary" onClick={() => { setSecondsLeft(45); setTimerStartValue(45); setTimerRunning(false); }}>45s</Button><Button variant="secondary" onClick={() => { setSecondsLeft(60); setTimerStartValue(60); setTimerRunning(false); }}>60s</Button></div>}
              <div className="grid grid-cols-3 gap-3"><Button onClick={() => setTimerRunning(true)}>Start</Button><Button variant="secondary" onClick={() => setTimerRunning(false)}>Pause</Button><Button variant="secondary" onClick={() => { setTimerRunning(false); setSecondsLeft(timerStartValue); }}>Reset</Button></div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function SectionCard({ icon, title, subtitle, right, children }) {
  return <div className="rounded-3xl border border-slate-700 bg-slate-950/70 p-4"><div className="mb-3 flex items-start justify-between gap-3"><div><div className="flex items-center gap-2 text-sm font-semibold text-white">{icon}{title}</div><div className="mt-1 text-sm text-slate-200">{subtitle}</div></div>{right}</div>{children}</div>;
}
function TimerRow({ label, timeLabel, onStart }) { return <div className="mb-2 flex items-center justify-between gap-3 rounded-2xl border border-slate-700 bg-slate-800/80 px-4 py-3"><div className="text-sm text-white">{label}</div><Button size="sm" variant="secondary" className="rounded-xl" onClick={onStart}><Timer className="h-4 w-4" /> {timeLabel}</Button></div>; }
function StatCard({ icon, label, value }) { return <div className="rounded-3xl border border-slate-700 bg-slate-800/80 p-4"><div className="mb-2 flex items-center gap-2 text-slate-100">{icon}<span className="text-sm">{label}</span></div><div className="text-2xl font-bold text-white">{value}</div></div>; }
function StatRow({ icon, label, value }) { return <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-700 bg-slate-800/80 p-4"><div className="flex items-center gap-2 text-slate-100">{icon}<span>{label}</span></div><div className="text-right font-semibold text-white">{value}</div></div>; }
