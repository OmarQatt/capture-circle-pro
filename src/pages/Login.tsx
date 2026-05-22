import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { Film, Loader2, MailCheck, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import api from "@/integrations/api/client";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();
  const { user, setAuthUser } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUnverifiedEmail(null);
    try {
      const data = await api.post<{ accessToken: string; refreshToken: string; user: any }>(
        "/api/auth/login",
        { email, password }
      );
      api.setTokens(data.accessToken, data.refreshToken);
      setAuthUser(data.user);
      toast({ title: "Welcome back!" });
      navigate("/dashboard");
    } catch (err: any) {
      if (err.message === 'EMAIL_NOT_VERIFIED') {
        setUnverifiedEmail(email);
      } else {
        toast({ title: "Login failed", description: err.message, variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!unverifiedEmail) return;
    setResendLoading(true);
    try {
      await api.post("/api/auth/resend-verification", { email: unverifiedEmail });
      toast({ title: "Email sent!", description: "Check your inbox for a new verification link." });
    } catch (err: any) {
      toast({ title: "Failed to resend", description: err.message, variant: "destructive" });
    } finally {
      setResendLoading(false);
    }
  };

  if (unverifiedEmail) {
    return (
      <Layout>
        <section className="flex min-h-[80vh] items-center justify-center py-12">
          <Card className="w-full max-w-md border-border/50 bg-card text-center">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <MailCheck className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="font-display text-2xl">{t('auth.login.verifyTitle')}</CardTitle>
              <CardDescription>
                {t('auth.login.verifyDesc', { email: unverifiedEmail })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full bg-gradient-gold text-primary-foreground font-semibold shadow-gold"
                onClick={handleResend}
                disabled={resendLoading}
              >
                {resendLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('auth.login.resend')}
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setUnverifiedEmail(null)}>
                {t('auth.login.backToLogin')}
              </Button>
            </CardContent>
          </Card>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="flex min-h-[80vh] items-center justify-center py-12">
        <Card className="w-full max-w-md border-border/50 bg-card">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Film className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="font-display text-3xl">{t('auth.login.title')}</CardTitle>
            <CardDescription>{t('auth.login.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.login.email')}</Label>
                <Input id="email" type="email" placeholder={t('auth.login.emailPlaceholder')} value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t('auth.login.password')}</Label>
                  <Link to="/forgot-password" className="text-xs text-primary hover:underline">{t('auth.login.forgot')}</Link>
                </div>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required className="pr-10" />
                  <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full bg-gradient-gold text-primary-foreground font-semibold shadow-gold" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('auth.login.submit')}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                {t('auth.login.noAccount')}{" "}
                <Link to="/signup" className="text-primary hover:underline">{t('auth.login.signupLink')}</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </section>
    </Layout>
  );
};

export default Login;
