import React from "react";
import {
  ArrowRight,
  CheckCircle2,
  Users,
  Building2,
  Clock,
  XCircle,
  AlertCircle,
  Star,
  FileText,
  BadgeCheck,
  Share2,
  Upload,
  BarChart,
  QrCode,
  Smartphone,
  ChevronRight,
  Search,
  MousePointer2,
  Settings2
} from "lucide-react";
import { Logo, cn } from "./_shared";
import { motion } from "motion/react";

type Props = { onNav: (s: string) => void };

function Nav({ onNav }: Props) {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Logo inverted />
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#scale" className="hover:text-white transition-colors">Built for India</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </nav>
        <div className="flex items-center gap-4">
          <button onClick={() => onNav("login")} className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            Log in
          </button>
          <button
            onClick={() => onNav("register")}
            className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-all shadow-sm shadow-primary/20"
          >
            Start Free
          </button>
        </div>
      </div>
    </header>
  );
}

function SocialProof() {
  return (
    <div className="border-t border-white/5 bg-gray-950/50 py-10 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)]" />
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-8">
          The backend for India's premier wedding planners
        </p>
        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
          <span className="text-xl font-serif font-bold text-white">ShaadiSquad</span>
          <span className="text-xl font-serif italic text-white">WedGuruz</span>
          <span className="text-xl font-sans font-black tracking-tighter text-white">EVENTCRAFTERS</span>
          <span className="text-xl font-serif text-white">The Royal Knot</span>
          <span className="text-xl font-sans font-bold tracking-widest text-white">VOWS &amp; CO.</span>
        </div>
      </div>
    </div>
  );
}

function HeroMockup() {
  const rows = [
    { name: "Priya Sharma", contact: "+91 98765 43210", room: "201", status: "Checked In", vip: true },
    { name: "Rohan Mehta", contact: "+91 99887 76655", room: "202", status: "Not Arrived", vip: false },
    { name: "Anil Kapoor", contact: "+91 91234 56789", room: "205", status: "Checked In", vip: true },
    { name: "Vikram Singh", contact: "+91 98123 45678", room: "204", status: "Not Coming", vip: false },
  ];

  return (
    <div className="relative w-full max-w-4xl mx-auto mt-16 rounded-xl border border-white/10 bg-[#0A0A0A] shadow-[0_0_80px_-20px_rgba(22,163,74,0.3)] overflow-hidden">
      {/* Mac-like header */}
      <div className="flex items-center justify-between px-4 h-12 border-b border-white/10 bg-white/5">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-amber-500/80" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
        </div>
        <div className="text-[11px] font-mono text-gray-400 flex items-center gap-2">
          InviteSheet <span className="text-gray-600">/</span> Sharma-Mehta Wedding
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center bg-white/5 border border-white/10 rounded-md px-2 py-1 text-[11px] text-gray-400">
            <Search className="w-3 h-3 mr-1" /> Search guest...
          </div>
          <div className="flex -space-x-2">
            <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-[10px] text-primary z-30">S</div>
            <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-[10px] text-blue-400 z-20">P</div>
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-[10px] text-emerald-400 z-10">A</div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="px-4 py-2 border-b border-white/10 flex gap-4 text-[12px] font-medium text-gray-400 bg-white/[0.02] overflow-x-auto hide-scrollbar">
        <span className="text-white bg-white/10 px-3 py-1 rounded-md shadow-sm border border-white/5 whitespace-nowrap">All Guests (850)</span>
        <span className="hover:text-white px-3 py-1 cursor-pointer transition-colors whitespace-nowrap">Bride Side</span>
        <span className="hover:text-white px-3 py-1 cursor-pointer transition-colors whitespace-nowrap">Groom Side</span>
        <span className="hover:text-white px-3 py-1 cursor-pointer transition-colors whitespace-nowrap">Hotel Allotment</span>
      </div>

      {/* Counters */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3 overflow-x-auto hide-scrollbar">
        {[
          { label: "Total", val: 850, col: "text-gray-300" },
          { label: "Checked In", val: 412, col: "text-emerald-400" },
          { label: "Not Arrived", val: 400, col: "text-amber-400" },
          { label: "IDs Pending", val: 86, col: "text-red-400" },
        ].map(c => (
          <div key={c.label} className="flex items-baseline gap-2 bg-white/5 border border-white/5 rounded-md px-3 py-1.5 whitespace-nowrap">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{c.label}</span>
            <span className={cn("text-sm font-mono font-bold", c.col)}>{c.val}</span>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="w-full overflow-hidden">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02]">
              <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-12">#</th>
              <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Guest</th>
              <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Room</th>
              <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {rows.map((r, i) => (
              <motion.tr 
                key={i} 
                className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.3 }}
              >
                <td className="px-4 py-3 text-gray-600 font-mono text-[12px]">{i + 1}</td>
                <td className="px-4 py-3 text-gray-200 font-medium flex items-center gap-2">
                  {r.name}
                  {r.vip && <Star className="w-3.5 h-3.5 text-purple-400 fill-purple-400" />}
                </td>
                <td className="px-4 py-3 text-gray-400 font-mono text-[12px]">{r.contact}</td>
                <td className="px-4 py-3 text-gray-400">
                  <span className="bg-white/5 border border-white/10 rounded px-2 py-0.5 text-[12px]">{r.room}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold border",
                    r.status === "Checked In" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    r.status === "Not Arrived" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                    "bg-red-500/10 text-red-400 border-red-500/20"
                  )}>
                    {r.status === "Checked In" && <CheckCircle2 className="w-3 h-3" />}
                    {r.status}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Hero({ onNav }: Props) {
  return (
    <section className="relative pt-32 pb-10 lg:pt-40 lg:pb-20 overflow-hidden bg-gray-950">
      {/* Background Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 blur-[120px] rounded-full opacity-50" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-[12px] font-semibold text-gray-300 mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Designed exclusively for B2B Event Management
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] max-w-5xl mx-auto">
            Tame the 5,000-Guest <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-primary">Check-In Chaos.</span>
          </h1>
          <p className="mt-8 text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Stop running massive Indian weddings on fractured Excel sheets and chaotic WhatsApp groups. InviteSheet gives your team a real-time, synchronized command center.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => onNav("register")}
              className="px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-[0_0_30px_-5px_rgba(22,163,74,0.5)] flex items-center gap-2 w-full sm:w-auto justify-center text-lg"
            >
              Start Your Free Event <ArrowRight className="w-5 h-5" />
            </button>
            <a
              href="#features"
              className="px-8 py-4 bg-white/5 text-white font-bold rounded-xl border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2 w-full sm:w-auto justify-center text-lg"
            >
              Explore Features
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <HeroMockup />
        </motion.div>
      </div>

      <SocialProof />

      {/* Marquee */}
      <div className="mt-8 border-t border-b border-white/10 bg-white/5 py-4 overflow-hidden whitespace-nowrap flex relative">
        <motion.div 
          className="flex gap-16 items-center text-gray-400 text-sm font-bold tracking-widest uppercase"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <React.Fragment key={i}>
              <span>10,000+ Guest Capacity</span>
              <span className="w-1.5 h-1.5 bg-primary rounded-full" />
              <span>Zero-Latency Sync</span>
              <span className="w-1.5 h-1.5 bg-primary rounded-full" />
              <span>VIP Protocol</span>
              <span className="w-1.5 h-1.5 bg-primary rounded-full" />
              <span>Mobile Gate Check-In</span>
              <span className="w-1.5 h-1.5 bg-primary rounded-full" />
              <span>Room Assignments</span>
              <span className="w-1.5 h-1.5 bg-primary rounded-full" />
            </React.Fragment>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function BentoFeatures() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mb-16">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 mb-6">
            Excel wasn't built for the groom's side <br className="hidden md:block"/> changing their minds at 2 AM.
          </h2>
          <p className="text-lg text-gray-600">
            InviteSheet is engineered for the unique structural complexity of Indian events. 
            From tracking VIP protocol to managing separate family lists seamlessly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[320px]">
          {/* Card 1: Live Sync */}
          <div className="md:col-span-2 bg-gray-50 border border-gray-200 rounded-3xl p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Share2 className="w-32 h-32 text-primary" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row h-full gap-8">
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-white rounded-xl border border-gray-200 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                    <Share2 className="w-6 h-6 text-gray-900" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Zero-Latency Sync</h3>
                  <p className="text-gray-600 max-w-md leading-relaxed">
                    Reception team checks someone in, and the hospitality team sees it instantly. No refreshing, no overlapping edits, no lost data.
                  </p>
                </div>
              </div>
              
              {/* Animated Mini visual */}
              <div className="flex-1 flex items-center justify-center relative">
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm w-full max-w-sm relative z-10">
                  <div className="flex flex-col gap-3">
                    <div className="h-4 w-1/3 bg-gray-100 rounded" />
                    <div className="h-4 w-full bg-gray-50 rounded" />
                    <div className="flex items-center gap-3 mt-2 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100/50">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">P</div>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                      </div>
                      <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                        Priya editing row 42 
                        <motion.span 
                          animate={{ opacity: [0, 1, 0] }} 
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="w-1 h-4 bg-emerald-500 block" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating cursor */}
                <motion.div 
                  className="absolute z-20 text-blue-500"
                  animate={{ x: [0, 20, -10, 0], y: [0, -10, 20, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <MousePointer2 className="w-6 h-6 drop-shadow-md fill-blue-500" />
                  <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full rounded-tl-none absolute top-5 left-5 shadow-sm">Rohan</span>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Card 2: Counters */}
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Live Counters</h3>
              <p className="text-gray-400">Never guess who's missing.</p>
            </div>
            <div className="space-y-3 relative z-10">
              <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex justify-between items-center group-hover:border-emerald-500/30 transition-colors">
                <span className="text-sm text-gray-300">Checked In</span>
                <motion.span 
                  className="text-lg font-bold text-emerald-400 font-mono"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >1,042</motion.span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex justify-between items-center group-hover:border-amber-500/30 transition-colors">
                <span className="text-sm text-gray-300">Not Arrived</span>
                <span className="text-lg font-bold text-amber-400 font-mono">318</span>
              </div>
            </div>
          </div>

          {/* Card 3: Mobile Check-in */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-8 relative overflow-hidden group">
            <div className="w-12 h-12 bg-white rounded-xl border border-emerald-200 flex items-center justify-center mb-6 shadow-sm relative z-10 group-hover:scale-110 transition-transform">
              <Smartphone className="w-6 h-6 text-emerald-700" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2 relative z-10">Mobile Check-In</h3>
            <p className="text-emerald-900/70 relative z-10">Optimized for phones at the gate. Fast search, one-tap check-in, smooth flow.</p>
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-emerald-200 rounded-full blur-3xl opacity-50" />
            
            {/* Phone bezel visual */}
            <div className="absolute -bottom-16 right-4 w-32 h-40 bg-white rounded-t-2xl border-4 border-gray-900 shadow-xl p-2 flex flex-col gap-2 transform rotate-12 group-hover:rotate-6 group-hover:-translate-y-4 transition-all duration-500">
              <div className="w-8 h-1 bg-gray-200 rounded-full mx-auto" />
              <div className="w-full h-8 bg-gray-100 rounded-lg mt-2 flex items-center px-2">
                <Search className="w-3 h-3 text-gray-400" />
              </div>
              <div className="w-full h-12 bg-emerald-50 rounded-lg border border-emerald-100 flex items-center justify-between px-2">
                <div className="w-12 h-2 bg-emerald-200 rounded" />
                <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center"><CheckCircle2 className="w-3 h-3 text-white" /></div>
              </div>
            </div>
          </div>

          {/* Card 4: VIP & ID */}
          <div className="md:col-span-2 bg-gray-50 border border-gray-200 rounded-3xl p-8 relative overflow-hidden group">
            <div className="relative z-10 flex flex-col md:flex-row h-full gap-8">
              <div className="flex-1">
                <div className="w-12 h-12 bg-white rounded-xl border border-gray-200 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  <Star className="w-6 h-6 text-gray-900" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">VIP & Protocol Tracking</h3>
                <p className="text-gray-600 leading-relaxed">
                  Tag VIPs, track ID submissions for hotels, and sort by Groom/Bride side instantly.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-md text-sm font-semibold border border-purple-200 shadow-sm">VIP Arrival</span>
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-md text-sm font-semibold border border-amber-200 shadow-sm">ID Pending</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm font-semibold border border-blue-200 shadow-sm">Groom Side</span>
                </div>
              </div>
              <div className="hidden md:flex flex-1 items-center justify-center relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-100/50 to-transparent blur-xl" />
                {/* Abstract visualization */}
                <div className="w-full max-w-[200px] space-y-3 relative z-10">
                  {[1,2,3].map((i) => (
                    <motion.div 
                      key={i} 
                      className={cn(
                        "h-12 bg-white rounded-xl border shadow-sm flex items-center px-3 gap-3 transition-colors",
                        i === 2 ? "border-purple-200 bg-purple-50/50 scale-105 shadow-md" : "border-gray-200"
                      )}
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className={cn(
                        "w-7 h-7 rounded-md flex items-center justify-center",
                        i === 2 ? "bg-purple-100" : "bg-gray-100"
                      )}>
                        {i === 2 ? <Star className="w-4 h-4 text-purple-600 fill-purple-500" /> : <div className="w-4 h-4 rounded-full bg-gray-300" />}
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <div className={cn("h-2 rounded-full", i === 2 ? "bg-purple-200 w-full" : "bg-gray-200 w-3/4")} />
                        <div className={cn("h-1.5 rounded-full w-1/2", i === 2 ? "bg-purple-200/50" : "bg-gray-100")} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

function ScaleSection() {
  return (
    <section id="scale" className="py-24 bg-gray-900 text-white border-y border-gray-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 leading-tight">
              Built for the gravity of <br/> Indian Scale.
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              A 50-person western wedding is easy. A 3-day, 2,000-guest Indian wedding with 4 venues and dynamic room assignments requires industrial-strength tooling.
            </p>
            <ul className="space-y-4">
              {[
                "Handles 10,000+ row spreadsheets without lagging",
                "Works seamlessly on 4G networks at venue gates",
                "Export perfectly formatted lists for hotel receptions instantly",
                "Invite your entire agency staff at no extra per-seat cost"
              ].map(t => (
                <li key={t} className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                  <span className="text-gray-300">{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full" />
            <div className="relative grid grid-cols-2 gap-4">
              {[
                { n: "5M+", l: "Guests Managed", i: Users },
                { n: "0s", l: "Sync Latency", i: Clock },
                { n: "10k", l: "Rows per Sheet", i: FileText },
                { n: "99.9%", l: "Uptime", i: Settings2 },
              ].map(s => (
                <div key={s.l} className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6 text-center hover:bg-gray-800 transition-colors">
                  <s.i className="w-6 h-6 text-gray-500 mx-auto mb-3" />
                  <div className="text-3xl font-black text-white mb-1">{s.n}</div>
                  <div className="text-sm font-medium text-gray-400 uppercase tracking-wide">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Pricing({ onNav }: Props) {
  return (
    <section id="pricing" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">Enterprise Power. <br className="sm:hidden"/> Simple Pricing.</h2>
          <p className="text-lg text-gray-600">No complicated tiers. Start free to test the waters, then move to our Agency plan when you're ready.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm flex flex-col">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Sandbox</h3>
            <p className="text-gray-500 mb-6">Perfect for your first small event to see how it works.</p>
            <div className="mb-8">
              <span className="text-5xl font-extrabold text-gray-900">₹0</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {["2 Events Maximum", "Up to 200 guests per event", "Real-time sync", "Basic Counters", "Standard Support"].map(f => (
                <li key={f} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-gray-400 shrink-0" />
                  <span className="text-gray-600">{f}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => onNav("register")}
              className="w-full py-4 rounded-xl font-bold text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors"
            >
              Start Free
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800 shadow-xl flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8">
              <span className="bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                For Agencies
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Agency Pro</h3>
            <p className="text-gray-400 mb-6">The complete toolkit for full-time event planners.</p>
            <div className="mb-8">
              <span className="text-5xl font-extrabold text-white">₹1,999</span>
              <span className="text-gray-400">/mo</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {[
                "Unlimited Events",
                "Unlimited Guests",
                "Unlimited Team Members",
                "Advanced VIP & ID Tracking",
                "Excel Import/Export",
                "Priority 24/7 Support"
              ].map(f => (
                <li key={f} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-gray-300">{f}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => onNav("register")}
              className="w-full py-4 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 transition-colors shadow-[0_0_20px_rgba(22,163,74,0.4)]"
            >
              Start 14-Day Free Trial
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer({ onNav }: Props) {
  return (
    <footer className="bg-white border-t border-gray-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div className="col-span-2 md:col-span-2">
            <Logo size="lg" />
            <p className="mt-4 text-gray-500 max-w-sm">
              The professional-grade spreadsheet and check-in system built explicitly for Indian event management agencies.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
            <ul className="space-y-3">
              <li><a href="#features" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Features</a></li>
              <li><a href="#scale" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Why Us</a></li>
              <li><a href="#pricing" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
            <ul className="space-y-3">
              <li><button onClick={() => onNav("login")} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Login</button></li>
              <li><button onClick={() => onNav("register")} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Register</button></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Contact Support</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-400">© 2026 InviteSheet. All rights reserved.</div>
          <div className="text-sm text-gray-400 flex items-center gap-2">
            Engineered for India <img src="https://flagcdn.com/w20/in.png" alt="India Flag" className="w-4 h-auto rounded-sm" />
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function Landing({ onNav }: Props) {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-primary/20">
      <Nav onNav={onNav} />
      <Hero onNav={onNav} />
      <BentoFeatures />
      <ScaleSection />
      <Pricing onNav={onNav} />
      <Footer onNav={onNav} />
    </div>
  );
}
