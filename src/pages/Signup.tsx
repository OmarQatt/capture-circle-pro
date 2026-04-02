import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useNavigate } from "react-router-dom";
import { Film, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const Signup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      toast({ title: "Please select your role", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName, role },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Account created!", description: "Please check your email to verify your account." });
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
            <CardTitle className="font-display text-3xl">Create Account</CardTitle>
            <CardDescription>Join ProdHub and start booking</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="John" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Doe" value={lastName} onChange={e => setLastName(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">I am a</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger><SelectValue placeholder="Select your role" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Client (Renter)</SelectItem>
                    <SelectItem value="location_owner">Location Owner</SelectItem>
                    <SelectItem value="equipment_provider">Equipment Provider</SelectItem>
                    <SelectItem value="model">Model / Talent</SelectItem>
                    <SelectItem value="crew">Crew Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
              </div>
              <Button type="submit" className="w-full bg-gradient-gold text-primary-foreground font-semibold shadow-gold" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline">Sign in</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </section>
    </Layout>
  );
};

export default Signup;
