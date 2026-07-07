// Contact — coordonnées + formulaire (→ contact_messages via /api/contact).
import type { Metadata } from "next";
import { isLocale, type Locale, pick } from "@/lib/i18n";
import { siteConfig, whatsappUrl } from "@/lib/site";
import { PageHero, FeatureGrid, SectionHeading, Pill } from "@/components/sections";
import { Phone, Mail, MessageCircle, MapPin, Clock, ShieldCheck, Languages, Video } from "lucide-react";
import ContactForm from "@/components/ContactForm";
import Reveal from "@/components/Reveal";

// Glyphe Instagram en SVG (les icônes de marque ne font plus partie de lucide-react).
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  return {
    title: pick(l, "Contact", "Contact"),
    description: pick(
      l,
      "Une question ? Écris-moi. Je te réponds au plus vite.",
      "A question? Write to me. I'll get back to you as soon as possible.",
    ),
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";

  const coords = [
    { icon: <Phone className="h-4 w-4" />, label: siteConfig.phone, href: `tel:${siteConfig.phone.replace(/\s/g, "")}` },
    { icon: <Mail className="h-4 w-4" />, label: siteConfig.email, href: `mailto:${siteConfig.email}` },
    { icon: <MessageCircle className="h-4 w-4" />, label: "WhatsApp", href: whatsappUrl(), external: true },
    { icon: <InstagramIcon className="h-4 w-4" />, label: "Instagram", href: siteConfig.instagram, external: true },
  ];

  return (
    <div>
      <PageHero
        eyebrow={pick(l, "Contact", "Get in touch")}
        title={pick(l, "Écrivons-nous", "Let's talk")}
        sub={pick(
          l,
          "Une question, un doute, une envie d'en savoir plus ? Écris-moi, je te réponds avec plaisir et en toute confidentialité.",
          "A question, a doubt, a wish to know more? Write to me, I'll be glad to answer, in full confidentiality.",
        )}
        badges={
          <>
            <Pill icon={<Clock className="h-4 w-4" />}>{pick(l, "Réponse rapide", "Quick reply")}</Pill>
            <Pill icon={<Video className="h-4 w-4" />}>{pick(l, "En visio partout", "Online everywhere")}</Pill>
          </>
        }
      />

      <section className="full-bleed py-20 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-[1fr_340px]">
          <Reveal>
            <div className="rounded-3xl border border-border/60 bg-card p-7 shadow-card sm:p-9">
              <h2 className="font-serif text-2xl font-medium text-foreground">{pick(l, "M'envoyer un message", "Send me a message")}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {pick(l, "Je te réponds au plus vite, en français ou en anglais.", "I'll get back to you as soon as possible, in French or English.")}
              </p>
              <div className="mt-6">
                <ContactForm locale={l} />
              </div>
            </div>
          </Reveal>

          <Reveal direction="right">
            <aside className="space-y-4 lg:sticky lg:top-24">
              <div className="rounded-3xl border border-primary/15 bg-gradient-warm p-7 shadow-card">
                <h2 className="mb-4 font-serif text-lg font-medium text-foreground">{pick(l, "Me joindre directement", "Reach me directly")}</h2>
                <ul className="space-y-2.5 text-sm">
                  {coords.map((c) => (
                    <li key={c.label}>
                      <a
                        href={c.href}
                        {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className="flex items-center gap-3 rounded-xl bg-card px-4 py-3 text-foreground shadow-card transition-colors hover:text-primary"
                      >
                        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">{c.icon}</span>
                        <span className="truncate">{c.label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl border border-border/60 bg-card p-7 shadow-card">
                <h2 className="mb-2 flex items-center gap-2 font-serif text-lg font-medium text-foreground">
                  <MapPin className="h-4 w-4 text-primary" /> {pick(l, "Zone & format", "Area & format")}
                </h2>
                <p className="text-sm text-muted-foreground">{siteConfig.zone[l]}</p>
                <p className="mt-1 text-sm text-muted-foreground">{pick(l, "En français ou en anglais.", "In French or English.")}</p>
              </div>
            </aside>
          </Reveal>
        </div>
      </section>

      <FeatureGrid
        tone="soft"
        heading={<SectionHeading eyebrow={pick(l, "En toute confiance", "In full confidence")} title={pick(l, "Ce que tu peux attendre", "What you can expect")} />}
        items={[
          {
            icon: <Clock className="h-6 w-6" />,
            title: pick(l, "Une réponse rapide", "A quick reply"),
            body: pick(l, "Je lis tous les messages et je te réponds au plus vite.", "I read every message and get back to you as soon as possible."),
          },
          {
            icon: <ShieldCheck className="h-6 w-6" />,
            title: pick(l, "Confidentialité", "Confidentiality"),
            body: pick(
              l,
              "Tes informations sont traitées de manière confidentielle et ne servent qu'à te répondre.",
              "Your information is handled confidentially and used only to respond to you.",
            ),
          },
          {
            icon: <Languages className="h-6 w-6" />,
            title: pick(l, "Français ou anglais", "French or English"),
            body: pick(l, "On échange dans la langue avec laquelle tu es le plus à l'aise.", "We talk in the language you're most comfortable with."),
          },
        ]}
      />
    </div>
  );
}
