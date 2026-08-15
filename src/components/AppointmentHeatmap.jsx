import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Heatmap,
  HeatmapSeries,
  LinearYAxis,
  LinearYAxisTickSeries,
  LinearYAxisTickLabel,
  LinearXAxis,
  LinearXAxisTickSeries,
  LinearXAxisTickLabel,
} from "reaviz";
import Icon from "./Icon.jsx";
import { useTheme } from "../utils/theme.js";
import { appointments as mockSeed } from "../mock/appointments.js";
import { getAccessToken } from "../api/client.js";
import { fetchMyAppointments, mapAppointmentFromApi } from "../api/bookings.js";

const WEEKS_SHOWN = 10;
const DAY_LABELS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Use local time to avoid UTC timezone offset shifting the date
function toDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Realistic-looking demo history so the heatmap isn't empty in mock mode
function generateDemoHistory() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const demos = [];
  const patterns = [
    [0, 2, 4],
    [1, 3, 5],
    [0, 2, 4, 6],
    [0, 3, 5],
    [1, 2, 4],
    [0, 2, 4],
    [1, 3],
    [0, 2, 4, 5],
  ];
  for (let w = 1; w <= 8; w++) {
    const ws = getWeekStart(new Date(today.getTime() - w * 7 * 86400000));
    patterns[(w - 1) % patterns.length].forEach((d) => {
      const date = new Date(ws);
      date.setDate(ws.getDate() + d);
      if (date <= today) {
        demos.push({
          id: `demo-${w}-${d}`,
          date: toDateStr(date),
          time: "10:00",
          status: "completed",
          muscleGroups: [],
          machines: [],
        });
      }
    });
  }
  return demos;
}

// Build 7-row × WEEKS_SHOWN-col nested heatmap data for reaviz
function buildHeatmapData(appointments) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dateCount = {};
  appointments.forEach((a) => {
    if (a.status === "completed") {
      dateCount[a.date] = (dateCount[a.date] || 0) + 1;
    }
  });

  const currentWS = getWeekStart(today);
  const weekStarts = [];
  for (let i = WEEKS_SHOWN - 1; i >= 0; i--) {
    const ws = new Date(currentWS);
    ws.setDate(ws.getDate() - i * 7);
    weekStarts.push(ws);
  }

  return DAY_LABELS.map((dayLabel, dayIndex) => ({
    key: dayLabel,
    data: weekStarts.map((ws, wi) => {
      const cellDate = new Date(ws);
      cellDate.setDate(ws.getDate() + dayIndex);
      const count = cellDate > today ? null : (dateCount[toDateStr(cellDate)] || null);
      const label = wi === WEEKS_SHOWN - 1 ? "Bu Hf" : `H${wi + 1}`;
      return { key: label, data: count };
    }),
  }));
}

function calculateStats(appointments) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weeksWithActivity = new Set();
  let thisMonthCount = 0;

  appointments.forEach((a) => {
    if (a.status !== "completed") return;
    const d = new Date(a.date + "T12:00:00");
    weeksWithActivity.add(toDateStr(getWeekStart(d)));
    if (d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()) {
      thisMonthCount++;
    }
  });

  // Current streak: consecutive weeks going back from this week
  let currentStreak = 0;
  let checkWS = getWeekStart(today);
  while (weeksWithActivity.has(toDateStr(checkWS))) {
    currentStreak++;
    checkWS = new Date(checkWS.getTime() - 7 * 86400000);
  }

  // Longest streak
  const sorted = Array.from(weeksWithActivity).sort();
  let longestStreak = 0;
  let tempStreak = 0;
  let prevStr = null;
  sorted.forEach((ws) => {
    if (!prevStr) {
      tempStreak = 1;
    } else {
      const diffDays = (new Date(ws) - new Date(prevStr)) / 86400000;
      tempStreak = diffDays === 7 ? tempStreak + 1 : 1;
    }
    longestStreak = Math.max(longestStreak, tempStreak);
    prevStr = ws;
  });

  return { currentStreak, longestStreak, thisMonthCount };
}

export default function AppointmentHeatmap() {
  const { theme } = useTheme();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);
  const [chartWidth, setChartWidth] = useState(0);

  const load = useCallback(async () => {
    if (!getAccessToken()) {
      setAppointments([...mockSeed, ...generateDemoHistory()]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const apiRows = await fetchMyAppointments();
      const mapped = apiRows.map(mapAppointmentFromApi);
      const withFallback = mapped.length >= 5 ? mapped : [...mapped, ...generateDemoHistory()];
      setAppointments(withFallback);
    } catch {
      setAppointments([...mockSeed, ...generateDemoHistory()]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Measure container width so reaviz renders at the correct size
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setChartWidth(el.offsetWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [loading]);

  const heatmapData = useMemo(() => buildHeatmapData(appointments), [appointments]);
  const stats = useMemo(() => calculateStats(appointments), [appointments]);

  const isDark = theme === "dark";

  // METU-red color scheme: empty=gray, low=light red, high=full METU red
  const colorScheme = isDark
    ? ["rgba(166,25,46,0.30)", "rgba(196,21,53,0.58)", "#C41535", "#E84045"]
    : ["rgba(166,25,46,0.20)", "rgba(166,25,46,0.50)", "#C41535", "#A6192E"];

  const emptyColor = isDark ? "rgba(52,46,51,0.45)" : "rgba(220,216,221,0.55)";
  const tickFill = isDark ? "#9A9AAF" : "#9CA3AF";

  const legendColors = isDark
    ? [emptyColor, "rgba(166,25,46,0.30)", "rgba(196,21,53,0.58)", "#C41535", "#E84045"]
    : [emptyColor, "rgba(166,25,46,0.20)", "rgba(166,25,46,0.50)", "#C41535", "#A6192E"];

  const metrics = [
    {
      id: "streak",
      icon: "flame",
      label: "Mevcut Seri",
      value: `${stats.currentStreak} Hafta`,
      trend: stats.currentStreak >= 3,
    },
    {
      id: "month",
      icon: "calendar",
      label: "Bu Ay",
      value: `${stats.thisMonthCount} Antrenman`,
      trend: stats.thisMonthCount >= 8,
    },
    {
      id: "best",
      icon: "target",
      label: "En Uzun Seri",
      value: `${stats.longestStreak} Hafta`,
      trend: false,
    },
  ];

  if (loading) {
    return (
      <div className="mb-5 overflow-hidden rounded-2xl border border-hairline bg-surface shadow-card">
        <div className="px-5 pt-5 pb-4">
          <div className="mb-1 h-4 w-36 animate-pulse rounded-lg bg-gray-200" />
          <div className="mt-1 h-3 w-52 animate-pulse rounded-lg bg-gray-100" />
        </div>
        <div className="mx-5 mb-5 h-52 animate-pulse rounded-xl bg-gray-100" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="mb-5 overflow-hidden rounded-2xl border border-hairline bg-surface shadow-card"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div>
          <h3 className="text-base font-bold text-gray-900">Aktivite Haritası</h3>
          <p className="mt-0.5 text-xs text-gray-500">Son {WEEKS_SHOWN} haftalık antrenman sıklığı</p>
        </div>
        {stats.currentStreak > 0 && (
          <div className="flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1.5">
            <Icon name="flame" size={14} className="text-accent" />
            <span className="text-xs font-bold text-accent">{stats.currentStreak} Hafta</span>
          </div>
        )}
      </div>

      {/* Heatmap chart */}
      <div ref={containerRef} className="px-2">
        {chartWidth > 0 && <Heatmap
          height={210}
          width={chartWidth}
          data={heatmapData}
          yAxis={
            <LinearYAxis
              type="category"
              axisLine={null}
              tickSeries={
                <LinearYAxisTickSeries
                  line={null}
                  label={<LinearYAxisTickLabel padding={8} fill={tickFill} />}
                />
              }
            />
          }
          xAxis={
            <LinearXAxis
              axisLine={null}
              tickSeries={
                <LinearXAxisTickSeries
                  line={null}
                  label={<LinearXAxisTickLabel padding={5} rotation={-40} fill={tickFill} />}
                  tickSize={10}
                />
              }
            />
          }
          series={
            <HeatmapSeries
              colorScheme={colorScheme}
              emptyColor={emptyColor}
              padding={0.14}
            />
          }
        />}
      </div>

      {/* Color legend */}
      <div className="flex items-center justify-end gap-1 px-5 pb-4">
        <span className="text-[10px] text-gray-400">Az</span>
        {legendColors.map((color, i) => (
          <span
            key={i}
            className="h-2.5 w-2.5 rounded-[3px]"
            style={{ backgroundColor: color }}
          />
        ))}
        <span className="text-[10px] text-gray-400">Çok</span>
      </div>

      {/* Stats metrics */}
      <div className="divide-y divide-gray-100 px-5">
        {metrics.map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-between py-3.5"
          >
            <div className="flex items-center gap-2.5 text-sm text-gray-500">
              <Icon name={m.icon} size={18} className="text-gray-400" />
              {m.label}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-gray-900">{m.value}</span>
              {m.trend && (
                <span className="grid h-6 w-6 place-items-center rounded-full bg-primary-50">
                  <Icon name="trending" size={13} className="text-accent" />
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
