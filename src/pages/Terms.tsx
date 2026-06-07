import Layout from "@/components/Layout";

const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="font-display text-xl text-foreground mt-10 mb-3">{children}</h2>
);
const P = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-muted-foreground leading-relaxed mb-3">{children}</p>
);
const Li = ({ children }: { children: React.ReactNode }) => (
  <li className="text-sm text-muted-foreground leading-relaxed">{children}</li>
);

const Terms = () => (
  <Layout>
    <section className="border-b border-border bg-card/30 py-16">
      <div className="container max-w-3xl text-center">
        <h1 className="font-display text-4xl text-foreground sm:text-5xl">
          Terms of <span className="text-gradient-gold">Service</span>
        </h1>
        <p className="mt-4 text-muted-foreground">Please read these terms carefully before using PreProduction.</p>
        <p className="mt-2 text-xs text-muted-foreground">Effective date: June 1, 2026 · Last updated: June 2026</p>
      </div>
    </section>

    <section className="py-14">
      <div className="container max-w-3xl">

        <H2>1. Acceptance of Terms</H2>
        <P>By accessing or using the PreProduction platform ("Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use the Platform. These Terms apply to all visitors, users, listing owners, and clients.</P>

        <H2>2. Description of Service</H2>
        <P>PreProduction is an online marketplace that connects filmmakers, directors, and production companies ("Clients") with providers of filming locations, professional equipment, crew members, and talent ("Owners"). PreProduction facilitates the discovery and booking of these services but is not a party to any agreement between Clients and Owners.</P>

        <H2>3. User Accounts</H2>
        <P>To access certain features, you must create an account. You agree to:</P>
        <ul className="list-disc list-inside space-y-1 pl-2 mb-3">
          <Li>Provide accurate, complete, and current registration information</Li>
          <Li>Maintain the security of your password and account</Li>
          <Li>Promptly update your account details if they change</Li>
          <Li>Accept responsibility for all activity that occurs under your account</Li>
        </ul>
        <P>We reserve the right to suspend or terminate accounts that violate these Terms or are used fraudulently.</P>

        <H2>4. Listings and Content</H2>
        <P>Owners may submit listings for review. All listings are subject to admin approval before appearing publicly. By submitting a listing, you confirm that:</P>
        <ul className="list-disc list-inside space-y-1 pl-2 mb-3">
          <Li>You own or have the legal right to list the space, equipment, or services described</Li>
          <Li>All information, photos, and pricing are accurate and not misleading</Li>
          <Li>The listing complies with all applicable local laws and regulations</Li>
        </ul>
        <P>PreProduction reserves the right to remove any listing at any time for any reason, including but not limited to violations of these Terms or quality standards.</P>

        <H2>5. Bookings and Payments</H2>
        <P>Booking requests submitted through the Platform are not confirmed until the Owner explicitly approves them. PreProduction facilitates the booking process and payment flow but does not guarantee the availability, quality, or fitness of any listed service.</P>
        <P>By submitting a booking request, you agree to pay the total amount displayed at the time of checkout, subject to the cancellation and refund terms stated in our Policies.</P>

        <H2>6. Prohibited Conduct</H2>
        <P>You agree not to:</P>
        <ul className="list-disc list-inside space-y-1 pl-2 mb-3">
          <Li>Use the Platform for any illegal purpose or in violation of any applicable law</Li>
          <Li>Post false, misleading, or defamatory content</Li>
          <Li>Attempt to circumvent the Platform to conduct off-platform transactions</Li>
          <Li>Harass, abuse, or threaten other users</Li>
          <Li>Use automated systems to scrape, crawl, or extract data from the Platform</Li>
          <Li>Impersonate any person or entity</Li>
          <Li>Attempt to gain unauthorized access to the Platform or its systems</Li>
        </ul>

        <H2>7. Intellectual Property</H2>
        <P>All content, trademarks, logos, and software on the Platform are the property of PreProduction or its licensors and are protected by applicable intellectual property laws. You may not copy, reproduce, distribute, or create derivative works without our express written permission.</P>
        <P>By submitting content (photos, descriptions, etc.) to the Platform, you grant PreProduction a non-exclusive, royalty-free, worldwide license to use, display, and promote that content in connection with the Platform.</P>

        <H2>8. Disclaimers</H2>
        <P>The Platform is provided "as is" and "as available" without warranties of any kind, either express or implied. PreProduction does not warrant that the Platform will be uninterrupted, error-free, or free of viruses or other harmful components.</P>
        <P>PreProduction does not endorse, verify, or guarantee the accuracy of any listing. Clients should conduct their own due diligence before making a booking.</P>

        <H2>9. Limitation of Liability</H2>
        <P>To the maximum extent permitted by law, PreProduction shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform, including but not limited to loss of revenue, data, or goodwill.</P>
        <P>Our total liability for any claim arising from these Terms or the Platform shall not exceed the amount you paid to us in the twelve (12) months preceding the claim.</P>

        <H2>10. Indemnification</H2>
        <P>You agree to indemnify and hold harmless PreProduction, its officers, directors, employees, and agents from any claims, damages, losses, or expenses (including legal fees) arising from your use of the Platform, your listings or bookings, your violation of these Terms, or your violation of any third-party rights.</P>

        <H2>11. Modifications to Terms</H2>
        <P>We may update these Terms from time to time. We will notify registered users of material changes via email or an in-platform notice. Continued use of the Platform after changes take effect constitutes your acceptance of the revised Terms.</P>

        <H2>12. Governing Law</H2>
        <P>These Terms are governed by the laws of the applicable jurisdiction. Any disputes arising from these Terms shall be submitted to the competent courts in that jurisdiction.</P>

        <H2>13. Contact</H2>
        <P>If you have questions about these Terms, please contact us at <span className="text-primary">legal@preproduction.com</span> or use the Contact page.</P>
      </div>
    </section>
  </Layout>
);

export default Terms;
