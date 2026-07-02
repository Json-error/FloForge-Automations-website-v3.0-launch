import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const BOTTLENECKS = [
  { value: "Leads", label: "Losing or missing leads" },
  { value: "Follow-ups", label: "Slow or forgotten follow-ups" },
  { value: "Operations", label: "Disorganized daily operations" },
];

export const LeadForm = ({ submitLabel = "Get My Free Strategy Call", idPrefix = "lead" }) => {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ full_name: "", company_name: "", email: "", bottleneck: "" });

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.company_name || !form.email || !form.bottleneck) {
      toast.error("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/leads`, form);
      setDone(true);
      toast.success("Thanks! We'll be in touch shortly.");
      setForm({ full_name: "", company_name: "", email: "", bottleneck: "" });
    } catch (err) {
      const msg = err?.response?.data?.detail?.[0]?.msg || "Something went wrong. Please try again.";
      toast.error(typeof msg === "string" ? msg : "Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center text-center py-8"
        data-testid="contact-success"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#10B981]/15 border border-[#10B981]/40 mb-5">
          <CheckCircle2 className="text-[#10B981]" size={32} />
        </div>
        <h3 className="font-manrope font-bold text-2xl mb-2 text-white">You're all set</h3>
        <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
          We received your details and a FloForge specialist will reach out within one business day.
        </p>
      </motion.div>
    );
  }

  const inputCls =
    "bg-black/20 border-white/10 text-white placeholder:text-slate-500 rounded-lg h-12 focus-visible:ring-[#5B21B6] focus-visible:border-[#5B21B6]";

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="contact-form">
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-full_name`} className="text-slate-300 text-sm">Full Name</Label>
        <Input id={`${idPrefix}-full_name`} data-testid="input-full-name" value={form.full_name}
          onChange={(e) => update("full_name", e.target.value)} placeholder="Jordan Miller" className={inputCls} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-company_name`} className="text-slate-300 text-sm">Company Name</Label>
        <Input id={`${idPrefix}-company_name`} data-testid="input-company-name" value={form.company_name}
          onChange={(e) => update("company_name", e.target.value)} placeholder="Miller Contracting LLC" className={inputCls} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-email`} className="text-slate-300 text-sm">Email Address</Label>
        <Input id={`${idPrefix}-email`} type="email" data-testid="input-email" value={form.email}
          onChange={(e) => update("email", e.target.value)} placeholder="you@company.com" className={inputCls} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-slate-300 text-sm">Biggest Bottleneck</Label>
        <Select value={form.bottleneck} onValueChange={(v) => update("bottleneck", v)}>
          <SelectTrigger data-testid="select-bottleneck" className="bg-black/20 border-white/10 text-white rounded-lg h-12 focus:ring-[#5B21B6]">
            <SelectValue placeholder="Choose one" />
          </SelectTrigger>
          <SelectContent className="bg-[#0F172A] border-white/10 text-white">
            {BOTTLENECKS.map((b) => (
              <SelectItem key={b.value} value={b.value} data-testid={`bottleneck-${b.value.toLowerCase()}`} className="focus:bg-[#5B21B6]/30 focus:text-white">
                {b.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <button type="submit" disabled={loading} data-testid="contact-form-submit"
        className="w-full h-12 bg-[#5B21B6] hover:bg-[#4C1D95] disabled:opacity-60 text-white font-manrope font-semibold tracking-wide shadow-[0_4px_20px_rgba(91,33,182,0.4)] rounded-lg transition-all flex items-center justify-center gap-2 mt-2">
        {loading ? (<><Loader2 className="animate-spin" size={18} /> Sending...</>) : submitLabel}
      </button>
    </form>
  );
};

export default LeadForm;
