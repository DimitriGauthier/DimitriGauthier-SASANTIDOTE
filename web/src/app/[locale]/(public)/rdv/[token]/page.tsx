// Gestion de réservation par le client — /{locale}/rdv/{token}.
// Le token secret du booking fait foi (lien envoyé dans l'email de confirmation).
// Lecture serveur via service-role (RLS admin-only). Page non indexée.
import type { Metadata } from "next";
import { isLocale, type Locale, pick } from "@/lib/i18n";
import { href, experienceHref } from "@/lib/site";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { formatDateTime } from "@/lib/format";
import ManageBooking from "@/components/booking/ManageBooking";
import { CalendarHeart, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  return {
    title: pick(l, "Gérer mon rendez-vous", "Manage my appointment"),
    robots: { index: false, follow: false },
  };
}

function Notice({
  locale,
  title,
  body,
  cta,
}: {
  locale: Locale;
  title: string;
  body: string;
  cta?: { label: string; href: string };
}) {
  return (
    <div className="mx-auto max-w-xl py-12 text-center sm:py-16">
      <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-primary shadow-soft">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl">{title}</h1>
      <p className="mx-auto mt-3 max-w-md leading-relaxed text-muted-foreground">{body}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <a
          href={href(locale)}
          className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-border bg-card px-6 py-3 text-sm font-medium text-foreground transition-all hover:border-primary/50"
        >
          {pick(locale, "Retour à l'accueil", "Back to home")}
        </a>
        {cta ? (
          <a
            href={cta.href}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-soft transition-all hover:-translate-y-0.5 active:scale-95"
          >
            <CalendarHeart className="h-4 w-4" /> {cta.label}
          </a>
        ) : null}
      </div>
    </div>
  );
}

export default async function ManageBookingPage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const { locale, token } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";

  const admin = getSupabaseAdmin();
  const invalid = (
    <Notice
      locale={l}
      title={pick(l, "Lien introuvable", "Link not found")}
      body={pick(l, "Ce lien de gestion n'est pas valide. Vérifiez l'adresse depuis votre e-mail de confirmation.", "This management link is invalid. Please check the address in your confirmation email.")}
    />
  );
  if (!admin) return invalid;

  const { data: booking } = await admin
    .from("bookings")
    .select("id, token, status, slot_start, slot_end, locale, client_first_name, service_id")
    .eq("token", token)
    .maybeSingle();
  if (!booking) return invalid;

  // Service (titre affiché)
  const { data: service } = await admin
    .from("services")
    .select("title, title_en")
    .eq("id", booking.service_id)
    .maybeSingle();
  const serviceTitle = pick(l, service?.title ?? pick(l, "Consultation", "Consultation"), service?.title_en);

  const whenLabel = formatDateTime(booking.slot_start, l);
  const isPast = new Date(booking.slot_start) < new Date();

  // ── Déjà annulé ──
  if (booking.status === "cancelled") {
    return (
      <Notice
        locale={l}
        title={pick(l, "Rendez-vous annulé", "Appointment cancelled")}
        body={pick(l, "Ce rendez-vous a déjà été annulé. Vous pouvez réserver un nouveau moment quand vous le souhaitez.", "This appointment has already been cancelled. You can book a new moment whenever you like.")}
        cta={{ label: pick(l, "Réserver un moment", "Book a moment"), href: experienceHref(l) }}
      />
    );
  }

  // ── Pas encore confirmé (hold / en attente de paiement) ──
  if (booking.status !== "scheduled") {
    return (
      <Notice
        locale={l}
        title={pick(l, "Rendez-vous non confirmé", "Appointment not confirmed")}
        body={pick(l, "Ce rendez-vous n'est pas encore confirmé (paiement en attente). Une fois le paiement finalisé, vous pourrez le gérer ici.", "This appointment is not confirmed yet (payment pending). Once payment is completed, you'll be able to manage it here.")}
      />
    );
  }

  // ── Rendez-vous passé ──
  if (isPast) {
    return (
      <Notice
        locale={l}
        title={pick(l, "Rendez-vous passé", "Past appointment")}
        body={pick(l, `Ce rendez-vous (${whenLabel}) est déjà passé et ne peut plus être modifié. Merci de votre confiance.`, `This appointment (${whenLabel}) has already taken place and can no longer be changed. Thank you for your trust.`)}
        cta={{ label: pick(l, "Prendre un nouveau rendez-vous", "Book a new appointment"), href: experienceHref(l) }}
      />
    );
  }

  // ── Rendez-vous actif : gestion (reporter / annuler) ──
  return (
    <div className="mx-auto max-w-2xl py-10 sm:py-14">
      <div className="mb-8 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
          {pick(l, "Espace rendez-vous", "Appointment area")}
        </p>
        <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
          {pick(l, "Gérer mon rendez-vous", "Manage my appointment")}
        </h1>
      </div>
      <ManageBooking
        token={booking.token}
        locale={l}
        firstName={booking.client_first_name}
        serviceId={booking.service_id}
        serviceTitle={serviceTitle}
        whenLabel={whenLabel}
        slotStart={booking.slot_start}
      />
    </div>
  );
}
