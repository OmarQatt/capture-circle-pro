import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Film } from "lucide-react";
import { Link } from "react-router-dom";

const ResetPassword = () => {
  return (
    <Layout>
      <section className="flex min-h-[80vh] items-center justify-center py-12">
        <Card className="w-full max-w-md border-border/50 bg-card">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Film className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="font-display text-3xl">Reset Password</CardTitle>
            <CardDescription>Password reset is handled via email link.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              Please request a new reset link from the forgot password page.
            </p>
            <Link to="/forgot-password" className="text-primary hover:underline">
              Request Reset Link
            </Link>
          </CardContent>
        </Card>
      </section>
    </Layout>
  );
};

export default ResetPassword;
