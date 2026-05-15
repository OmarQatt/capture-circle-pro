import Layout from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/integrations/api/client";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuthUser } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setErrorMsg("No verification token found in the link.");
      return;
    }

    api.get<{ accessToken: string; refreshToken: string; user: any }>(
      `/api/auth/verify-email?token=${token}`
    )
      .then((data) => {
        api.setTokens(data.accessToken, data.refreshToken);
        setAuthUser(data.user);
        setStatus("success");
        setTimeout(() => navigate("/dashboard"), 2500);
      })
      .catch((err) => {
        setStatus("error");
        setErrorMsg(err.message || "Invalid or expired verification link.");
      });
  }, []);

  return (
    <Layout>
      <section className="flex min-h-[80vh] items-center justify-center py-12">
        <Card className="w-full max-w-md border-border/50 bg-card text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              {status === "loading" && <Loader2 className="h-7 w-7 text-primary animate-spin" />}
              {status === "success" && <CheckCircle className="h-7 w-7 text-green-500" />}
              {status === "error" && <XCircle className="h-7 w-7 text-destructive" />}
            </div>
            <CardTitle className="font-display text-2xl">
              {status === "loading" && "Verifying your email…"}
              {status === "success" && "Email verified!"}
              {status === "error" && "Verification failed"}
            </CardTitle>
            <CardDescription>
              {status === "loading" && "Please wait a moment."}
              {status === "success" && "Your account is active. Redirecting you to the dashboard…"}
              {status === "error" && errorMsg}
            </CardDescription>
          </CardHeader>
          {status === "error" && (
            <CardContent className="space-y-3">
              <Button asChild className="w-full bg-gradient-gold text-primary-foreground font-semibold shadow-gold">
                <Link to="/signup">Back to Sign up</Link>
              </Button>
              <Button variant="ghost" asChild className="w-full">
                <Link to="/login">Sign in</Link>
              </Button>
            </CardContent>
          )}
        </Card>
      </section>
    </Layout>
  );
};

export default VerifyEmail;
