import React, { useState, useEffect, useMemo } from "react";
import { OWNER } from "./config";

const DEPARTMENTS = ["All", "Operations", "Design & Architecture", "Engineering", "Sales & Marketing", "Finance & HR"];

const INITIAL_EMPLOYEES = [
  {
    id: 1,
    name: "Arjun Venkat",
    role: "Chief Technical Officer",
    dept: "Engineering",
    email: "arjun.v@enterprise.co",
    phone: "9845112233",
    salary: 185000,
    type: "Full-Time",
    joined: "2022-03-15",
    status: "Present",
    leavesTaken: 3,
    avatar: "AV",
  },
  {
    id: 2,
    name: "Pooja Hegde",
    role: "Lead Structural Designer",
    dept: "Design & Architecture",
    email: "pooja.h@enterprise.co",
    phone: "9988776655",
    salary: 125000,
    type: "Full-Time",
    joined: "2023-01-10",
    status: "Present",
    leavesTaken: 1,
    avatar: "PH",
  },
  {
    id: 3,
    name: "Rohan Shenoy",
    role: "Senior Project Manager",
    dept: "Operations",
    email: "rohan.s@enterprise.co",
    phone: "9731445566",
    salary: 140000,
    type: "Full-Time",
    joined: "2021-08-01",
    status: "On Leave",
    leavesTaken: 6,
    avatar: "RS",
  },
  {
    id: 4,
    name: "Meera Krishnan",
    role: "Head of Client Relations",
    dept: "Sales & Marketing",
    email: "meera.k@enterprise.co",
    phone: "9611224488",
    salary: 130000,
    type: "Full-Time",
    joined: "2023-06-20",
    status: "Present",
    leavesTaken: 2,
    avatar: "MK",
  },
  {
    id: 5,
    name: "Zameer Khan",
    role: "Fabrication Supervisor",
    dept: "Operations",
    email: "zameer.k@enterprise.co",
    phone: "9880556677",
    salary: 75000,
    type: "Full-Time",
    joined: "2020-11-12",
    status: "Present",
    leavesTaken: 4,
    avatar: "ZK",
  },
  {
    id: 6,
    name: "Divya Nair",
    role: "Finance & Accounts Specialist",
    dept: "Finance & HR",
    email: "divya.n@enterprise.co",
    phone: "9448119922",
    salary: 95000,
    type: "Full-Time",
    joined: "2024-02-01",
    status: "Present",
    leavesTaken: 0,
    avatar: "DN",
  },
];

const INITIAL_LEAVES = [
  {
    id: 101,
    employeeId: 3,
    name: "Rohan Shenoy",
    dept: "Operations",
    type: "Casual Leave",
    dates: "20 Nov – 22 Nov 2026 (3 days)",
    reason: "Attending family event out of city.",
    status: "Approved",
  },
  {
    id: 102,
    employeeId: 2,
    name: "Pooja Hegde",
    dept: "Design & Architecture",
    type: "Sick Leave",
    dates: "25 Nov 2026 (1 day)",
    reason: "Medical consultation & dental procedure.",
    status: "Pending",
  },
  {
    id: 103,
    employeeId: 5,
    name: "Zameer Khan",
    dept: "Operations",
    type: "Annual Leave",
    dates: "02 Dec – 06 Dec 2026 (5 days)",
    reason: "Annual vacation trip with family.",
    status: "Pending",
  },
];

export default function HRMS({ shared }) {
  const [employees, setEmployees] = useState(() => {
    try {
      const saved = localStorage.getItem("hrms-employees-data");
      return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
    } catch {
      return INITIAL_EMPLOYEES;
    }
  });

  const [leaves, setLeaves] = useState(() => {
    try {
      const saved = localStorage.getItem("hrms-leaves-data");
      return saved ? JSON.parse(saved) : INITIAL_LEAVES;
    } catch {
      return INITIAL_LEAVES;
    }
  });

  const [view, setView] = useState("directory"); // directory | attendance | leaves | payroll
  const [deptFilter, setDeptFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [newEmpModal, setNewEmpModal] = useState(false);
  const [applyLeaveModal, setApplyLeaveModal] = useState(false);
  const [payslipModal, setPayslipModal] = useState(null); // holds selected employee
  const [clockedIn, setClockedIn] = useState(false);
  const [clockTime, setClockTime] = useState(null);

  // Persistence
  useEffect(() => {
    try {
      localStorage.setItem("hrms-employees-data", JSON.stringify(employees));
    } catch {}
  }, [employees]);

  useEffect(() => {
    try {
      localStorage.setItem("hrms-leaves-data", JSON.stringify(leaves));
    } catch {}
  }, [leaves]);

  const money = (val) => "₹" + (+val || 0).toLocaleString("en-IN");

  // Metrics
  const totalPayroll = useMemo(() => employees.reduce((acc, e) => acc + (+e.salary || 0), 0), [employees]);
  const presentCount = useMemo(() => employees.filter((e) => e.status === "Present").length, [employees]);
  const onLeaveCount = useMemo(() => employees.filter((e) => e.status === "On Leave").length, [employees]);
  const pendingLeaves = useMemo(() => leaves.filter((l) => l.status === "Pending").length, [leaves]);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      const matchDept = deptFilter === "All" || e.dept === deptFilter;
      const matchSearch =
        (e.name + " " + e.role + " " + e.dept + " " + e.email)
          .toLowerCase()
          .includes(search.toLowerCase());
      return matchDept && matchSearch;
    });
  }, [employees, deptFilter, search]);

  const [newEmp, setNewEmp] = useState({
    name: "",
    role: "",
    dept: "Engineering",
    email: "",
    phone: "",
    salary: "",
    type: "Full-Time",
  });

  const [newLeave, setNewLeave] = useState({
    name: "",
    type: "Casual Leave",
    dates: "",
    reason: "",
  });

  const handleAddEmployee = (e) => {
    e.preventDefault();
    if (!newEmp.name || !newEmp.role) return alert("Please fill employee name and designation.");
    const emp = {
      id: Date.now(),
      ...newEmp,
      salary: +newEmp.salary || 50000,
      joined: new Date().toISOString().slice(0, 10),
      status: "Present",
      leavesTaken: 0,
      avatar: newEmp.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    };
    setEmployees([emp, ...employees]);
    setNewEmpModal(false);
    setNewEmp({
      name: "",
      role: "",
      dept: "Engineering",
      email: "",
      phone: "",
      salary: "",
      type: "Full-Time",
    });
  };

  const handleApplyLeave = (e) => {
    e.preventDefault();
    if (!newLeave.name || !newLeave.dates) return alert("Please specify employee and dates.");
    const req = {
      id: Date.now(),
      employeeId: Date.now(),
      ...newLeave,
      dept: employees.find((x) => x.name.toLowerCase() === newLeave.name.toLowerCase())?.dept || "Operations",
      status: "Pending",
    };
    setLeaves([req, ...leaves]);
    setApplyLeaveModal(false);
    setNewLeave({ name: "", type: "Casual Leave", dates: "", reason: "" });
  };

  const handleLeaveDecision = (leaveId, decision) => {
    setLeaves(leaves.map((l) => (l.id === leaveId ? { ...l, status: decision } : l)));
  };

  const togglePunch = () => {
    if (!clockedIn) {
      setClockedIn(true);
      setClockTime(new Date().toLocaleTimeString());
    } else {
      setClockedIn(false);
      setClockTime(null);
    }
  };

  // Salary calculations
  const calculateSalarySlip = (emp) => {
    const gross = emp.salary;
    const basic = Math.round(gross * 0.5);
    const hra = Math.round(gross * 0.3);
    const allowance = gross - basic - hra;
    const pf = Math.round(basic * 0.12);
    const pt = 200;
    const totalDeductions = pf + pt;
    const net = gross - totalDeductions;
    return { gross, basic, hra, allowance, pf, pt, totalDeductions, net };
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-amber-500 selection:text-black">
      {/* LUXURY TOP NAV */}
      <header className="sticky top-0 z-30 border-b border-amber-500/20 bg-[#07090e]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500/10 to-amber-600/20 border border-amber-500/30 px-3 py-1.5 text-xs font-semibold text-amber-300 transition hover:border-amber-400 hover:text-white"
            >
              <span>← All Apps Hub</span>
            </a>
            <div className="h-4 w-px bg-slate-800" />
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-base shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                👥
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold tracking-tight text-white text-base">
                    Nexus HRMS <span className="text-indigo-400 font-serif italic text-sm">Enterprise</span>
                  </span>
                  <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-400 border border-indigo-500/30">
                    Payroll & Staff
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">Workforce Intelligence, Leaves & Automated Payroll</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setNewEmpModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-xs font-extrabold text-white shadow-lg shadow-indigo-500/20 transition hover:brightness-110 active:scale-95"
            >
              <span className="text-base font-bold leading-none">+</span> Add Employee
            </button>
            <button
              onClick={() => setApplyLeaveModal(true)}
              className="hidden sm:flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
            >
              <span>Apply Leave</span>
            </button>
          </div>
        </div>

        {/* METRICS STRIP */}
        <div className="border-t border-white/5 bg-[#0b0e17]/80 px-4 py-2.5 sm:px-6">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <span className="text-slate-400">Total Workforce: </span>
                <span className="font-bold text-white text-sm">{employees.length} Staff</span>
              </div>
              <div className="h-3 w-px bg-white/10" />
              <div>
                <span className="text-slate-400">On Duty Today: </span>
                <span className="font-bold text-emerald-400 text-sm">{presentCount} Active</span>
              </div>
              <div className="h-3 w-px bg-white/10" />
              <div>
                <span className="text-slate-400">On Leave: </span>
                <span className="font-bold text-amber-400 text-sm">{onLeaveCount}</span>
              </div>
              <div className="h-3 w-px bg-white/10" />
              <div>
                <span className="text-slate-400">Monthly Payroll: </span>
                <span className="font-bold text-indigo-400 text-sm tracking-wide">{money(totalPayroll)}</span>
              </div>
            </div>

            {/* View tabs */}
            <div className="flex items-center gap-1 rounded-xl bg-black/40 p-1 border border-white/10">
              {[
                { id: "directory", label: "Directory", icon: "👥" },
                { id: "attendance", label: "Live Shift & Punch", icon: "⏱" },
                { id: "leaves", label: `Leaves (${pendingLeaves})`, icon: "📅" },
                { id: "payroll", label: "Salary & Slips", icon: "💳" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setView(tab.id)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-medium transition ${
                    view === tab.id
                      ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* FILTER & SEARCH BAR */}
      <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6">
        <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#0e121d]/70 p-3 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search staff by name, role, department or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/50 py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs text-slate-400 shrink-0">Dept:</span>
            {DEPARTMENTS.map((d) => (
              <button
                key={d}
                onClick={() => setDeptFilter(d)}
                className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  deptFilter === d
                    ? "bg-indigo-600 text-white border border-indigo-400/30"
                    : "bg-white/5 text-slate-400 hover:bg-white/10"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="mx-auto max-w-7xl p-4 sm:p-6">
        {/* VIEW 1: STAFF DIRECTORY */}
        {view === "directory" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEmployees.map((emp) => (
              <div
                key={emp.id}
                className="group rounded-2xl border border-white/10 bg-[#0e121d] p-5 shadow-xl transition-all duration-200 hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-indigo-500/10"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 font-extrabold text-white text-base shadow-md">
                      {emp.avatar}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-white text-base group-hover:text-indigo-300 transition-colors">
                        {emp.name}
                      </h3>
                      <p className="text-xs text-slate-400">{emp.role}</p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                      emp.status === "Present"
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                        : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {emp.status}
                  </span>
                </div>

                <div className="mt-4 space-y-1.5 border-t border-white/5 pt-3 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Department:</span>
                    <span className="font-medium text-slate-200">{emp.dept}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Monthly Compensation:</span>
                    <span className="font-bold text-amber-400">{money(emp.salary)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Contact:</span>
                    <a href={`tel:${emp.phone}`} className="font-mono text-slate-300 hover:text-indigo-400">
                      {emp.phone}
                    </a>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tenure Since:</span>
                    <span className="text-slate-400">{emp.joined}</span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setPayslipModal(emp)}
                    className="flex-1 rounded-xl bg-indigo-600/20 border border-indigo-500/30 py-2 text-center text-xs font-bold text-indigo-300 hover:bg-indigo-600/40"
                  >
                    📄 View Pay Slip
                  </button>
                  <a
                    href={`https://wa.me/91${emp.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${emp.name}, touchbase from HR.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center text-xs font-semibold text-slate-300 hover:bg-white/10"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VIEW 2: LIVE ATTENDANCE & SHIFT CLOCK */}
        {view === "attendance" && (
          <div className="space-y-6">
            {/* Shift punch console */}
            <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 to-black/60 p-6 shadow-2xl backdrop-blur-md">
              <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                <div>
                  <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-400">
                    🟢 Shift Clock Terminal
                  </span>
                  <h2 className="mt-3 text-2xl font-black text-white">Daily Attendance Simulator</h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Simulate employee punch-in, geo-verified shift logging, and overtime computation.
                  </p>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={togglePunch}
                    className={`rounded-2xl px-8 py-3.5 text-sm font-extrabold shadow-xl transition-all active:scale-95 ${
                      clockedIn
                        ? "bg-red-500 hover:bg-red-400 text-white shadow-red-500/30"
                        : "bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/30"
                    }`}
                  >
                    {clockedIn ? "🔴 Clock Out (End Shift)" : "⏱ Clock In (Start Shift)"}
                  </button>
                  {clockedIn && (
                    <div className="text-xs text-emerald-300 font-mono">
                      Shift active since {clockTime}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Attendance Roster Table */}
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0c101a] shadow-xl">
              <div className="border-b border-white/10 bg-white/5 px-5 py-3.5">
                <h3 className="font-bold text-sm text-white">Today's Staff Check-in Roster</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-white/10 bg-black/40 uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-4 py-3 font-bold">Staff Member</th>
                      <th className="px-4 py-3 font-bold">Department</th>
                      <th className="px-4 py-3 font-bold">Check In</th>
                      <th className="px-4 py-3 font-bold">Shift Hours</th>
                      <th className="px-4 py-3 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {employees.map((e, idx) => (
                      <tr key={e.id} className="hover:bg-white/5">
                        <td className="px-4 py-3 font-semibold text-white">
                          <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600/40 text-[10px] font-bold">
                              {e.avatar}
                            </span>
                            {e.name}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-300">{e.dept}</td>
                        <td className="px-4 py-3 font-mono text-slate-400">
                          {e.status === "Present" ? `09:${15 + idx * 5} AM` : "—"}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-300">
                          {e.status === "Present" ? "7 hrs 45 mins" : "0 hrs"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                              e.status === "Present"
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                                : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                            }`}
                          >
                            {e.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: LEAVE MANAGEMENT */}
        {view === "leaves" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-lg text-white">Leave Application Requests</h3>
                <p className="text-xs text-slate-400">Review, approve or reject staff time-off requests</p>
              </div>
              <button
                onClick={() => setApplyLeaveModal(true)}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500"
              >
                + Request Leave
              </button>
            </div>

            <div className="grid gap-3">
              {leaves.map((l) => (
                <div
                  key={l.id}
                  className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#0e121d] p-4 shadow-md sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{l.name}</span>
                      <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-slate-400">
                        {l.dept}
                      </span>
                      <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold text-indigo-300">
                        {l.type}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-amber-400">{l.dates}</div>
                    <p className="text-xs text-slate-400">“{l.reason}”</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {l.status === "Pending" ? (
                      <>
                        <button
                          onClick={() => handleLeaveDecision(l.id, "Approved")}
                          className="rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/40"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => handleLeaveDecision(l.id, "Rejected")}
                          className="rounded-xl bg-red-500/20 border border-red-500/40 px-3 py-1.5 text-xs font-bold text-red-300 hover:bg-red-500/40"
                        >
                          ✕ Reject
                        </button>
                      </>
                    ) : (
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-bold ${
                          l.status === "Approved"
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                            : "border-red-500/30 bg-red-500/10 text-red-400"
                        }`}
                      >
                        {l.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 4: PAYROLL & SALARY */}
        {view === "payroll" && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-[#0e121d] p-5">
                <div className="text-xs text-slate-400 uppercase font-semibold">Total Monthly Gross</div>
                <div className="mt-2 text-3xl font-black text-amber-400">{money(totalPayroll)}</div>
                <div className="mt-1 text-xs text-slate-400">Total salary disbursed</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#0e121d] p-5">
                <div className="text-xs text-slate-400 uppercase font-semibold">PF Deductions Managed</div>
                <div className="mt-2 text-3xl font-black text-indigo-400">
                  {money(Math.round(totalPayroll * 0.5 * 0.12))}
                </div>
                <div className="mt-1 text-xs text-slate-400">Compliant Statutory Provident Fund</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#0e121d] p-5">
                <div className="text-xs text-slate-400 uppercase font-semibold">Net Bank Transfer Total</div>
                <div className="mt-2 text-3xl font-black text-emerald-400">
                  {money(Math.round(totalPayroll * 0.94))}
                </div>
                <div className="mt-1 text-xs text-slate-400">Net salary to employee accounts</div>
              </div>
            </div>

            {/* Salary Register */}
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0c101a] shadow-xl">
              <div className="border-b border-white/10 bg-white/5 px-5 py-3.5">
                <h3 className="font-bold text-sm text-white">Monthly Salary Register & Slips</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-white/10 bg-black/40 uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-4 py-3 font-bold">Employee</th>
                      <th className="px-4 py-3 font-bold">Gross CTC</th>
                      <th className="px-4 py-3 font-bold">Basic (50%)</th>
                      <th className="px-4 py-3 font-bold">HRA (30%)</th>
                      <th className="px-4 py-3 font-bold">PF Deduction</th>
                      <th className="px-4 py-3 font-bold text-right">Net Payable</th>
                      <th className="px-4 py-3 font-bold text-center">Pay Slip</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {employees.map((emp) => {
                      const s = calculateSalarySlip(emp);
                      return (
                        <tr key={emp.id} className="hover:bg-white/5">
                          <td className="px-4 py-3 font-semibold text-white">
                            <div>{emp.name}</div>
                            <div className="text-[10px] text-slate-500">{emp.role}</div>
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-200">{money(s.gross)}</td>
                          <td className="px-4 py-3 text-slate-400">{money(s.basic)}</td>
                          <td className="px-4 py-3 text-slate-400">{money(s.hra)}</td>
                          <td className="px-4 py-3 text-red-400">-{money(s.pf)}</td>
                          <td className="px-4 py-3 text-right font-extrabold text-emerald-400">
                            {money(s.net)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => setPayslipModal(emp)}
                              className="rounded-lg bg-indigo-600/30 border border-indigo-500/40 px-3 py-1 text-[11px] font-bold text-indigo-300 hover:bg-indigo-600/50"
                            >
                              Generate Slip
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: SALARY PAY SLIP (PRINTABLE) */}
      {payslipModal && (() => {
        const s = calculateSalarySlip(payslipModal);
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
            onClick={() => setPayslipModal(null)}
          >
            <div
              className="w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white text-slate-900 p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between border-b pb-4">
                <div>
                  <div className="font-black text-xl tracking-tight uppercase">{OWNER.name || "ENTERPRISE CORP"}</div>
                  <div className="text-xs text-slate-500">Official Monthly Confidential Pay Slip</div>
                </div>
                <div className="text-right">
                  <span className="rounded bg-slate-900 text-white px-2.5 py-1 text-xs font-bold">
                    November 2026
                  </span>
                </div>
              </div>

              {/* Employee Summary */}
              <div className="mt-4 grid grid-cols-2 gap-3 bg-slate-50 rounded-xl p-3 text-xs">
                <div>
                  <span className="text-slate-500">Employee Name:</span>
                  <div className="font-bold text-slate-900 text-sm">{payslipModal.name}</div>
                </div>
                <div>
                  <span className="text-slate-500">Designation:</span>
                  <div className="font-semibold text-slate-800">{payslipModal.role}</div>
                </div>
                <div>
                  <span className="text-slate-500">Department:</span>
                  <div className="font-semibold text-slate-800">{payslipModal.dept}</div>
                </div>
                <div>
                  <span className="text-slate-500">Employment Type:</span>
                  <div className="font-semibold text-slate-800">{payslipModal.type}</div>
                </div>
              </div>

              {/* Earnings & Deductions Breakdown */}
              <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                {/* Earnings */}
                <div className="border rounded-xl p-3 space-y-2">
                  <div className="font-bold text-emerald-800 uppercase tracking-wider text-[11px] border-b pb-1">
                    Earnings
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Basic Pay</span>
                    <span className="font-semibold">{money(s.basic)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">House Rent Allowance</span>
                    <span className="font-semibold">{money(s.hra)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Special Allowance</span>
                    <span className="font-semibold">{money(s.allowance)}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-1.5 text-slate-900">
                    <span>Gross Earnings</span>
                    <span>{money(s.gross)}</span>
                  </div>
                </div>

                {/* Deductions */}
                <div className="border rounded-xl p-3 space-y-2">
                  <div className="font-bold text-red-800 uppercase tracking-wider text-[11px] border-b pb-1">
                    Deductions
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Provident Fund (PF)</span>
                    <span className="font-semibold">{money(s.pf)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Professional Tax (PT)</span>
                    <span className="font-semibold">{money(s.pt)}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-1.5 text-red-600">
                    <span>Total Deductions</span>
                    <span>{money(s.totalDeductions)}</span>
                  </div>
                </div>
              </div>

              {/* Net Pay Total Box */}
              <div className="mt-4 rounded-xl bg-slate-900 p-4 text-white flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-bold">Net Take Home Pay</div>
                  <div className="text-2xl font-black text-emerald-400">{money(s.net)}</div>
                </div>
                <div className="text-xs text-slate-400 text-right">
                  Direct Bank Transfer<br />Status: Completed
                </div>
              </div>

              {/* Signatures */}
              <div className="mt-8 flex justify-between items-end border-t pt-4 text-xs text-slate-500">
                <div>
                  <div className="h-6" />
                  <div className="border-t border-slate-300 pt-1">Employee Signature</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-800">Authorized Signatory</div>
                  <div className="border-t border-slate-300 pt-1 mt-6">HR & Payroll Dept</div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
                >
                  🖨 Print / Save PDF
                </button>
                <button
                  onClick={() => setPayslipModal(null)}
                  className="flex-1 rounded-xl border border-slate-300 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL: ADD EMPLOYEE */}
      {newEmpModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setNewEmpModal(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0f1422] p-6 text-slate-100 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-lg text-white">Add Team Member</h3>
              <button onClick={() => setNewEmpModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddEmployee} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={newEmp.name}
                  onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-black/50 p-2.5 text-white outline-none focus:border-indigo-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Role / Designation *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Architect"
                    value={newEmp.role}
                    onChange={(e) => setNewEmp({ ...newEmp, role: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/50 p-2.5 text-white outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Department</label>
                  <select
                    value={newEmp.dept}
                    onChange={(e) => setNewEmp({ ...newEmp, dept: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/50 p-2.5 text-white outline-none"
                  >
                    {DEPARTMENTS.filter((d) => d !== "All").map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="rahul@example.com"
                    value={newEmp.email}
                    onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/50 p-2.5 text-white outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Phone</label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={newEmp.phone}
                    onChange={(e) => setNewEmp({ ...newEmp, phone: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/50 p-2.5 text-white outline-none focus:border-indigo-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Monthly Gross CTC (₹)</label>
                <input
                  type="number"
                  placeholder="85000"
                  value={newEmp.salary}
                  onChange={(e) => setNewEmp({ ...newEmp, salary: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-black/50 p-2.5 text-white outline-none focus:border-indigo-400"
                />
              </div>

              <div className="mt-4 flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewEmpModal(false)}
                  className="flex-1 rounded-xl border border-white/10 py-2.5 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-2.5 font-bold text-white shadow-lg shadow-indigo-500/20"
                >
                  Confirm Addition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: APPLY LEAVE */}
      {applyLeaveModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setApplyLeaveModal(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0f1422] p-6 text-slate-100 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-lg text-white">Apply for Leave</h3>
              <button onClick={() => setApplyLeaveModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleApplyLeave} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Staff Member *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pooja Hegde"
                  value={newLeave.name}
                  onChange={(e) => setNewLeave({ ...newLeave, name: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-black/50 p-2.5 text-white outline-none focus:border-indigo-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Leave Type</label>
                  <select
                    value={newLeave.type}
                    onChange={(e) => setNewLeave({ ...newLeave, type: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/50 p-2.5 text-white outline-none"
                  >
                    <option>Casual Leave</option>
                    <option>Sick Leave</option>
                    <option>Annual Leave</option>
                    <option>Privilege Leave</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Dates / Duration *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 28 Nov – 30 Nov (3 days)"
                    value={newLeave.dates}
                    onChange={(e) => setNewLeave({ ...newLeave, dates: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/50 p-2.5 text-white outline-none focus:border-indigo-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Reason for Absence</label>
                <textarea
                  rows={2}
                  placeholder="Short explanation for management approval..."
                  value={newLeave.reason}
                  onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-black/50 p-2.5 text-white outline-none focus:border-indigo-400"
                />
              </div>

              <div className="mt-4 flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setApplyLeaveModal(false)}
                  className="flex-1 rounded-xl border border-white/10 py-2.5 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-indigo-600 py-2.5 font-bold text-white hover:bg-indigo-500"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
