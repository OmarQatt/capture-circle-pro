import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Film, Loader2, MailCheck, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import api from "@/integrations/api/client";

const Signup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const validatePassword = (p: string): string => {
    if (p.length < 8) return "Password must be at least 8 characters";
    if (!/[0-9]/.test(p)) return "Password must contain at least one number";
    if (!/[^a-zA-Z0-9]/.test(p)) return "Password must contain at least one special character";
    return "";
  };
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gender) { toast({ title: "Gender is required", variant: "destructive" }); return; }
    const pwErr = validatePassword(password);
    if (pwErr) { setPasswordError(pwErr); return; }
    setPasswordError("");
    setLoading(true);
    try {
      await api.post("/api/auth/signup", { email, password, first_name: firstName, last_name: lastName, gender });
      setDone(true);
    } catch (err: any) {
      toast({ title: "Signup failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <Layout>
        <section className="flex min-h-[80vh] items-center justify-center py-12">
          <Card className="w-full max-w-md border-border/50 bg-card text-center">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <MailCheck className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="font-display text-2xl">{t('auth.signup.checkEmailTitle')}</CardTitle>
              <CardDescription>
                {t('auth.signup.checkEmailDesc', { email })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t('auth.signup.alreadyVerified')}{" "}
                <Link to="/login" className="text-primary hover:underline">{t('auth.signup.loginHere')}</Link>
              </p>
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
            <CardTitle className="font-display text-3xl">{t('auth.signup.title')}</CardTitle>
            <CardDescription>{t('auth.signup.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t('auth.signup.firstName')}</Label>
                  <Input id="firstName" placeholder={t('auth.signup.firstNamePlaceholder')} value={firstName} onChange={e => setFirstName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t('auth.signup.lastName')}</Label>
                  <Input id="lastName" placeholder={t('auth.signup.lastNamePlaceholder')} value={lastName} onChange={e => setLastName(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender <span className="text-red-500">*</span></Label>
                <Select value={gender} onValueChange={setGender} required>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select your gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.signup.email')}</Label>
                <Input id="email" type="email" placeholder={t('auth.signup.emailPlaceholder')} value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.signup.password')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => { setPassword(e.target.value); if (passwordError) setPasswordError(validatePassword(e.target.value)); }}
                    required
                    className="pr-10"
                  />
                  <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
                <p className="text-xs text-muted-foreground">Min 8 characters, one number, one special character</p>
              </div>
              <Button type="submit" className="w-full bg-gradient-gold text-primary-foreground font-semibold shadow-gold" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('auth.signup.submit')}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                {t('auth.signup.hasAccount')}{" "}
                <Link to="/login" className="text-primary hover:underline">{t('auth.signup.loginLink')}</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </section>
    </Layout>
  );
};

export default Signup;
