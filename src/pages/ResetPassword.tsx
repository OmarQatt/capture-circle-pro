import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Film, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;
    const params = new URLSearchParams(hash);
    const errorDesc = params.get("error_description");
    const errorCode = params.get("error_code");
    if (errorDesc || errorCode) {
      setLinkError(
        errorCode === "otp_expired"
          ? "انتهت صلاحية الرابط أو تم استخدامه. يرجى طلب رابط جديد."
          : decodeURIComponent(errorDesc || "رابط غير صالح")
      );
      return;
    }
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setReady(true);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast({ title: "خطأ", description: "كلمتا المرور غير متطابقتين", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "خطأ", description: "كلمة المرور يجب أن تكون 6 أحرف على الأقل", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "تم بنجاح", description: "تم تحديث كلمة المرور" });
      navigate("/dashboard");
    }
  };

  return (
    <Layout>
      <section className="flex min-h-[80vh] items-center justify-center py-12">
        <Card className="w-full max-w-md border-border/50 bg-card">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Film className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="font-display text-3xl">إعادة تعيين كلمة المرور</CardTitle>
            <CardDescription>
              {linkError ? linkError : "أدخل كلمة المرور الجديدة"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {linkError ? (
              <div className="space-y-4 text-center">
                <Link to="/forgot-password" className="text-primary hover:underline">
                  طلب رابط جديد
                </Link>
              </div>
            ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور الجديدة</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">تأكيد كلمة المرور</Label>
                <Input id="confirm" type="password" placeholder="••••••••" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full bg-gradient-gold text-primary-foreground font-semibold shadow-gold" disabled={loading || !ready}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "تحديث كلمة المرور"}
              </Button>
            </form>
            )}
          </CardContent>
        </Card>
      </section>
    </Layout>
  );
};

export default ResetPassword;
