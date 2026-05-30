import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot password — Crest Nova Holdings" }] }),
  component: ForgotPage,
});

function ForgotPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password",
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    setSent(true);
    toast.success("Check your inbox");
  };

  return (
    <AuthShell title="Reset password" subtitle="We'll email you a secure reset link.">
      {sent ? (
        <div className="rounded-md border bg-card p-6 text-sm">
          <p>If an account exists for <strong>{email}</strong>, a reset link has been sent.</p>
          <Link to="/login" className="mt-4 inline-block text-primary hover:underline">Back to sign in</Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <Input type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button type="submit" className="w-full bg-gradient-hero" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send reset link"}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            Remembered it? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
