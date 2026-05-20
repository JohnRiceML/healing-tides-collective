import Link from "next/link";
import {
  Card,
  Container,
  Field,
  LinkButton,
  SectionHeader,
  TextInput,
} from "@/app/prototype/_components/ui";

export default function ProviderLoginPage() {
  return (
    <main className="py-16 md:py-24">
      <Container size="narrow">
        <SectionHeader
          eyebrow="Provider portal"
          title={
            <>
              Welcome back to the
              <br />
              <span className="italic text-ocean">collective.</span>
            </>
          }
          body="Sign in to update your availability and review the referrals Nora has sent your way."
        />

        <Card className="mt-12">
          <form className="space-y-7" action="/prototype/provider/dashboard">
            <Field label="Email">
              <TextInput type="email" placeholder="you@yourpractice.com" />
            </Field>
            <Field label="Password">
              <TextInput type="password" placeholder="Your password" />
            </Field>

            <div className="flex items-center justify-between pt-2">
              <Link
                href="#"
                className="meta text-ink-soft hover:text-charcoal"
              >
                Forgot password
              </Link>
              <LinkButton href="/prototype/provider/dashboard">Sign in</LinkButton>
            </div>
          </form>

          <p className="mt-8 border-t border-rule/70 pt-6 text-[13px] leading-[1.6] text-ink-muted">
            This is a prototype. Any email and password will work.
          </p>
        </Card>

        <p className="mt-10 text-center text-[14px] text-ink-soft">
          Not in the collective yet?{" "}
          <Link
            href="/prototype/practitioner/apply"
            className="text-ocean underline-offset-4 hover:underline"
          >
            Apply &rarr;
          </Link>
        </p>
      </Container>
    </main>
  );
}
