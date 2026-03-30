import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Dumbbell,
  Flame,
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
  Star,
  Target,
  Timer,
  Trash2,
  Trophy,
  Volume2,
  VolumeX,
  Wind,
  X,
  Zap,
} from "lucide-react";

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

type Drill = {
  id: string;
  type: string;
  category: string;
  name: string;
  difficulty: string;
  intensity: string;
  mode: "time" | "reps";
  timerSeconds: number;
  sets: number;
  reps?: string;
  desc: string;
  cues: string[];
};

type WeekPlan = {
  week: number;
  title: string;
  duration: number;
  maxExercises: number;
  workSetsBonus: number;
  workTimeScale: number;
  restScale: number;
  xpGoal: number;
  focus: string;
};

type SessionLog = {
  date: string;
  session: string;
  minutes: number;
  xp: number;
};

type FlowStep = {
  id: string;
  label: string;
  seconds: number;
  kind: "Warm-Up" | "Timed Drill" | "Work Block" | "Rest" | "Cooldown";
  locked: boolean;
  prescription?: string;
  drillId: string | null;
  setNumber?: number;
};

const DRILLS: Drill[] = [
  { id: "shadow-6", type: "Footwork", category: "Court Movement", name: "Shadow 6-Point Pattern", difficulty: "Beginner", intensity: "Medium", mode: "time", timerSeconds: 45, sets: 3, desc: "Move from base to all six corners and recover with a split-step every rep.", cues: ["Stay low", "Push back to base", "No extra steps"] },
  { id: "rear-recovery", type: "Footwork", category: "Court Movement", name: "Rear-Court Recovery", difficulty: "Intermediate", intensity: "High", mode: "reps", timerSeconds: 40, sets: 3, reps: "6 / side", desc: "Move to rear corner, simulate an overhead, then scissor-recover to base.", cues: ["Turn hips", "Land balanced", "Recover fast"] },
  { id: "net-lunge", type: "Footwork", category: "Court Movement", name: "Net Lunge + Push Back", difficulty: "Beginner", intensity: "Medium", mode: "reps", timerSeconds: 40, sets: 3, reps: "8 / side", desc: "Lunge forward to the net, then explode back to base under control.", cues: ["Controlled knee drive", "Chest up", "Push through front leg"] },
  { id: "smash-combo", type: "Footwork", category: "Court Movement", name: "Smash Footwork Combo", difficulty: "Intermediate", intensity: "High", mode: "reps", timerSeconds: 35, sets: 3, reps: "5 / side", desc: "Move to the rear court, simulate a jump-smash, then recover immediately.", cues: ["Fast first step", "Quiet landing", "Recover right away"] },
  { id: "mirror", type: "Footwork", category: "Reaction", name: "Mirror / Reactive Drill", difficulty: "Intermediate", intensity: "High", mode: "time", timerSeconds: 30, sets: 4, desc: "React to a partner or random callouts and mirror the movement pattern.", cues: ["Stay ready", "Short steps", "Don’t cross feet carelessly"] },
  { id: "split-step-hops", type: "Footwork", category: "Court Movement", name: "Split-Step Hop Series", difficulty: "Beginner", intensity: "Medium", mode: "time", timerSeconds: 30, sets: 3, desc: "Practice timing the split-step and pushing into the first movement.", cues: ["Stay light", "Land ready", "Push instantly"] },
  { id: "lateral-shuffle", type: "Footwork", category: "Court Movement", name: "Lateral Shuffle Burst", difficulty: "Beginner", intensity: "Medium", mode: "time", timerSeconds: 20, sets: 4, desc: "Short side-to-side bursts for faster base recovery and cleaner hips.", cues: ["Stay square", "Don’t click heels", "Quick reset"] },
  { id: "reverse-chase", type: "Footwork", category: "Court Movement", name: "Backpedal to Turn Chase", difficulty: "Intermediate", intensity: "Medium", mode: "reps", timerSeconds: 30, sets: 3, reps: "5 / side", desc: "Backpedal, turn the hips, then chase the imaginary rear corner shot.", cues: ["Turn smoothly", "Stay balanced", "Recover to base"] },
  { id: "scissor-kick", type: "Footwork", category: "Court Movement", name: "Scissor Kick Recovery", difficulty: "Intermediate", intensity: "High", mode: "time", timerSeconds: 30, sets: 3, desc: "Rear court scissor kick into fast recovery to base.", cues: ["Rotate hips", "Land balanced", "Recover fast"] },
  { id: "net-kill-shadow", type: "Footwork", category: "Court Movement", name: "Net Kill Shadow", difficulty: "Beginner", intensity: "Medium", mode: "time", timerSeconds: 25, sets: 3, desc: "Quick front court kill movement with recovery.", cues: ["Stay low", "Explode forward", "Recover quick"] },
  { id: "split-step-recover", type: "Footwork", category: "Court Movement", name: "Split Step + Recover", difficulty: "Beginner", intensity: "Medium", mode: "time", timerSeconds: 25, sets: 3, desc: "Split step into quick recoveries back to base with clean posture.", cues: ["Soft landing", "Recover sharp", "Stay balanced"] },
  { id: "front-back-burst", type: "Footwork", category: "Court Movement", name: "Front-Back Burst", difficulty: "Intermediate", intensity: "High", mode: "time", timerSeconds: 25, sets: 3, desc: "Explode from front court to rear court movement patterns without drifting.", cues: ["Push hard", "Stay low", "Recover center"] },
  { id: "cross-step-drive", type: "Footwork", category: "Court Movement", name: "Cross-Step Drive", difficulty: "Intermediate", intensity: "Medium", mode: "reps", timerSeconds: 35, sets: 3, reps: "6 / side", desc: "Train cross-step mechanics for fast rear-court coverage and smoother transitions.", cues: ["Open hips", "Drive clean", "Recover fast"] },
  { id: "squats", type: "Strength", category: "Lower Body", name: "Squats", difficulty: "Beginner", intensity: "Medium", mode: "reps", timerSeconds: 50, sets: 3, reps: "8–12", desc: "Build lower-body strength for better push-off power and stability.", cues: ["Brace core", "Drive through midfoot", "Control the descent"] },
  { id: "lunges", type: "Strength", category: "Lower Body", name: "Multi-Directional Lunges", difficulty: "Beginner", intensity: "Medium", mode: "reps", timerSeconds: 50, sets: 3, reps: "8 / leg", desc: "Forward, reverse, and lateral lunges for badminton-specific leg strength.", cues: ["Stay tall", "Own the landing", "Push out of the floor"] },
  { id: "rdl", type: "Strength", category: "Lower Body", name: "Romanian Deadlift Pattern", difficulty: "Intermediate", intensity: "Medium", mode: "reps", timerSeconds: 50, sets: 3, reps: "8–12", desc: "Hip hinge work for hamstrings, glutes, and posterior chain power.", cues: ["Hips back", "Flat back", "Feel hamstrings load"] },
  { id: "pushups", type: "Strength", category: "Upper Body", name: "Push-Ups", difficulty: "Beginner", intensity: "Medium", mode: "reps", timerSeconds: 40, sets: 3, reps: "8–15", desc: "Upper-body pushing strength for overall athletic balance and power.", cues: ["Body straight", "Shoulders away from ears", "Full range when possible"] },
  { id: "rows", type: "Strength", category: "Upper Body", name: "Rows", difficulty: "Beginner", intensity: "Medium", mode: "reps", timerSeconds: 45, sets: 3, reps: "10–15", desc: "Back strength for posture, control, and shoulder support.", cues: ["Pull elbow back", "Don’t shrug", "Pause at the top"] },
  { id: "plyo-jumps", type: "Power", category: "Explosive", name: "Plyo Squat Jumps", difficulty: "Intermediate", intensity: "High", mode: "reps", timerSeconds: 30, sets: 3, reps: "6–8", desc: "Explosive lower-body work to improve first-step quickness and jump output.", cues: ["Land soft", "Reset between reps", "Explode upward"] },
  { id: "single-leg-calf", type: "Strength", category: "Lower Body", name: "Single-Leg Calf Raises", difficulty: "Beginner", intensity: "Low", mode: "reps", timerSeconds: 35, sets: 3, reps: "12–18 / leg", desc: "Build ankle stiffness and lower-leg endurance for quicker push-offs.", cues: ["Full range", "Pause at top", "Control the drop"] },
  { id: "glute-bridge", type: "Strength", category: "Lower Body", name: "Glute Bridges", difficulty: "Beginner", intensity: "Low", mode: "reps", timerSeconds: 35, sets: 3, reps: "12–15", desc: "Train glute drive for better hip extension and more stable lunges.", cues: ["Squeeze glutes", "Don’t overarch", "Pause at top"] },
  { id: "split-squat", type: "Strength", category: "Lower Body", name: "Split Squats", difficulty: "Intermediate", intensity: "Medium", mode: "reps", timerSeconds: 45, sets: 3, reps: "8–10 / leg", desc: "Single-leg strength that transfers nicely to lunges and push-offs.", cues: ["Stay stacked", "Front foot stable", "Drive up hard"] },
  { id: "bulgarian-split", type: "Strength", category: "Lower Body", name: "Bulgarian Split Squat", difficulty: "Intermediate", intensity: "High", mode: "reps", timerSeconds: 40, sets: 3, reps: "8 / leg", desc: "Single-leg strength for powerful lunges and push-offs.", cues: ["Knee stable", "Drive up", "Control down"] },
  { id: "wall-sit", type: "Strength", category: "Lower Body", name: "Wall Sit", difficulty: "Beginner", intensity: "Medium", mode: "time", timerSeconds: 40, sets: 3, desc: "Leg endurance for longer rallies and better lower-body tolerance.", cues: ["Back flat", "Hold steady", "Breathe"] },
  { id: "step-up-drive", type: "Strength", category: "Lower Body", name: "Step-Up Drive", difficulty: "Beginner", intensity: "Medium", mode: "reps", timerSeconds: 35, sets: 3, reps: "8 / leg", desc: "Single-leg drive work for stronger push-offs and balance.", cues: ["Drive through foot", "Stay tall", "Control down"] },
  { id: "planks", type: "Core", category: "Core", name: "Planks + Side Planks", difficulty: "Beginner", intensity: "Low", mode: "time", timerSeconds: 45, sets: 3, desc: "Build trunk stiffness for balance, stability, and transfer of force.", cues: ["Ribs down", "Squeeze glutes", "No sagging"] },
  { id: "dead-bug", type: "Core", category: "Core", name: "Dead Bug", difficulty: "Beginner", intensity: "Low", mode: "reps", timerSeconds: 35, sets: 3, reps: "8–10 / side", desc: "Core stability for cleaner force transfer and less trunk wobble.", cues: ["Lower back stays down", "Move slow", "Breathe"] },
  { id: "hollow-hold", type: "Core", category: "Core", name: "Hollow Hold", difficulty: "Intermediate", intensity: "Medium", mode: "time", timerSeconds: 25, sets: 3, desc: "Improve full-body tension and control for more stable movement.", cues: ["Flatten back", "Reach long", "Don’t flare ribs"] },
  { id: "plank-shoulder-tap", type: "Core", category: "Core", name: "Plank Shoulder Taps", difficulty: "Beginner", intensity: "Medium", mode: "time", timerSeconds: 30, sets: 3, desc: "Core stability while resisting rotation.", cues: ["Don’t sway", "Slow taps", "Brace core"] },
  { id: "superman-hold", type: "Core", category: "Core", name: "Superman Hold", difficulty: "Beginner", intensity: "Low", mode: "time", timerSeconds: 25, sets: 3, desc: "Posterior-chain tension work for posture and stability.", cues: ["Reach long", "Glutes on", "Don’t crank neck"] },
  { id: "band-shoulders", type: "Band", category: "Upper Body", name: "Flat-Band Shoulder Stability", difficulty: "Beginner", intensity: "Low", mode: "reps", timerSeconds: 40, sets: 3, reps: "10–12", desc: "External rotations and Y-T-W raises for shoulder health and smash control.", cues: ["Slow and clean", "Don’t crank range", "Feel upper back working"] },
  { id: "band-pullapart", type: "Band", category: "Upper Body", name: "Band Pull-Aparts", difficulty: "Beginner", intensity: "Low", mode: "reps", timerSeconds: 30, sets: 3, reps: "12–20", desc: "Upper-back endurance for posture and shoulder control.", cues: ["Don’t shrug", "Pull evenly", "Stay smooth"] },
  { id: "mountain-climber", type: "Conditioning", category: "Conditioning", name: "Mountain Climbers", difficulty: "Beginner", intensity: "Medium", mode: "time", timerSeconds: 25, sets: 3, desc: "Simple conditioning finisher for work capacity and trunk control.", cues: ["Stay braced", "Drive knees", "Keep hips steady"] },
  { id: "lateral-hop", type: "Conditioning", category: "Conditioning", name: "Lateral Line Hops", difficulty: "Beginner", intensity: "Medium", mode: "time", timerSeconds: 20, sets: 3, desc: "Fast side-to-side hops for foot speed.", cues: ["Quick feet", "Stay light", "Minimal ground time"] },
  { id: "bear-crawl", type: "Conditioning", category: "Conditioning", name: "Bear Crawl", difficulty: "Intermediate", intensity: "Medium", mode: "time", timerSeconds: 20, sets: 3, desc: "Core, shoulder, and conditioning work that also sharpens coordination.", cues: ["Small steps", "Brace core", "Stay controlled"] },
];

const WEEK_PLAN: WeekPlan[] = [
  { week: 1, title: "Foundation", duration: 45, maxExercises: 8, workSetsBonus: 0, workTimeScale: 1.0, restScale: 1.0, xpGoal: 300, focus: "Technique first. Keep sessions shorter, cleaner, and controlled." },
  { week: 2, title: "Volume Build", duration: 50, maxExercises: 8, workSetsBonus: 0, workTimeScale: 1.05, restScale: 0.95, xpGoal: 420, focus: "Slightly more work density. Same cap, better quality and consistency." },
  { week: 3, title: "Movement Upgrade", duration: 55, maxExercises: 9, workSetsBonus: 1, workTimeScale: 1.1, restScale: 0.9, xpGoal: 560, focus: "Add a little volume and more demanding footwork choices." },
  { week: 4, title: "Power Phase", duration: 60, maxExercises: 9, workSetsBonus: 1, workTimeScale: 1.15, restScale: 0.85, xpGoal: 720, focus: "More explosive work, stronger pushes, tighter recovery under fatigue." },
  { week: 5, title: "Sharpness", duration: 65, maxExercises: 10, workSetsBonus: 1, workTimeScale: 1.2, restScale: 0.8, xpGoal: 900, focus: "Heavier mix of speed and power, but still keep the movement clean." },
  { week: 6, title: "Peak Week", duration: 70, maxExercises: 10, workSetsBonus: 2, workTimeScale: 1.25, restScale: 0.75, xpGoal: 1100, focus: "Best mix of footwork, explosiveness, and repeatability." },
];

const DEFAULT_SESSION = ["shadow-6", "rear-recovery", "net-lunge", "squats", "lunges", "pushups"];
const INITIAL_LOGS: SessionLog[] = [];
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
const TITLE_TIERS = [
  "Rookie Rallier",
  "Base Builder",
  "Court Mover",
  "Tempo Striker",
  "Footwork Technician",
  "Power Spinner",
  "Match Engine",
  "Sharpness Specialist",
  "Pressure Player",
  "Court Predator",
  "Precision Threat",
  "Explosive Driver",
  "Advanced Operator",
  "Elite Mover",
  "Pattern Breaker",
  "High-Performance Athlete",
  "Tournament Threat",
  "Peak Performer",
  "Court Commander",
  "Badminton Menace",
];
const ACHIEVEMENTS = [
  { name: "First Session", description: "Complete your first logged workout.", check: ({ logs }: { logs: SessionLog[] }) => logs.length >= 1 },
  { name: "Volume Builder", description: "Log 10 sessions.", check: ({ logs }: { logs: SessionLog[] }) => logs.length >= 10 },
  { name: "Week Crusher", description: "Hit a weekly XP goal.", check: ({ weekProgress }: { weekProgress: number }) => weekProgress >= 100 },
  { name: "Advanced Cycle", description: "Reach Week 6.", check: ({ week }: { week: number }) => week >= 6 },
  { name: "Level 10", description: "Reach Level 10.", check: ({ level }: { level: number }) => level >= 10 },
];

function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }
function formatTime(totalSeconds: number) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}
function displayPrescription(item: Drill, currentWeek: WeekPlan) {
  const adjustedSets = item.sets + currentWeek.workSetsBonus;
  if (item.mode === "reps") return `${adjustedSets} x ${item.reps}`;
  const scaledTime = Math.round(item.timerSeconds * currentWeek.workTimeScale);
  return `${adjustedSets} x ${formatTime(scaledTime)}`;
}
function getRank(level: number) { return TITLE_TIERS[clamp(level - 1, 0, TITLE_TIERS.length - 1)]; }
function getSessionSteps(chosenItems: Drill[], currentWeek: WeekPlan): FlowStep[] {
  const steps: FlowStep[] = [];
  WARMUP_STEPS.forEach((step, index) => {
    steps.push({ id: step.id, label: step.label, seconds: step.seconds, kind: "Warm-Up", locked: true, drillId: null });
    if (index < WARMUP_STEPS.length - 1) {
      const restSeconds = Math.round(REST_RULES.warmupTransition * currentWeek.restScale);
      steps.push({ id: `${step.id}-rest`, label: "Transition Rest", seconds: restSeconds, kind: "Rest", locked: true, prescription: formatTime(restSeconds), drillId: null });
    }
  });
  chosenItems.forEach((item, itemIndex) => {
    const totalSets = item.sets + currentWeek.workSetsBonus;
    const scaledTime = Math.round(item.timerSeconds * currentWeek.workTimeScale);
    for (let i = 0; i < totalSets; i += 1) {
      steps.push({
        id: `${item.id}-${i + 1}`,
        label: `${item.name} · Set ${i + 1}`,
        seconds: item.mode === "time" ? scaledTime : 0,
        kind: item.mode === "time" ? "Timed Drill" : "Work Block",
        locked: item.mode === "time",
        prescription: item.mode === "reps" ? item.reps : formatTime(scaledTime),
        drillId: item.id,
        setNumber: i + 1,
      });
      if (i < totalSets - 1) {
        const baseRest = item.mode === "time" ? REST_RULES.timedSetRest : REST_RULES.repSetRest;
        const scaledRest = Math.round(baseRest * currentWeek.restScale);
        steps.push({ id: `${item.id}-${i + 1}-rest`, label: `${item.name} · Rest`, seconds: scaledRest, kind: "Rest", locked: true, prescription: formatTime(scaledRest), drillId: item.id });
      }
    }
    if (itemIndex < chosenItems.length - 1) {
      const transitionSeconds = Math.round(REST_RULES.exerciseTransition * currentWeek.restScale);
      steps.push({ id: `${item.id}-transition`, label: "Exercise Transition", seconds: transitionSeconds, kind: "Rest", locked: true, prescription: formatTime(transitionSeconds), drillId: item.id });
    }
  });
  COOLDOWN_STEPS.forEach((step, index) => {
    steps.push({ id: step.id, label: step.label, seconds: step.seconds, kind: "Cooldown", locked: true, drillId: null });
    if (index < COOLDOWN_STEPS.length - 1) {
      const restSeconds = Math.round(REST_RULES.cooldownTransition * currentWeek.restScale);
      steps.push({ id: `${step.id}-rest`, label: "Transition Rest", seconds: restSeconds, kind: "Rest", locked: true, prescription: formatTime(restSeconds), drillId: null });
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

function Card({ className = "", children }: { className?: string; children: React.ReactNode }) { return <div className={cx("rounded-[28px] border border-slate-700 bg-slate-900 shadow-2xl", className)}>{children}</div>; }
function CardHeader({ className = "", children }: { className?: string; children: React.ReactNode }) { return <div className={cx("p-6", className)}>{children}</div>; }
function CardContent({ className = "", children }: { className?: string; children: React.ReactNode }) { return <div className={cx("px-6 pb-6", className)}>{children}</div>; }
function CardTitle({ className = "", children }: { className?: string; children: React.ReactNode }) { return <div className={cx("font-semibold", className)}>{children}</div>; }
function CardDescription({ className = "", children }: { className?: string; children: React.ReactNode }) { return <div className={cx("text-slate-300", className)}>{children}</div>; }
function Badge({ className = "", children }: { className?: string; children: React.ReactNode }) { return <span className={cx("inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium", className)}>{children}</span>; }
function Button({ className = "", variant = "default", size = "default", children, ...props }: any) {
  const variants = {
    default: "bg-emerald-600 text-white hover:bg-emerald-500 border-transparent",
    secondary: "border border-slate-600 bg-slate-800 text-slate-50 hover:bg-slate-700",
    ghost: "border-transparent bg-transparent text-slate-200 hover:bg-slate-700 hover:text-white",
  } as const;
  const sizes = { default: "h-11 px-4 py-2", sm: "h-9 px-3 py-2", icon: "h-10 w-10 p-0 justify-center" } as const;
  return <button {...props} className={cx("inline-flex items-center justify-center gap-2 rounded-2xl text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50", variants[variant as keyof typeof variants], sizes[size as keyof typeof sizes], className)}>{children}</button>;
}
function Input(props: any) { return <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input {...props} className={cx("h-11 w-full rounded-2xl border border-slate-600 bg-slate-800 pl-10 pr-4 text-white outline-none placeholder:text-slate-400 focus:border-emerald-500", props.className)} /></div>; }
function Progress({ value, className = "" }: { value: number; className?: string }) { return <div className={cx("h-3 overflow-hidden rounded-full bg-slate-800", className)}><div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>; }
function Checkbox({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: () => void }) { return <button type="button" onClick={onCheckedChange} className={cx("flex h-5 w-5 items-center justify-center rounded-md border transition", checked ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-500 bg-slate-900 text-transparent")}><Check className="h-3.5 w-3.5" /></button>; }
function Tabs({ defaultValue, children, className = "" }: any) { const [value, setValue] = useState(defaultValue); const items = React.Children.map(children, (child) => React.isValidElement(child) ? React.cloneElement(child as any, { tabsValue: value, setTabsValue: setValue }) : child); return <div className={className}>{items}</div>; }
function TabsList({ children, tabsValue, setTabsValue, className = "" }: any) { const items = React.Children.map(children, (child) => React.isValidElement(child) ? React.cloneElement(child as any, { tabsValue, setTabsValue }) : child); return <div className={className}>{items}</div>; }
function TabsTrigger({ value, children, tabsValue, setTabsValue, className = "" }: any) { const active = tabsValue === value; return <button onClick={() => setTabsValue(value)} className={cx("rounded-2xl px-3 py-2 text-sm transition", active ? "bg-emerald-600 text-white" : "text-slate-300 hover:text-white", className)}>{children}</button>; }
function TabsContent({ value, children, tabsValue }: any) { return tabsValue === value ? <div>{children}</div> : null; }
function Select({ value, onValueChange, children }: any) { return <select value={value} onChange={(e) => onValueChange(e.target.value)} className="h-11 w-full rounded-2xl border border-slate-600 bg-slate-800 px-4 text-white outline-none focus:border-emerald-500">{children}</select>; }
function SelectItem({ value, children }: any) { return <option value={value}>{children}</option>; }
function Dialog({ open, onOpenChange, children }: any) { if (!open) return null; return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => onOpenChange(false)}>{children}</div>; }
function DialogContent({ className = "", children }: any) { return <div className={cx("w-full max-w-md rounded-[28px] border border-slate-700 bg-slate-950 text-slate-50 shadow-2xl", className)} onClick={(e) => e.stopPropagation()}>{children}</div>; }
function DialogHeader({ children }: any) { return <div className="border-b border-slate-800 p-6">{children}</div>; }
function DialogTitle({ className = "", children }: any) { return <div className={cx("text-lg font-semibold text-white", className)}>{children}</div>; }
function DialogDescription({ className = "", children }: any) { return <div className={cx("mt-1 text-sm text-slate-300", className)}>{children}</div>; }

function playCue(kind: "rest" | "done" | "work") {
  try {
    const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.type = kind === "done" ? "triangle" : "sine";
    oscillator.frequency.value = kind === "rest" ? 440 : kind === "done" ? 660 : 540;
    gain.gain.value = 0.22;
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.14);
    oscillator.onended = () => ctx.close();
  } catch {}
}

export default function BadmintonTrainingApp() {
  const [week, setWeek] = useState(() => Number(localStorage.getItem("badminton_week") || 1));
  const [selected, setSelected] = useState<string[]>(() => {
    const saved = localStorage.getItem("badminton_selected");
    return saved ? JSON.parse(saved) : DEFAULT_SESSION;
  });
  const [search, setSearch] = useState("");
  const [goal, setGoal] = useState(() => localStorage.getItem("badminton_goal") || "Footwork + Power");
  const [timerOpen, setTimerOpen] = useState(false);
  const [sessionCompleteOpen, setSessionCompleteOpen] = useState(false);
  const [sessionCompleteMeta, setSessionCompleteMeta] = useState({ xp: 0, minutes: 0, level: 1, rank: "Rookie Rallier", streak: 0 });
  const [soundOn, setSoundOn] = useState(() => localStorage.getItem("badminton_sound") !== "off");

  const [timerLabel, setTimerLabel] = useState("Interval Timer");
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(45);
  const [timerStartValue, setTimerStartValue] = useState(45);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerLocked, setTimerLocked] = useState(true);
  const [timerEndsAt, setTimerEndsAt] = useState<number | null>(null);
  const [pausedTimerSeconds, setPausedTimerSeconds] = useState<number | null>(null);

  const [logs, setLogs] = useState<SessionLog[]>(() => {
    const saved = localStorage.getItem("badminton_logs");
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  const [flowIndex, setFlowIndex] = useState(0);
  const [flowRunning, setFlowRunning] = useState(false);
  const [flowSecondsLeft, setFlowSecondsLeft] = useState(0);
  const [flowEndsAt, setFlowEndsAt] = useState<number | null>(null);
  const [showQueue, setShowQueue] = useState(false);

  const currentWeek = WEEK_PLAN[week - 1];
  const filtered = useMemo(() => DRILLS.filter((item) => (`${item.name} ${item.type} ${item.category} ${item.desc}`).toLowerCase().includes(search.toLowerCase())), [search]);
  const chosenItems = useMemo(() => DRILLS.filter((item) => selected.includes(item.id)), [selected]);
  const drillsById = useMemo(() => Object.fromEntries(DRILLS.map((drill) => [drill.id, drill])), [] as any);
  const sessionFlow = useMemo(() => getSessionSteps(chosenItems, currentWeek), [chosenItems, currentWeek]);
  const currentFlowStep = sessionFlow[flowIndex] ?? null;
  const nextFlowStepData = sessionFlow[flowIndex + 1] ?? null;
  const currentFlowDrill = currentFlowStep?.drillId ? drillsById[currentFlowStep.drillId] : null;
  const nextFlowDrill = nextFlowStepData?.drillId ? drillsById[nextFlowStepData.drillId] : null;

  const totalXP = logs.reduce((sum, entry) => sum + entry.xp, 0);
  const rawLevel = Math.floor(totalXP / XP_PER_LEVEL) + 1;
  const level = clamp(rawLevel, 1, MAX_LEVEL);
  const xpIntoLevel = totalXP % XP_PER_LEVEL;
  const xpNeeded = XP_PER_LEVEL - xpIntoLevel;
  const xpBar = level >= MAX_LEVEL ? 100 : (xpIntoLevel / XP_PER_LEVEL) * 100;
  const weeklyXP = logs.reduce((sum, entry) => sum + entry.xp, 0);
  const weekProgress = clamp((weeklyXP / currentWeek.xpGoal) * 100, 0, 100);
  const rank = getRank(level);
  const flowProgress = sessionFlow.length ? (Math.min(flowIndex + 1, sessionFlow.length) / sessionFlow.length) * 100 : 0;
  const totalEstimatedSeconds = useMemo(() => sessionFlow.reduce((sum, step) => sum + step.seconds, 0), [sessionFlow]);
  const uniqueDates = [...new Set(logs.map((entry) => entry.date))].sort();
  const streak = useMemo(() => {
    if (!uniqueDates.length) return 0;
    let count = 1;
    for (let i = uniqueDates.length - 1; i > 0; i -= 1) {
      const current = new Date(uniqueDates[i]);
      const prev = new Date(uniqueDates[i - 1]);
      const diff = Math.round((current.getTime() - prev.getTime()) / 86400000);
      if (diff === 1) count += 1;
      else break;
    }
    return count;
  }, [uniqueDates]);

  const safetyMessage = useMemo(() => {
    const hardCount = chosenItems.filter((item) => item.intensity === "High").length;
    if (selected.length > currentWeek.maxExercises) return `Too many exercises for Week ${week}. This week caps at ${currentWeek.maxExercises}.`;
    if (hardCount > 5) return "This session is heavy on high-intensity work. Consider a cleaner balance if recovery starts slipping.";
    return "Session balance looks good.";
  }, [chosenItems, currentWeek, selected.length, week]);

  useEffect(() => { localStorage.setItem("badminton_logs", JSON.stringify(logs)); }, [logs]);
  useEffect(() => { localStorage.setItem("badminton_week", String(week)); }, [week]);
  useEffect(() => { localStorage.setItem("badminton_selected", JSON.stringify(selected)); }, [selected]);
  useEffect(() => { localStorage.setItem("badminton_goal", goal); }, [goal]);
  useEffect(() => { localStorage.setItem("badminton_sound", soundOn ? "on" : "off"); }, [soundOn]);

  useEffect(() => {
    const firstStep = sessionFlow[0];
    if (!firstStep) return;
    if (!flowRunning) {
      const nextSeconds = currentFlowStep ? currentFlowStep.seconds : firstStep.seconds;
      setFlowSecondsLeft(nextSeconds);
    }
  }, [sessionFlow, flowRunning]);

  useEffect(() => {
    if (!timerRunning || !timerEndsAt) return;
    const id = window.setInterval(() => {
      const msLeft = timerEndsAt - Date.now();
      if (msLeft <= 0) {
        setTimerRunning(false);
        setTimerEndsAt(null);
        setTimerSecondsLeft(0);
        if (soundOn) playCue("done");
        return;
      }
      const remaining = Math.ceil(msLeft / 1000);
      setTimerSecondsLeft(remaining);
    }, 250);
    return () => window.clearInterval(id);
  }, [timerRunning, timerEndsAt, soundOn]);

  const completeSession = (options: { keepFlowPosition?: boolean } = {}) => {
    const minutes = Math.max(currentWeek.duration, Math.round(totalEstimatedSeconds / 60));
    const baseXP = selected.length * 18 + currentWeek.week * 14 + currentWeek.workSetsBonus * 10;
    const bonus = selected.length >= currentWeek.maxExercises ? 35 : 15;
    const earned = baseXP + bonus;
    const today = new Date().toISOString().slice(0, 10);
    const updatedLogs = [{ date: today, session: `${goal} • Week ${week}`, minutes, xp: earned }, ...logs].slice(0, 20);
    const dateSet = new Set(updatedLogs.map((entry) => entry.date));
    setLogs(updatedLogs);
    setSessionCompleteMeta({ xp: earned, minutes, level, rank, streak: dateSet.size });
    setSessionCompleteOpen(true);
    if (!options.keepFlowPosition) {
      setFlowRunning(false);
      setFlowEndsAt(null);
    }
    if (soundOn) playCue("done");
  };

  const announceFlowStep = (step: FlowStep | null) => {
    if (!soundOn || !step) return;
    playCue(step.kind === "Rest" ? "rest" : "work");
  };

  const advanceFlow = () => {
    const nextIndex = flowIndex + 1;
    if (nextIndex >= sessionFlow.length) {
      completeSession();
      return;
    }
    const nextStep = sessionFlow[nextIndex];
    setFlowIndex(nextIndex);
    setFlowRunning(false);
    setFlowEndsAt(null);
    setFlowSecondsLeft(nextStep.seconds);
    announceFlowStep(nextStep);
    if (nextStep.kind !== "Work Block" && nextStep.seconds > 0) {
      setFlowEndsAt(Date.now() + nextStep.seconds * 1000);
      setFlowRunning(true);
    }
  };

  useEffect(() => {
    if (!flowRunning || !flowEndsAt || !currentFlowStep || currentFlowStep.kind === "Work Block") return;
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((flowEndsAt - Date.now()) / 1000));
      setFlowSecondsLeft(remaining);
      if (remaining <= 0) {
        setFlowRunning(false);
        setFlowEndsAt(null);
        advanceFlow();
      }
    };
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [flowRunning, flowEndsAt, currentFlowStep, flowIndex, sessionFlow]);

  const openTimer = (label: string, seconds: number, locked = true) => {
    setTimerLabel(label);
    setTimerLocked(locked);
    setTimerSecondsLeft(seconds);
    setTimerStartValue(seconds);
    setPausedTimerSeconds(null);
    setTimerRunning(false);
    setTimerEndsAt(null);
    setTimerOpen(true);
  };

  const startModalTimer = () => {
    const remaining = pausedTimerSeconds !== null ? pausedTimerSeconds : timerSecondsLeft > 0 ? timerSecondsLeft : timerStartValue;
    setPausedTimerSeconds(null);
    setTimerSecondsLeft(remaining);
    setTimerEndsAt(Date.now() + remaining * 1000);
    setTimerRunning(true);
  };

  const pauseModalTimer = () => {
    if (!timerEndsAt) return;
    const remaining = Math.max(1, Math.ceil((timerEndsAt - Date.now()) / 1000));
    setTimerRunning(false);
    setTimerEndsAt(null);
    setTimerSecondsLeft(remaining);
    setPausedTimerSeconds(remaining);
  };

  const resetFlow = () => {
    setFlowIndex(0);
    setFlowRunning(false);
    setFlowEndsAt(null);
    const firstStep = sessionFlow[0];
    setFlowSecondsLeft(firstStep ? firstStep.seconds : 0);
  };

  const startFlowStep = (index = flowIndex) => {
    const step = sessionFlow[index];
    if (!step) return;
    setFlowIndex(index);
    if (step.kind === "Work Block") {
      setFlowRunning(false);
      setFlowEndsAt(null);
      setFlowSecondsLeft(0);
      announceFlowStep(step);
      return;
    }
    const remaining = index === flowIndex && flowSecondsLeft > 0 ? flowSecondsLeft : step.seconds;
    setFlowSecondsLeft(remaining);
    setFlowEndsAt(Date.now() + remaining * 1000);
    setFlowRunning(true);
    announceFlowStep(step);
  };

  const pauseFlow = () => {
    if (flowRunning && flowEndsAt) {
      const remaining = Math.max(0, Math.ceil((flowEndsAt - Date.now()) / 1000));
      setFlowSecondsLeft(remaining);
    }
    setFlowRunning(false);
    setFlowEndsAt(null);
  };

  const toggleItem = (id: string) => setSelected((prev) => prev.includes(id) ? prev.filter((value) => value !== id) : prev.length >= currentWeek.maxExercises ? prev : [...prev, id]);

  const smartTemplates: Record<string, string[]> = {
    "Footwork + Power": ["shadow-6", "smash-combo", "rear-recovery", "split-step-hops", "lateral-shuffle", "reverse-chase", "mirror", "scissor-kick", "net-kill-shadow", "split-step-recover", "front-back-burst", "cross-step-drive", "squats", "lunges", "split-squat", "bulgarian-split", "wall-sit", "step-up-drive", "plyo-jumps", "skater-hop", "lateral-hop", "planks", "plank-shoulder-tap", "single-leg-calf", "mountain-climber"],
    "Leg Day": ["squats", "lunges", "split-squat", "rdl", "glute-bridge", "single-leg-calf", "plyo-jumps", "skater-hop", "wall-sit", "step-up-drive", "planks", "dead-bug", "hollow-hold", "bulgarian-split"],
    "Shoulder Safety": ["shadow-6", "net-lunge", "pushups", "rows", "band-shoulders", "band-pullapart", "planks", "dead-bug", "glute-bridge", "hollow-hold", "plank-shoulder-tap", "superman-hold"],
    "Speed & Reaction": ["split-step-hops", "mirror", "lateral-shuffle", "reverse-chase", "shadow-6", "rear-recovery", "smash-combo", "scissor-kick", "front-back-burst", "cross-step-drive", "skater-hop", "mountain-climber", "plyo-jumps", "lateral-hop", "bear-crawl"],
    "Core & Stability": ["planks", "dead-bug", "hollow-hold", "glute-bridge", "band-shoulders", "band-pullapart", "single-leg-calf", "rows", "pushups", "plank-shoulder-tap", "superman-hold", "bear-crawl"],
  };

  const addSmartSession = () => {
    const pool = [...(smartTemplates[goal] || smartTemplates["Footwork + Power"])];
    const currentSet = new Set(selected);
    const shuffled = pool.sort(() => Math.random() - 0.5);
    const rotated = [...shuffled.filter((id) => !currentSet.has(id)), ...shuffled.filter((id) => currentSet.has(id))];
    const nextSelection = rotated.slice(0, currentWeek.maxExercises);
    setSelected(nextSelection);
    setFlowRunning(false);
    setFlowEndsAt(null);
    setFlowIndex(0);
  };

  const removeFromSession = (id: string) => { setSelected((prev) => prev.filter((value) => value !== id)); };
  const resetEverything = () => {
    setWeek(1);
    setSelected(DEFAULT_SESSION);
    setGoal("Footwork + Power");
    setSearch("");
    setLogs(INITIAL_LOGS);
    setTimerRunning(false);
    setTimerOpen(false);
    setTimerEndsAt(null);
    setTimerSecondsLeft(45);
    setTimerStartValue(45);
    setTimerLocked(true);
    setTimerLabel("Interval Timer");
    setFlowIndex(0);
    setFlowRunning(false);
    setFlowEndsAt(null);
    setFlowSecondsLeft(0);
    setSessionCompleteOpen(false);
    setPausedTimerSeconds(null);
  };

  const achievements = ACHIEVEMENTS.map((achievement) => ({ ...achievement, unlocked: achievement.check({ logs, weekProgress, week, level }) }));
  const sessionGrade = selected.length >= currentWeek.maxExercises ? "S" : selected.length >= Math.max(1, currentWeek.maxExercises - 1) ? "A" : selected.length >= Math.max(1, currentWeek.maxExercises - 3) ? "B" : "C";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 max-w-md mx-auto">
      <div className="p-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="mb-6 grid gap-5">
          <Card className="overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
            <div className="h-1 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500" />
            <CardHeader className="pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border-slate-600 bg-slate-800 text-slate-50">Performance Dashboard</Badge>
                <Badge className="border-emerald-500/40 bg-emerald-500/15 text-emerald-100">{rank}</Badge>
                <Badge className="border-blue-500/30 bg-blue-500/15 text-blue-100">Level {level}</Badge>
              </div>
              <CardTitle className="mt-3 text-3xl leading-tight text-white">Badminton Performance Planner</CardTitle>
              <CardDescription className="max-w-2xl text-base leading-relaxed text-slate-200">Cleaner UI, bigger exercise pool, punchier progression, and less scroll clutter.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                <StatCard icon={<Trophy className="h-5 w-5" />} label="Total XP" value={`${totalXP}`} />
                <StatCard icon={<Flame className="h-5 w-5" />} label="Streak" value={`${streak} day${streak === 1 ? "" : "s"}`} />
                <StatCard icon={<CalendarDays className="h-5 w-5" />} label="Current Week" value={`Week ${week}`} />
                <StatCard icon={<Clock3 className="h-5 w-5" />} label="Est. Session" value={`${Math.round(totalEstimatedSeconds / 60)} min`} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-xl text-white">Progress Overview</CardTitle>
                  <CardDescription className="text-slate-200">Week {week}: {currentWeek.title}</CardDescription>
                </div>
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-center">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-amber-200">Grade</div>
                  <div className="text-xl font-bold text-amber-100">{sessionGrade}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 p-4">
                <div className="flex items-center gap-2 text-sm text-slate-200"><Award className="h-4 w-4" /> Current Title</div>
                <div className="mt-1 text-2xl font-bold text-white">{rank}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge className="border-slate-600 bg-slate-900 text-slate-50">Level {level}</Badge>
                  <Badge className="border-slate-600 bg-slate-900 text-slate-50">{xpNeeded} XP to next level</Badge>
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-200"><span>Level Progress</span><span>{level >= MAX_LEVEL ? `${XP_PER_LEVEL}/${XP_PER_LEVEL}` : `${xpIntoLevel}/${XP_PER_LEVEL}`}</span></div>
                <Progress value={xpBar} />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-200"><span>Weekly XP Goal</span><span>{weeklyXP}/{currentWeek.xpGoal}</span></div>
                <Progress value={weekProgress} />
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
              <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" onClick={() => setWeek((value) => clamp(value - 1, 1, 6))}>Previous</Button>
                <Button variant="secondary" onClick={() => setWeek((value) => clamp(value + 1, 1, 6))}>Next</Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" onClick={() => setSoundOn((value) => !value)}>
                  {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />} {soundOn ? "Sound cues on" : "Sound cues off"}
                </Button>
                <Button onClick={() => setWeek(1)}>Week 1</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Tabs defaultValue="build" className="space-y-5">
          <TabsList className="grid w-full grid-cols-3 gap-1 rounded-2xl border border-slate-700 bg-slate-900 p-1 sm:grid-cols-6">
            <TabsTrigger value="build">Build</TabsTrigger>
            <TabsTrigger value="session">Session</TabsTrigger>
            <TabsTrigger value="flow">Flow</TabsTrigger>
            <TabsTrigger value="plan">Plan</TabsTrigger>
            <TabsTrigger value="log">Log</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="build">
            <div className="grid gap-5">
              <Card>
                <CardHeader>
                  <div className="flex flex-col gap-3">
                    <div>
                      <CardTitle className="text-2xl text-white">Exercise Library</CardTitle>
                      <CardDescription className="text-slate-200">Smart Build now has more real options and rotates away from your current session when it can.</CardDescription>
                    </div>
                    <div className="flex flex-col gap-3">
                      <Input value={search} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)} placeholder="Search exercises..." />
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
                  <div className="mb-4 flex flex-wrap gap-2">
                    <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-100">{selected.length} selected</Badge>
                    <Badge className="border-slate-600 bg-slate-800 text-slate-50">Week {week}</Badge>
                    <Badge className="border-slate-600 bg-slate-800 text-slate-50">Cap {currentWeek.maxExercises}</Badge>
                  </div>
                  <div className="grid gap-4">
                    {filtered.map((item) => {
                      const active = selected.includes(item.id);
                      const blocked = !active && selected.length >= currentWeek.maxExercises;
                      const scaledTime = Math.round(item.timerSeconds * currentWeek.workTimeScale);
                      return (
                        <motion.div key={item.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
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
            <div className="space-y-5">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl text-white">Session Overview</CardTitle>
                  <CardDescription className="text-slate-200">Less clutter, cleaner structure, same controls.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-2xl border border-slate-700 bg-slate-800/80 p-4"><div className="mb-2 flex items-center gap-2 text-slate-50"><Shield className="h-4 w-4" /> Session check</div><p className={cx("text-sm leading-relaxed", safetyMessage.includes("good") ? "text-emerald-300" : "text-amber-300")}>{safetyMessage}</p></div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <MetricPill icon={<Star className="h-4 w-4" />} label="Grade" value={sessionGrade} />
                    <MetricPill icon={<Target className="h-4 w-4" />} label="Exercises" value={`${selected.length}/${currentWeek.maxExercises}`} />
                    <MetricPill icon={<Clock3 className="h-4 w-4" />} label="Estimate" value={`${Math.round(totalEstimatedSeconds / 60)} min`} />
                  </div>
                  <SectionCard icon={<Zap className="h-4 w-4" />} title="Warm-Up" subtitle="Preparation sequence">{WARMUP_STEPS.map((step) => <TimerRow key={step.id} label={step.label} timeLabel={formatTime(step.seconds)} onStart={() => openTimer(step.label, step.seconds, true)} />)}</SectionCard>
                  <SectionCard icon={<Target className="h-4 w-4" />} title="Main Work" subtitle={`Selected exercises: ${selected.length} / ${currentWeek.maxExercises}`} right={<Badge className="border-emerald-500/30 bg-emerald-500/15 text-emerald-100">{Math.round(chosenItems.reduce((sum, item) => sum + Math.round(item.timerSeconds * currentWeek.workTimeScale) * (item.sets + currentWeek.workSetsBonus), 0) / 60)} min</Badge>}>
                    <div className="space-y-2">
                      {chosenItems.map((item) => {
                        const scaledTime = Math.round(item.timerSeconds * currentWeek.workTimeScale);
                        return <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-700 bg-slate-800/80 px-4 py-3"><div><div className="font-medium text-white">{item.name}</div><div className="text-sm text-slate-200">{displayPrescription(item, currentWeek)}</div></div><div className="flex items-center gap-2">{item.mode === "time" ? <Button size="sm" variant="secondary" className="rounded-xl" onClick={() => openTimer(item.name, scaledTime, true)}><Timer className="h-4 w-4" /> {formatTime(scaledTime)}</Button> : <Badge className="border-slate-600 bg-slate-900 text-slate-50">Reps</Badge>}<Button variant="ghost" size="icon" className="rounded-xl" onClick={() => removeFromSession(item.id)}><Trash2 className="h-4 w-4" /></Button></div></div>;
                      })}
                    </div>
                  </SectionCard>
                  <SectionCard icon={<Wind className="h-4 w-4" />} title="Cooldown" subtitle="Recovery sequence">{COOLDOWN_STEPS.map((step) => <TimerRow key={step.id} label={step.label} timeLabel={formatTime(step.seconds)} onStart={() => openTimer(step.label, step.seconds, true)} />)}</SectionCard>
                  <div className="grid grid-cols-2 gap-3"><Button variant="secondary" onClick={() => openTimer("Quick Timer", 45, false)}><Timer className="h-4 w-4" /> Quick Timer</Button><Button onClick={() => completeSession({ keepFlowPosition: true })}><Plus className="h-4 w-4" /> Complete Session</Button></div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="flow">
            <div className="space-y-5">
              <Card className="overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500" />
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-2xl text-white">Guided Workout Flow</CardTitle>
                      <CardDescription className="text-slate-200">Cleaner focus card, better step animation, less queue spam.</CardDescription>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => setShowQueue((value) => !value)}>{showQueue ? "Hide Queue" : "Show Queue"}</Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div><div className="mb-2 flex items-center justify-between text-sm text-slate-200"><span>Session Progress</span><span>{Math.min(flowIndex + 1, sessionFlow.length)}/{sessionFlow.length || 0}</span></div><Progress value={flowProgress} /></div>
                  <AnimatePresence mode="wait">
                    <motion.div key={currentFlowStep?.id || "empty"} initial={{ opacity: 0, y: 14, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -14, scale: 0.98 }} transition={{ duration: 0.22 }} className="rounded-3xl border border-slate-700 bg-gradient-to-br from-slate-900 to-slate-800 p-5 shadow-xl">
                      <div className="text-sm text-slate-200">Current Step</div>
                      <div className="mt-1 text-2xl font-bold text-white">{currentFlowStep ? currentFlowStep.label : "No session steps loaded"}</div>
                      {currentFlowStep && <div className="mt-3 flex flex-wrap gap-2"><Badge className={cx(currentFlowStep.kind === "Rest" ? "border-blue-500/30 bg-blue-500/15 text-blue-100" : "border-slate-600 bg-slate-900 text-slate-50")}>{currentFlowStep.kind}</Badge><Badge className="border-slate-600 bg-slate-900 text-slate-50">{currentFlowStep.kind === "Work Block" ? currentFlowStep.prescription : formatTime(flowSecondsLeft)}</Badge></div>}
                      <div className="mt-4 rounded-3xl border border-slate-700 bg-slate-950 p-6 text-center">
                        {currentFlowStep?.kind === "Work Block" ? (
                          <div className="space-y-4">
                            <div className="text-4xl font-bold text-white">{currentFlowStep.prescription}</div>
                            {currentFlowDrill && (
                              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-left">
                                <div className="text-sm font-medium text-emerald-300">How to do it</div>
                                <div className="mt-1 text-sm text-slate-200">{currentFlowDrill.desc}</div>
                                <div className="mt-3 flex flex-wrap gap-2">{currentFlowDrill.cues.map((cue) => <span key={cue} className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs text-slate-100">{cue}</span>)}</div>
                              </div>
                            )}
                            <Button onClick={() => { pauseFlow(); advanceFlow(); }}>Complete Set</Button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="text-6xl font-bold text-white">{formatTime(flowSecondsLeft)}</div>
                            <div className="text-sm text-slate-300">{currentFlowStep?.kind === "Rest" ? "Rest block running" : "Timed set running"}</div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-3xl border border-slate-700 bg-slate-800/60 p-4">
                      <div className="text-sm text-slate-200">Up Next</div>
                      <div className="mt-1 text-lg font-semibold text-white">{nextFlowStepData ? nextFlowStepData.label : "Session complete"}</div>
                      <div className="mt-1 text-sm text-slate-300">{nextFlowStepData ? nextFlowStepData.kind : "Nice. You cooked."}</div>
                      {nextFlowDrill && <div className="mt-3 text-sm text-slate-200">{nextFlowDrill.desc}</div>}
                    </div>
                    <div className="rounded-3xl border border-slate-700 bg-slate-800/60 p-4">
                      <div className="text-sm text-slate-200">Current Focus</div>
                      <div className="mt-1 text-lg font-semibold text-white">{currentFlowDrill ? currentFlowDrill.name : currentFlowStep?.kind || "No step"}</div>
                      <div className="mt-1 text-sm text-slate-300">{currentFlowDrill ? currentFlowDrill.intensity : "Stay smooth and controlled."}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    <Button onClick={() => startFlowStep(flowIndex)}><PlayCircle className="h-4 w-4" /> {flowRunning ? "Resume" : "Start"}</Button>
                    <Button variant="secondary" onClick={pauseFlow}><PauseCircle className="h-4 w-4" /> Pause</Button>
                    <Button variant="secondary" onClick={advanceFlow}><SkipForward className="h-4 w-4" /> Skip</Button>
                    <Button variant="secondary" onClick={resetFlow}><RefreshCw className="h-4 w-4" /> Reset</Button>
                  </div>
                </CardContent>
              </Card>

              {showQueue && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl text-white">Session Queue</CardTitle>
                    <CardDescription className="text-slate-200">Tap any step to jump there.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                      {sessionFlow.map((step, index) => <button key={step.id} onClick={() => { setFlowIndex(index); setFlowSecondsLeft(step.seconds); setFlowEndsAt(null); setFlowRunning(false); }} className={cx("w-full rounded-2xl border px-4 py-3 text-left transition", index === flowIndex ? "border-emerald-500 bg-emerald-500/10" : step.kind === "Rest" ? "border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10" : "border-slate-700 bg-slate-800/80 hover:bg-slate-800")}><div className="flex items-center justify-between gap-3"><div><div className="font-medium text-white">{step.label}</div><div className="text-sm text-slate-200">{step.kind}</div></div><div className="flex items-center gap-2"><Badge className={cx(step.kind === "Rest" ? "border-blue-500/30 bg-blue-500/15 text-blue-100" : "border-slate-600 bg-slate-900 text-slate-50")}>{step.kind === "Work Block" ? step.prescription : formatTime(step.seconds)}</Badge>{index === flowIndex && <ChevronRight className="h-4 w-4 text-emerald-300" />}</div></div></button>)}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="plan">
            <div className="grid gap-4">
              {WEEK_PLAN.map((item) => <Card key={item.week} className={cx(week === item.week && "border-emerald-500 bg-emerald-500/10")}><CardHeader><CardTitle className="flex items-center justify-between text-xl text-white"><span>Week {item.week}</span><Badge className="border-slate-600 bg-slate-800 text-slate-50">{item.duration} min</Badge></CardTitle><CardDescription className="text-slate-200">{item.title}</CardDescription></CardHeader><CardContent><p className="mb-4 text-sm leading-relaxed text-slate-200">{item.focus}</p><div className="space-y-2 text-sm text-slate-300"><div>XP Goal: {item.xpGoal}</div><div>Exercise Max: {item.maxExercises}</div><div>Extra Set Scaling: +{item.workSetsBonus}</div></div><Button className="mt-4 w-full" variant="secondary" onClick={() => setWeek(item.week)}>Select Week</Button></CardContent></Card>)}
            </div>
          </TabsContent>

          <TabsContent value="log">
            <div className="grid gap-6">
              <Card><CardHeader><CardTitle className="text-2xl text-white">Training Summary</CardTitle><CardDescription className="text-slate-200">Session history, streak, rank, and reset controls.</CardDescription></CardHeader><CardContent className="space-y-4"><StatRow icon={<Footprints className="h-4 w-4" />} label="Sessions Logged" value={`${logs.length}`} /><StatRow icon={<Flame className="h-4 w-4" />} label="Current Streak" value={`${streak} day${streak === 1 ? "" : "s"}`} /><StatRow icon={<Medal className="h-4 w-4" />} label="Current Title" value={rank} /><StatRow icon={<Dumbbell className="h-4 w-4" />} label="Current Level" value={`${level}`} /><StatRow icon={<Timer className="h-4 w-4" />} label="Avg Session" value={`${Math.round(logs.reduce((sum, entry) => sum + entry.minutes, 0) / Math.max(logs.length, 1))} min`} /><Button className="w-full border border-red-500/30 bg-red-500/15 text-red-100 hover:bg-red-500/25" onClick={resetEverything}><RotateCcw className="h-4 w-4" /> Full Reset</Button></CardContent></Card>
              <Card><CardHeader><CardTitle className="text-2xl text-white">Workout Log</CardTitle><CardDescription className="text-slate-200">Completed sessions with time and earned XP.</CardDescription></CardHeader><CardContent><div className="space-y-3">{logs.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-800/40 p-6 text-center text-slate-300">No workouts logged yet.</div> : logs.map((log, idx) => <div key={`${log.date}-${idx}`} className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-700 bg-slate-800/80 p-4"><div><div className="font-medium text-white">{log.session}</div><div className="text-sm text-slate-200">{log.date}</div></div><div className="flex gap-2"><Badge className="border-slate-600 bg-slate-900 text-slate-50">{log.minutes} min</Badge><Badge className="border-emerald-500/30 bg-emerald-500/15 text-emerald-100">+{log.xp} XP</Badge></div></div>)}</div></CardContent></Card>
            </div>
          </TabsContent>

          <TabsContent value="progress">
            <div className="grid gap-6">
              <Card><CardHeader><CardTitle className="text-2xl text-white">Performance Progress</CardTitle><CardDescription className="text-slate-200">More visual progression, more obvious milestones, better reward feel.</CardDescription></CardHeader><CardContent className="space-y-5"><div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 p-5"><div className="text-sm text-slate-200">Current Title</div><div className="mt-1 text-3xl font-bold text-white">{rank}</div><div className="mt-4 text-sm text-slate-200">Level</div><div className="mt-1 text-2xl font-semibold text-blue-100">{level}</div><div className="mt-3 flex flex-wrap gap-2"><Badge className="border-slate-600 bg-slate-900 text-slate-50">{totalXP} XP total</Badge><Badge className="border-orange-500/30 bg-orange-500/15 text-orange-100">{streak} day streak</Badge></div></div><div><div className="mb-2 flex items-center justify-between text-sm text-slate-200"><span>Next Level</span><span>{level >= MAX_LEVEL ? "MAX" : `${xpNeeded} XP remaining`}</span></div><Progress value={xpBar} /></div><div><div className="mb-2 flex items-center justify-between text-sm text-slate-200"><span>Weekly Target</span><span>{weeklyXP}/{currentWeek.xpGoal}</span></div><Progress value={weekProgress} /></div><div className="grid gap-3 sm:grid-cols-3"><MetricPill icon={<Star className="h-4 w-4" />} label="Grade" value={sessionGrade} /><MetricPill icon={<Flame className="h-4 w-4" />} label="Streak" value={`${streak}`} /><MetricPill icon={<Award className="h-4 w-4" />} label="Title Tier" value={`${level}/${MAX_LEVEL}`} /></div></CardContent></Card>
              <Card><CardHeader><CardTitle className="text-2xl text-white">Achievements</CardTitle><CardDescription className="text-slate-200">A cleaner achievement wall with more obvious unlocks.</CardDescription></CardHeader><CardContent className="grid gap-3">{achievements.map((achievement) => <div key={achievement.name} className={cx("rounded-2xl border p-4", achievement.unlocked ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100" : "border-slate-700 bg-slate-800/80 text-slate-200")}><div className="flex items-center gap-2 font-medium text-white"><CheckCircle2 className="h-4 w-4" /> {achievement.name}</div><div className="mt-1 text-sm">{achievement.description}</div><div className="mt-2 text-xs uppercase tracking-wide">{achievement.unlocked ? "Unlocked" : "Locked"}</div></div>)}</CardContent></Card>
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={timerOpen} onOpenChange={setTimerOpen}>
          <DialogContent>
            <DialogHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <DialogTitle>{timerLabel}</DialogTitle>
                  <DialogDescription>
                    {timerLocked ? "Locked to the selected exercise or session step." : "Custom timer mode."}
                  </DialogDescription>
                </div>
                <button className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white" onClick={() => setTimerOpen(false)}><X className="h-4 w-4" /></button>
              </div>
            </DialogHeader>
            <div className="space-y-6 p-6">
              <div className="rounded-3xl border border-slate-700 bg-slate-900 p-6 text-center text-6xl font-bold tracking-tight text-white">{formatTime(timerSecondsLeft)}</div>
              {!timerLocked && <div className="grid grid-cols-3 gap-3"><Button variant="secondary" onClick={() => { setTimerSecondsLeft(30); setTimerStartValue(30); setPausedTimerSeconds(null); setTimerRunning(false); setTimerEndsAt(null); }}>30s</Button><Button variant="secondary" onClick={() => { setTimerSecondsLeft(45); setTimerStartValue(45); setPausedTimerSeconds(null); setTimerRunning(false); setTimerEndsAt(null); }}>45s</Button><Button variant="secondary" onClick={() => { setTimerSecondsLeft(60); setTimerStartValue(60); setPausedTimerSeconds(null); setTimerRunning(false); setTimerEndsAt(null); }}>60s</Button></div>}
              <div className="grid grid-cols-3 gap-3"><Button onClick={startModalTimer}>Start</Button><Button variant="secondary" onClick={pauseModalTimer}>Pause</Button><Button variant="secondary" onClick={() => { setTimerRunning(false); setTimerEndsAt(null); setPausedTimerSeconds(null); setTimerSecondsLeft(timerStartValue); }}>Reset</Button></div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={sessionCompleteOpen} onOpenChange={setSessionCompleteOpen}>
          <DialogContent>
            <DialogHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <DialogTitle>Session Complete 🎉</DialogTitle>
                  <DialogDescription>Nice work. Your workout has been logged and your progress was saved.</DialogDescription>
                </div>
                <button className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white" onClick={() => setSessionCompleteOpen(false)}><X className="h-4 w-4" /></button>
              </div>
            </DialogHeader>
            <div className="space-y-4 p-6">
              <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center">
                <div className="text-lg font-semibold text-white">Workout logged successfully</div>
                <div className="mt-2 text-sm text-slate-300">+{sessionCompleteMeta.xp} XP • {sessionCompleteMeta.minutes} min</div>
                <div className="mt-3 inline-flex rounded-full border border-blue-500/30 bg-blue-500/15 px-3 py-1 text-sm text-blue-100">Level {sessionCompleteMeta.level} • {sessionCompleteMeta.rank}</div>
                <div className="mt-2 inline-flex rounded-full border border-orange-500/30 bg-orange-500/15 px-3 py-1 text-sm text-orange-100">{sessionCompleteMeta.streak} logged days</div>
              </div>
              <Button className="w-full" onClick={() => setSessionCompleteOpen(false)}>Nice</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function SectionCard({ icon, title, subtitle, right, children }: { icon: React.ReactNode; title: string; subtitle: string; right?: React.ReactNode; children: React.ReactNode }) {
  return <div className="rounded-3xl border border-slate-700 bg-slate-950/70 p-4"><div className="mb-3 flex items-start justify-between gap-3"><div><div className="flex items-center gap-2 text-sm font-semibold text-white">{icon}{title}</div><div className="mt-1 text-sm text-slate-200">{subtitle}</div></div>{right}</div>{children}</div>;
}
function TimerRow({ label, timeLabel, onStart }: { label: string; timeLabel: string; onStart: () => void }) { return <div className="mb-2 flex items-center justify-between gap-3 rounded-2xl border border-slate-700 bg-slate-800/80 px-4 py-3"><div className="text-sm text-white">{label}</div><Button size="sm" variant="secondary" className="rounded-xl" onClick={onStart}><Timer className="h-4 w-4" /> {timeLabel}</Button></div>; }
function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <div className="rounded-3xl border border-slate-700 bg-slate-800/80 p-4"><div className="mb-2 flex items-center gap-2 text-slate-100">{icon}<span className="text-sm">{label}</span></div><div className="text-2xl font-bold text-white">{value}</div></div>; }
function StatRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-700 bg-slate-800/80 p-4"><div className="flex items-center gap-2 text-slate-100">{icon}<span>{label}</span></div><div className="text-right font-semibold text-white">{value}</div></div>; }
function MetricPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <div className="rounded-2xl border border-slate-700 bg-slate-800/80 p-4"><div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-slate-400">{icon}{label}</div><div className="mt-2 text-xl font-bold text-white">{value}</div></div>; }
