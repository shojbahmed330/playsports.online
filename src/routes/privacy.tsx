import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/site/LegalLayout";
import { useLegalPage } from "@/lib/site-settings";

const URL = "https://www.playsports.online/privacy";

const DEFAULT_BODY = `## Summary
We respect your privacy. PlaySports only collects what's needed to run the site — your timezone, optional newsletter email, and standard analytics. We never sell personal data.

## Information we collect
- **Automatic** — IP address, browser type, device, pages viewed and timestamps via standard server logs and Google Analytics 4.
- **Local preferences** — Timezone, favourite teams and onboarding flags stored in your browser's localStorage. This data never leaves your device.
- **Newsletter** — If you subscribe, we store your email address and subscription timestamp in our database.
- **Contact form** — Your name, email and message are stored so we can reply.

## How we use information
- Deliver live scores in your local timezone and remember your favourites.
- Measure aggregate traffic, popular matches and feature usage.
- Send the newsletter you opted into (you can unsubscribe any time).
- Respond to your contact messages.

## Advertising & AdSense
This site uses **Google AdSense**. Google and its partners may use cookies and device identifiers to serve personalised or non-personalised ads based on your prior visits. You can control ad personalisation at **adssettings.google.com**. For EU/UK/EEA visitors we display a consent banner before personalised ads load.

## Analytics
We use **Google Analytics 4** with IP anonymisation. Analytics cookies help us understand which sports, matches and features matter most to readers.

## Affiliate links
Some outbound links are affiliate links. Clicking them tells our system to record an anonymous click count — no personal data is shared with the merchant. See our **Disclaimer** for full disclosure.

## Cookies
Cookies are used for: session preferences, analytics, ad personalisation (with consent), and affiliate click tracking. You can clear cookies any time from your browser settings.

## Data sharing
We never sell your data. We share data only with:
- **Google** (Analytics, AdSense) — strictly for measurement and advertising.
- **Lovable Cloud / Supabase** — our hosting and database provider.
- **Resend / email providers** — to deliver newsletters and replies.

## Your rights
You can request access, correction or deletion of your data at any time by emailing us via the Contact page. EU/UK users have additional rights under GDPR.

## Children
PlaySports is not directed at children under 13. We do not knowingly collect data from children.

## Changes to this policy
We may update this policy as the platform evolves. Material changes will be announced on the site.

## Contact
Privacy questions? Use the **Contact** page and we'll respond within 2 business days.`;

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — PlaySports" },
      { name: "description", content: "How PlaySports collects, uses and protects your data — covering analytics, AdSense, newsletter, and affiliate links." },
      { property: "og:title", content: "Privacy Policy — PlaySports" },
      { property: "og:description", content: "Transparent privacy practices for analytics, advertising, newsletter and affiliate links." },
      { property: "og:url", content: URL },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: Page,
});

function Page() {
  const { data, isLoading } = useLegalPage("legal_privacy");
  return (
    <LegalLayout
      title="Privacy Policy"
      intro="What we collect, why we collect it, and the controls you have."
      body={data?.body ?? ""}
      defaultBody={DEFAULT_BODY}
      loading={isLoading}
      updated="June 2026"
    />
  );
}
