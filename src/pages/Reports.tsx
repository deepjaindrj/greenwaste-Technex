import { User, Building, Briefcase, Leaf, ClipboardCheck, TrendingUp, FileText, Download, Share2, Trash2, Loader2 } from "lucide-react";
import { reportTemplates as mockTemplates, recentReports as mockReports } from "@/lib/mockData";
import { useCitizen } from "@/hooks/use-citizen";
import { useSupabaseQuery, useSupabaseMutation } from "@/hooks/use-supabase-query";
import { getMyReports, generateReport } from "@/lib/api";
import { useState } from "react";

const iconMap: Record<string, React.ElementType> = { User, Building, Briefcase, Leaf, ClipboardCheck, TrendingUp };
const statusStyles: Record<string, string> = {
  Generated: 'bg-primary-glow text-primary',
  Processing: 'bg-warning/10 text-warning',
  Scheduled: 'bg-info/10 text-info',
};

export default function Reports() {
  const { citizenId } = useCitizen();
  const { data: reportsData } = useSupabaseQuery(
    ['reports', citizenId],
    () => getMyReports(citizenId!),
    { enabled: !!citizenId },
  );
  const reportTemplates = mockTemplates;
  const recentReports = reportsData ?? mockReports;

  const genMutation = useSupabaseMutation(
    async (templateId: string) => generateReport(templateId, 'Monthly', citizenId),
    [['reports']],
  );
  const [generating, setGenerating] = useState<string | null>(null);

  const handleGenerate = async (templateId: string) => {
    setGenerating(templateId);
    try { await genMutation.mutateAsync(templateId); } catch { /* fallback */ }
    setGenerating(null);
  };
  return (
    <div className="max-w-6xl mx-auto space-y-6 stagger-fade-in">
      <div>
        <h1 className="text-2xl font-display font-semibold text-foreground">Reports</h1>
        <p className="text-sm text-muted-foreground">Generate and manage sustainability reports</p>
      </div>

      {/* Templates */}
      <div>
        <h3 className="font-display font-semibold text-foreground mb-3">Report Templates</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportTemplates.map(t => {
            const Icon = iconMap[t.icon] || FileText;
            return (
              <div key={t.id} className="card-premium p-5 flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-primary-glow flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h4 className="text-sm font-display font-semibold text-foreground">{t.title}</h4>
                <p className="text-xs text-muted-foreground mt-1 flex-1">{t.description}</p>
                <button disabled={generating === t.id} onClick={() => handleGenerate(t.id)} className="mt-4 btn-primary-gradient text-primary-foreground py-2 rounded-full text-xs font-medium disabled:opacity-60">
                  {generating === t.id ? 'Generating…' : 'Generate →'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Reports */}
      <div>
        <h3 className="font-display font-semibold text-foreground mb-3">Recent Reports</h3>
        <div className="card-premium overflow-hidden">
          <div className="grid grid-cols-[1fr_100px_120px_90px_80px] gap-3 px-4 py-2.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
            <span>Report Name</span><span>Type</span><span>Date</span><span>Status</span><span>Actions</span>
          </div>
          {recentReports.map((r, i) => (
            <div key={i} className="grid grid-cols-[1fr_100px_120px_90px_80px] gap-3 px-4 py-3 items-center text-sm border-b border-border/50 hover:bg-secondary/30 transition-colors">
              <span className="font-medium text-foreground truncate">{r.name}</span>
              <span className="text-muted-foreground text-xs">{r.type}</span>
              <span className="text-muted-foreground text-xs">{r.date}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium w-fit ${statusStyles[r.status]}`}>{r.status}</span>
              <div className="flex gap-2">
                <button className="p-1.5 rounded-lg hover:bg-secondary transition-colors"><Download className="w-3.5 h-3.5 text-muted-foreground" /></button>
                <button className="p-1.5 rounded-lg hover:bg-secondary transition-colors"><Share2 className="w-3.5 h-3.5 text-muted-foreground" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
