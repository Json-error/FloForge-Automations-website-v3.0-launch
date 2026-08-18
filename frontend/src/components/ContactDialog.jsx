import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import LeadForm from "@/components/LeadForm";

export default function ContactDialog({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#F8FAFC] border border-slate-300 rounded-sm text-[#0F172A] sm:max-w-md" data-testid="contact-dialog">
        <DialogHeader>
          <DialogTitle className="font-manrope font-extrabold text-[#0F172A]">Get your free strategy call</DialogTitle>
          <DialogDescription className="text-slate-600 text-sm">
            Tell us about your business and we'll map out your system.
          </DialogDescription>
        </DialogHeader>
        <LeadForm idPrefix="dialog" />
      </DialogContent>
    </Dialog>
  );
}
