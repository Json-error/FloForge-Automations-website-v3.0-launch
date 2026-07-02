import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import LeadForm from "@/components/LeadForm";

export const ContactDialog = ({ trigger }) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className="bg-[#0F172A] border border-white/10 text-white rounded-xl p-8 max-w-md shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
        data-testid="contact-dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-manrope font-extrabold text-2xl tracking-tight">
            Let's build your system
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-sm">
            Tell us where your business is leaking time. We'll show you the fix.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2">
          <LeadForm idPrefix="dialog" submitLabel="Get My Free Strategy Call" />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactDialog;
