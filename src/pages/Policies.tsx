import Layout from "@/components/Layout";
import { BookOpen, CreditCard, XCircle, AlertTriangle, Star, Shield } from "lucide-react";

const Section = ({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) => (
  <div className="rounded-xl border border-border bg-card p-6 space-y-4">
    <div className="flex items-center gap-3">
      <div className="rounded-lg bg-primary/10 p-2">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h2 className="font-display text-xl text-foreground">{title}</h2>
    </div>
    <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
      {children}
    </div>
  </div>
);

const Policies = () => (
  <Layout>
    <section className="border-b border-border bg-card/30 py-16">
      <div className="container max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary mb-6">
          <BookOpen className="h-4 w-4" /> Platform Policies
        </div>
        <h1 className="font-display text-4xl text-foreground sm:text-5xl">
          Our <span className="text-gradient-gold">Policies</span>
        </h1>
        <p className="mt-4 text-muted-foreground">
          Understand how PreProduction works for bookings, payments, listings, and conduct. These policies apply to all users of the platform.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">Last updated: June 2026</p>
      </div>
    </section>

    <section className="py-14">
      <div className="container max-w-3xl space-y-6">

        <Section icon={BookOpen} title="Booking Policy">
          <p>All bookings on PreProduction are requests — they are not confirmed until the listing owner explicitly approves them. You will receive a notification once your booking status changes.</p>
          <p>Bookings are subject to the availability of the listing. The platform displays blocked dates set by owners; however, it is the owner's responsibility to keep their calendar accurate.</p>
          <p>Each booking includes the dates, duration (6-hour, 12-hour, or full day), total price, and any notes provided at the time of request. Once confirmed, changes must be agreed upon directly between both parties.</p>
          <p>Users may request an extension on an active booking. The owner reserves the right to accept or decline extension requests.</p>
        </Section>

        <Section icon={CreditCard} title="Payment Policy">
          <p>Payment is collected at the time of booking request submission. The total displayed at checkout includes all applicable fees.</p>
          <p>PreProduction uses a demo payment flow for this version of the platform. All card details entered are for demonstration purposes only and are not stored or processed through a live payment gateway.</p>
          <p>In a production environment, payments would be held in escrow and released to the listing owner only after the booking is confirmed and completed.</p>
          <p>Pricing is set independently by each listing owner. PreProduction does not impose a platform commission in the current version.</p>
        </Section>

        <Section icon={XCircle} title="Cancellation Policy">
          <p>Cancellations must be initiated through the platform. To cancel a booking, visit your Dashboard, locate the booking under "My Bookings," and select Cancel.</p>
          <p>Cancellation terms vary by listing. Owners may set their own cancellation windows. In the absence of a stated policy, the following defaults apply:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Cancellations made more than 48 hours before the booking date: full refund</li>
            <li>Cancellations made within 24–48 hours: 50% refund</li>
            <li>Cancellations made within 24 hours: no refund</li>
          </ul>
          <p>Owners who cancel a confirmed booking without valid reason may have their listing reviewed or suspended.</p>
        </Section>

        <Section icon={AlertTriangle} title="Listing Policy">
          <p>All listings — locations, equipment, crew profiles, and talent profiles — must be submitted for admin review and will only appear publicly once approved.</p>
          <p>Listings must accurately represent the space, equipment, or person being listed. Misleading descriptions, outdated photos, or misrepresented pricing may result in removal.</p>
          <p>Owners are responsible for keeping their listings up to date, including pricing, availability, and photos. Blocked dates must be set in advance to avoid scheduling conflicts.</p>
          <p>PreProduction reserves the right to reject or remove any listing that does not meet platform quality or legal standards.</p>
        </Section>

        <Section icon={Star} title="User Conduct Policy">
          <p>All users are expected to communicate respectfully and professionally through the platform. Harassment, discrimination, or abuse of any kind will result in account suspension.</p>
          <p>Users may not circumvent the platform to conduct off-platform transactions for bookings initiated through PreProduction.</p>
          <p>Any attempt to manipulate reviews, game search rankings, or misuse the platform's features will result in immediate account termination.</p>
          <p>Users found submitting fraudulent booking requests or false listing information will be permanently banned.</p>
        </Section>

        <Section icon={Shield} title="Dispute Resolution">
          <p>In the event of a dispute between a client and a listing owner, PreProduction will attempt to mediate and resolve the issue fairly based on the information available.</p>
          <p>To open a dispute, contact <span className="text-primary">support@preproduction.com</span> with your booking reference and a description of the issue. Include any supporting evidence such as photos or messages.</p>
          <p>PreProduction's decision in disputes is final. We are not liable for losses arising from disputes that cannot be resolved.</p>
          <p>For urgent issues, please contact us immediately — do not wait until after the booking date as evidence may no longer be verifiable.</p>
        </Section>

      </div>
    </section>
  </Layout>
);

export default Policies;
