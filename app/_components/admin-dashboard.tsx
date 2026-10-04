"use client";

import useSWR from "swr";
import { Activity, ArrowUpRight, BarChart3, CheckCircle2, ClipboardList, LayoutDashboard, LogOut, Menu, Search, Settings2, ShieldCheck, Users, XCircle } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const supabase = createSupabaseBrowserClient();

async function fetchDashboard() {
  const [profiles, pending, attempts, examSets] = await Promise.all([
    supabase.from("profiles").select("id, full_name, display_name, role, verification_status, created_at").order("created_at", { ascending: false }).limit(8),
    supabase.from("verification_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("user_attempts").select("id", { count: "exact", head: true }),
    supabase.from("exam_sets").select("id", { count: "exact", head: true }),
  ]);
  if (profiles.error) throw profiles.error;
  return { profiles: profiles.data ?? [], pending: pending.count ?? 0, attempts: attempts.count ?? 0, examSets: examSets.count ?? 0 };
}

const navItems = [
  { label: "ภาพรวม", icon: LayoutDashboard, active: true },
  { label: "ผู้ใช้งาน", icon: Users },
  { label: "ชุดข้อสอบ", icon: ClipboardList },
  { label: "ผลการสอบ", icon: BarChart3 },
  { label: "ตรวจสอบตัวตน", icon: ShieldCheck },
];

export function AdminDashboard() {
  const { data, error, isLoading } = useSWR("admin-dashboard", fetchDashboard, { revalidateOnFocus: false });
  const profiles = data?.profiles ?? [];

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
          <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
            <div className="flex size-9 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">KP</div>
            <div><p className="font-semibold tracking-tight">K-Platform</p><p className="text-xs text-slate-400">Admin Console</p></div>
          </div>
          <nav className="flex flex-1 flex-col gap-1 p-4" aria-label="เมนูหลัก">
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">เมนูหลัก</p>
            {navItems.map(({ label, icon: Icon, active }) => <button key={label} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${active ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}><Icon className="size-4" />{label}</button>)}
            <p className="mb-2 mt-8 px-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">ตั้งค่า</p>
            <button className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900"><Settings2 className="size-4" />การตั้งค่าระบบ</button>
          </nav>
          <div className="border-t border-slate-100 p-4"><button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50"><LogOut className="size-4" />ออกจากระบบ</button></div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">
            <div className="flex items-center gap-3"><Button variant="ghost" size="icon" className="lg:hidden"><Menu /></Button><div><p className="text-sm text-slate-400">วันจันทร์ที่ 5 ตุลาคม 2569</p><h1 className="text-xl font-semibold tracking-tight">ภาพรวมระบบ</h1></div></div>
            <div className="flex items-center gap-3"><div className="relative hidden sm:block"><Search className="absolute left-3 top-2.5 size-4 text-slate-400" /><Input className="w-52 pl-9" placeholder="ค้นหา..." /></div><Avatar className="size-9"><AvatarFallback className="bg-slate-900 text-xs text-white">AD</AvatarFallback></Avatar></div>
          </header>

          <div className="mx-auto max-w-7xl p-5 sm:p-8">
            <div className="mb-7 flex items-end justify-between"><div><p className="text-sm text-slate-500">ยินดีต้อนรับกลับมา</p><h2 className="mt-1 text-2xl font-semibold tracking-tight">สรุปข้อมูลวันนี้</h2></div><Badge variant="outline" className="gap-1.5 bg-white py-1.5"><Activity className="size-3 text-emerald-500" />ระบบทำงานปกติ</Badge></div>
            {error && <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">ไม่สามารถโหลดข้อมูลจาก Supabase ได้ กรุณาตรวจสอบสิทธิ์ RLS ของตารางที่ใช้งาน</div>}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[{ label: "ผู้ใช้งานทั้งหมด", value: data?.profiles.length ?? 0, icon: Users, note: "รายการล่าสุด 8 รายการ" }, { label: "รอตรวจสอบตัวตน", value: data?.pending ?? 0, icon: ShieldCheck, note: "ต้องดำเนินการ" }, { label: "การสอบทั้งหมด", value: data?.attempts ?? 0, icon: ClipboardList, note: "จาก user_attempts" }, { label: "ชุดข้อสอบ", value: data?.examSets ?? 0, icon: BarChart3, note: "จาก exam_sets" }].map(({ label, value, icon: Icon, note }) => <Card key={label} className="border-slate-200 shadow-none"><CardContent className="p-5"><div className="flex items-start justify-between"><div><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-semibold tracking-tight">{isLoading ? "—" : value.toLocaleString("th-TH")}</p><p className="mt-2 text-xs text-slate-400">{note}</p></div><div className="rounded-lg bg-slate-100 p-2.5"><Icon className="size-5 text-slate-600" /></div></div></CardContent></Card>)}
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_1fr]">
              <Card className="border-slate-200 shadow-none"><CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-base">ผู้ใช้งานล่าสุด</CardTitle><Button variant="ghost" size="sm" className="gap-1 text-slate-500">ดูทั้งหมด <ArrowUpRight className="size-3.5" /></Button></CardHeader><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead className="pl-6">ชื่อผู้ใช้งาน</TableHead><TableHead>สถานะ</TableHead><TableHead>บทบาท</TableHead><TableHead className="pr-6 text-right">วันที่สมัคร</TableHead></TableRow></TableHeader><TableBody>{profiles.map((profile) => <TableRow key={profile.id}><TableCell className="pl-6 font-medium">{profile.full_name || profile.display_name || "ไม่ระบุชื่อ"}</TableCell><TableCell>{profile.verification_status === "verified" ? <Badge className="gap-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-50"><CheckCircle2 className="size-3" />ยืนยันแล้ว</Badge> : <Badge variant="secondary" className="gap-1"><XCircle className="size-3" />รอตรวจสอบ</Badge>}</TableCell><TableCell className="text-slate-500">{profile.role === "admin" ? "ผู้ดูแลระบบ" : "ผู้ใช้งาน"}</TableCell><TableCell className="pr-6 text-right text-sm text-slate-500">{new Date(profile.created_at).toLocaleDateString("th-TH")}</TableCell></TableRow>)}{!isLoading && profiles.length === 0 && <TableRow><TableCell colSpan={4} className="h-28 text-center text-slate-400">ยังไม่มีข้อมูลผู้ใช้งาน</TableCell></TableRow>}</TableBody></Table></CardContent></Card>
              <Card className="border-slate-200 shadow-none"><CardHeader><CardTitle className="text-base">สถานะการตรวจสอบ</CardTitle></CardHeader><CardContent><div className="flex items-center justify-between"><div><p className="text-3xl font-semibold">{data?.profiles.length ? Math.round((profiles.filter((p) => p.verification_status === "verified").length / profiles.length) * 100) : 0}%</p><p className="mt-1 text-sm text-slate-500">ผู้ใช้งานที่ยืนยันตัวตนแล้ว</p></div><ShieldCheck className="size-8 text-slate-300" /></div><Progress className="mt-6 h-2" value={data?.profiles.length ? (profiles.filter((p) => p.verification_status === "verified").length / profiles.length) * 100 : 0} /><div className="mt-5 flex justify-between text-xs text-slate-500"><span>ยืนยันแล้ว {profiles.filter((p) => p.verification_status === "verified").length} คน</span><span>ทั้งหมด {profiles.length} คน</span></div></CardContent></Card>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
