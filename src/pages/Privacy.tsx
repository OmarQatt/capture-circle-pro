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

const Privacy = () => (
  <Layout>
    <section className="border-b border-border bg-card/30 py-16">
      <div className="container max-w-3xl text-center">
        <h1 className="font-display text-4xl text-foreground sm:text-5xl">
          Privacy <span className="text-gradient-gold">Policy</span>
        </h1>
        <p className="mt-4 text-muted-foreground">How we collect, use, and protect your personal information.</p>
        <p className="mt-2 text-xs text-muted-foreground">Effective date: June 1, 2026 · Last updated: June 2026</p>
      </div>
    </section>

    <section className="py-14">
      <div className="container max-w-3xl">

        <H2>1. Introduction</H2>
        <P>PreProduction ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform. Please read it carefully. By using PreProduction, you consent to the practices described in this policy.</P>

        <H2>2. Information We Collect</H2>
        <P><strong className="text-foreground">Information you provide directly:</strong></P>
        <ul className="list-disc list-inside space-y-1 pl-2 mb-3">
          <Li>Account registration details: name, email address, password</Li>
          <Li>Profile information: gender, phone number, avatar photo</Li>
          <Li>Listing content: photos, descriptions, pricing, location details</Li>
          <Li>Booking information: selected dates, duration, notes</Li>
          <Li>Payment details entered during checkout (demo environment — not stored)</Li>
          <Li>Communications you send us via the contact form or email</Li>
        </ul>
        <P><strong className="text-foreground">Information collected automatically:</strong></P>
        <ul className="list-disc list-inside space-y-1 pl-2 mb-3">
          <Li>Log data: IP address, browser type, pages visited, timestamps</Li>
          <Li>Device information: operating system, screen resolution</Li>
          <Li>Usage patterns: search queries, filters applied, listings viewed</Li>
        </ul>

        <H2>3. How We Use Your Information</H2>
        <P>We use the information we collect to:</P>
        <ul className="list-disc list-inside space-y-1 pl-2 mb-3">
          <Li>Create and manage your account</Li>
          <Li>Process and facilitate bookings between clients and owners</Li>
          <Li>Send transactional emails (booking confirmations, email verification, password resets)</Li>
          <Li>Review and approve listing submissions</Li>
          <Li>Improve the Platform's features, performance, and user experience</Li>
          <Li>Detect and prevent fraud, abuse, and security incidents</Li>
          <Li>Respond to your support requests and enquiries</Li>
          <Li>Comply with our legal obligations</Li>
        </ul>

        <H2>4. How We Share Your Information</H2>
        <P>We do not sell your personal data. We may share your information only in the following circumstances:</P>
        <ul className="list-disc list-inside space-y-1 pl-2 mb-3">
          <Li><strong className="text-foreground">With listing owners:</strong> When you submit a booking, the owner receives your name and booking details.</Li>
          <Li><strong className="text-foreground">With clients:</strong> When a booking is made for your listing, your display name and listing details are shared with the client.</Li>
          <Li><strong className="text-foreground">Service providers:</strong> We use third-party services (hosting, database, storage, email delivery) that may process your data on our behalf under strict confidentiality agreements.</Li>
          <Li><strong className="text-foreground">Legal requirements:</strong> We may disclose information if required by law, court order, or government authority.</Li>
          <Li><strong className="text-foreground">Business transfers:</strong> In the event of a merger, acquisition, or sale of assets, your data may be transferred to the acquiring entity.</Li>
        </ul>

        <H2>5. Data Storage and Security</H2>
        <P>Your data is stored on secure servers hosted by Supabase (PostgreSQL database and file storage). We implement industry-standard security measures including encrypted connections (HTTPS), hashed passwords, and access controls.</P>
        <P>Uploaded images and files are stored in Supabase Storage and are accessible via public URLs. We recommend not uploading sensitive personal documents to the Platform.</P>
        <P>While we take reasonable precautions, no method of internet transmission is 100% secure. We cannot guarantee absolute security of your data.</P>

        <H2>6. Data Retention</H2>
        <P>We retain your personal data for as long as your account is active or as necessary to provide our services. If you delete your account, we will delete or anonymize your personal data within 30 days, except where we are required to retain it by law (e.g., financial records).</P>
        <P>Listing data, booking records, and uploaded images associated with your account will also be removed upon account deletion, unless they are referenced by active bookings.</P>

        <H2>7. Cookies</H2>
        <P>We use minimal cookies and localStorage to maintain your login session (JWT access and refresh tokens). We do not use third-party advertising or tracking cookies.</P>
        <P>You can clear your browser's localStorage and cookies at any time, which will log you out of the Platform.</P>

        <H2>8. Your Rights</H2>
        <P>Depending on your jurisdiction, you may have the following rights regarding your personal data:</P>
        <ul className="list-disc list-inside space-y-1 pl-2 mb-3">
          <Li><strong className="text-foreground">Access:</strong> Request a copy of the personal data we hold about you</Li>
          <Li><strong className="text-foreground">Correction:</strong> Request correction of inaccurate or incomplete data</Li>
          <Li><strong className="text-foreground">Deletion:</strong> Request deletion of your personal data ("right to be forgotten")</Li>
          <Li><strong className="text-foreground">Portability:</strong> Request your data in a structured, machine-readable format</Li>
          <Li><strong className="text-foreground">Objection:</strong> Object to certain types of processing</Li>
        </ul>
        <P>To exercise any of these rights, contact us at <span className="text-primary">privacy@preproduction.com</span>. We will respond within 30 days.</P>

        <H2>9. Children's Privacy</H2>
        <P>PreProduction is not intended for users under the age of 18. We do not knowingly collect personal information from minors. If you believe a minor has created an account, please contact us immediately and we will remove the account and associated data.</P>

        <H2>10. Third-Party Links</H2>
        <P>Our Platform may contain links to third-party websites or services. We are not responsible for their privacy practices and encourage you to read their privacy policies before providing any personal information.</P>

        <H2>11. Changes to This Policy</H2>
        <P>We may update this Privacy Policy from time to time. We will notify you of significant changes by posting a notice on the Platform or sending an email to your registered address. Your continued use of the Platform after any changes constitutes your acceptance of the updated policy.</P>

        <H2>12. Contact Us</H2>
        <P>If you have questions, concerns, or requests regarding this Privacy Policy, please contact our Privacy team:</P>
        <ul className="list-none space-y-1 pl-2 mb-3">
          <Li>📧 <span className="text-primary">privacy@preproduction.com</span></Li>
          <Li>📧 <span className="text-primary">support@preproduction.com</span></Li>
        </ul>
        <P>You may also use the <a href="/contact" className="text-primary hover:underline">Contact page</a> to send us a message directly.</P>

      </div>
    </section>
  </Layout>
);

export default Privacy;
