import Layout from "@/components/Layout";
import { Mail, MessageSquare, Clock, Loader2, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1200);
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="border-b border-border bg-card/30 py-16">
        <div className="container max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary mb-6">
            <MessageSquare className="h-4 w-4" /> Get in Touch
          </div>
          <h1 className="font-display text-4xl text-foreground sm:text-5xl">
            We're Here to <span className="text-gradient-gold">Help</span>
          </h1>
          <p className="mt-4 text-muted-foreground">
            Have a question about a listing, a booking, or your account? Reach out and our team will get back to you promptly.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-5xl grid gap-12 md:grid-cols-3">

          {/* Info cards */}
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-5 space-y-2">
              <Mail className="h-6 w-6 text-primary" />
              <p className="font-semibold text-foreground">Email Us</p>
              <p className="text-sm text-muted-foreground">support@preproduction.com</p>
              <p className="text-xs text-muted-foreground">For general enquiries and support</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5 space-y-2">
              <Mail className="h-6 w-6 text-primary" />
              <p className="font-semibold text-foreground">Business & Partnerships</p>
              <p className="text-sm text-muted-foreground">business@preproduction.com</p>
              <p className="text-xs text-muted-foreground">For enterprise deals and collaborations</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5 space-y-2">
              <Clock className="h-6 w-6 text-primary" />
              <p className="font-semibold text-foreground">Response Time</p>
              <p className="text-sm text-muted-foreground">Within a few hours on business days</p>
              <p className="text-xs text-muted-foreground">Sun – Thu, 9 AM – 6 PM</p>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-2">
            {sent ? (
              <div className="flex flex-col items-center gap-4 py-16 text-center">
                <div className="rounded-full bg-green-500/15 p-5">
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Message Sent!</h3>
                <p className="text-muted-foreground max-w-sm">
                  Thanks for reaching out. Our team will get back to you at <span className="text-foreground font-medium">{email}</span> within a few hours.
                </p>
                <Button variant="outline" onClick={() => { setSent(false); setName(""); setEmail(""); setSubject(""); setMessage(""); }}>
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <Label>Full Name</Label>
                    <Input className="mt-1" placeholder="Jane Smith" value={name} onChange={e => setName(e.target.value)} required />
                  </div>
                  <div>
                    <Label>Email Address</Label>
                    <Input className="mt-1" type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                </div>
                <div>
                  <Label>Subject</Label>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="booking">Booking Issue</SelectItem>
                      <SelectItem value="listing">Listing Question</SelectItem>
                      <SelectItem value="account">Account & Billing</SelectItem>
                      <SelectItem value="partnership">Partnership Enquiry</SelectItem>
                      <SelectItem value="report">Report a Problem</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Message</Label>
                  <Textarea
                    className="mt-1"
                    rows={6}
                    placeholder="Describe your question or issue in detail..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    maxLength={2000}
                    required
                  />
                  <p className="mt-1 text-xs text-muted-foreground text-right">{message.length}/2000</p>
                </div>
                <Button type="submit" disabled={loading || !subject} className="w-full bg-gradient-gold text-primary-foreground font-semibold">
                  {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Send Message
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
