"use client";

import { useActionState, useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { clientLoginAction, contactAction, designRequestAction, forgotPasswordAction, googleLoginAction, loginAction, newsletterAction, registerAction, resetPasswordAction, updateProfileAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { serviceCategories } from "@/lib/catalog";
import { formatCurrency } from "@/lib/utils";

type ActionState = { ok?: boolean; message?: string } | undefined;

export function NewsletterForm() {
  const [state, action, pending] = useActionState(newsletterAction, undefined as ActionState);
  return (
    <form action={action} className="flex flex-col gap-3 sm:flex-row">
      <Input name="email" type="email" placeholder="Email address" required />
      <Button disabled={pending}>{pending ? "Joining..." : "Join newsletter"}</Button>
      {state?.message ? <p className="text-sm text-muted-foreground sm:self-center">{state.message}</p> : null}
    </form>
  );
}

export function ContactForm() {
  const [state, action, pending] = useActionState(contactAction, undefined as ActionState);
  return (
    <form action={action} className="grid gap-4">
      <Input name="name" placeholder="Full name" required />
      <Input name="email" type="email" placeholder="Email address" required />
      <Input name="subject" placeholder="Subject" required />
      <Textarea name="message" placeholder="Tell us what you need" required />
      <Button disabled={pending}>{pending ? "Sending..." : "Send message"}</Button>
      {state?.message ? <p className="text-sm text-muted-foreground">{state.message}</p> : null}
    </form>
  );
}

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, undefined as ActionState);
  const [password, setPassword] = useState("");
  const passwordRules = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "At least 1 uppercase letter", met: /[A-Z]/.test(password) },
    { label: "At least 1 number", met: /[0-9]/.test(password) }
  ];

  return (
    <form action={action} className="grid gap-4">
      <Input name="name" placeholder="Full name" required />
      <Input name="email" type="email" placeholder="Email address" required />
      <Input name="password" type="password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} required />
      <div className="rounded-xl border border-amber-200/15 bg-black/25 p-4 text-sm text-muted-foreground">
        <p className="font-semibold text-white">Password requirements</p>
        <ul className="mt-2 grid gap-1">
          {passwordRules.map((rule) => (
            <li key={rule.label} className={rule.met ? "font-medium text-emerald-300" : "text-muted-foreground"}>
              {rule.met ? "✓ " : ""}{rule.label}
            </li>
          ))}
        </ul>
      </div>
      <input type="hidden" name="role" value="CLIENT" />
      <Button disabled={pending}>{pending ? "Creating account..." : "Create account"}</Button>
      {state?.message ? <p className="text-sm text-red-300">{state.message}</p> : null}
    </form>
  );
}

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, undefined as ActionState);
  const [googleState, googleAction, googlePending] = useActionState(googleLoginAction, undefined as ActionState);
  return (
    <div className="grid gap-4">
      <form action={googleAction}>
        <Button className="w-full" variant="outline" disabled={googlePending}>
          {googlePending ? "Connecting..." : "Continue with Google"}
        </Button>
        {googleState?.message ? <p className="mt-3 text-sm text-red-300">{googleState.message}</p> : null}
      </form>
      <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
        <span className="h-px flex-1 bg-white/10" />
        or
        <span className="h-px flex-1 bg-white/10" />
      </div>
      <form action={action} className="grid gap-4">
        <Input name="email" type="email" placeholder="Email address" required />
        <Input name="password" type="password" placeholder="Password" required />
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input name="remember" type="checkbox" className="size-4 accent-red-600" />
          Remember me
        </label>
        <Button disabled={pending}>{pending ? "Signing in..." : "Login"}</Button>
        {state?.message ? <p className="text-sm text-red-300">{state.message}</p> : null}
      </form>
    </div>
  );
}

export function ClientLoginForm() {
  const [state, action, pending] = useActionState(clientLoginAction, undefined as ActionState);
  return (
    <form action={action} className="grid gap-4">
      <Input name="email" type="email" placeholder="Client email address" required />
      <Input name="password" type="password" placeholder="Password" required />
      <Button disabled={pending}>{pending ? "Signing in..." : "Client Login"}</Button>
      {state?.message ? <p className="text-sm text-red-300">{state.message}</p> : null}
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(forgotPasswordAction, undefined as ActionState);
  return (
    <form action={action} className="mt-6 grid gap-4">
      <Input name="email" type="email" placeholder="Email address" required />
      <Button disabled={pending}>{pending ? "Sending..." : "Send reset link"}</Button>
      {state?.message ? <p className={state.ok ? "text-sm text-emerald-300" : "text-sm text-red-300"}>{state.message}</p> : null}
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPasswordAction, undefined as ActionState);
  return (
    <form action={action} className="mt-6 grid gap-4">
      <input type="hidden" name="token" value={token} />
      <Input name="password" type="password" placeholder="New password" required />
      <Button disabled={pending}>{pending ? "Updating..." : "Update password"}</Button>
      {state?.message ? <p className={state.ok ? "text-sm text-emerald-300" : "text-sm text-red-300"}>{state.message}</p> : null}
    </form>
  );
}

export function ProfileForm({ user }: { user: { name: string | null; phone: string | null; bio: string | null } }) {
  const [state, action, pending] = useActionState(updateProfileAction, undefined as ActionState);
  return (
    <form action={action} className="mt-5 grid max-w-2xl gap-4">
      <Input name="name" placeholder="Display name" defaultValue={user.name ?? ""} />
      <Input name="phone" placeholder="Phone" defaultValue={user.phone ?? ""} />
      <Textarea name="bio" placeholder="Short profile note or billing instructions" defaultValue={user.bio ?? ""} />
      <Button disabled={pending}>{pending ? "Saving..." : "Save profile"}</Button>
      {state?.message ? <p className={state.ok ? "text-sm text-emerald-300" : "text-sm text-red-300"}>{state.message}</p> : null}
    </form>
  );
}

export function DesignRequestForm({ services, client }: { services: { id: string; name: string; basePrice: string | number }[]; client: { name: string | null; email: string; phone: string | null } }) {
  const [state, action, pending] = useActionState(designRequestAction, undefined as ActionState);
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [projectName, setProjectName] = useState("");
  const [requirements, setRequirements] = useState("");
  const [deadline, setDeadline] = useState("");
  const selected = services.find((service) => service.id === serviceId);

  return (
    <form action={action} className="grid gap-6">
      <Card className="bg-white/[0.03] shadow-none">
        <h2 className="text-xl font-semibold">Client information</h2>
        <p className="mt-2 text-sm text-muted-foreground">This comes from your client account. Update it from your profile if anything is wrong.</p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <Input value={client.name ?? ""} readOnly aria-label="Client name" />
          <Input value={client.email} readOnly aria-label="Client email" />
          <Input value={client.phone ?? ""} readOnly aria-label="Client phone" />
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <label className="mb-2 block text-sm text-muted-foreground" htmlFor="serviceId">Design type</label>
          <select id="serviceId" name="serviceId" value={serviceId} onChange={(event) => setServiceId(event.target.value)} className="h-11 w-full rounded-xl border border-white/10 bg-[#130d09] px-4 text-sm" required>
            {services.length ? null : <option value="">No services available</option>}
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </div>
        <div className="rounded-xl border border-primary/30 bg-primary/10 px-5 py-3 text-sm">
          <span className="text-muted-foreground">Price</span>
          <div className="text-2xl font-black">{formatCurrency(selected ? Number(selected.basePrice) : 0)}</div>
        </div>
      </div>

      <Card className="bg-white/[0.03] shadow-none">
        <h2 className="text-xl font-semibold">Project details</h2>
        <div className="mt-5 grid gap-4">
          <Input name="projectName" value={projectName} onChange={(event) => setProjectName(event.target.value)} placeholder="Project name" required />
          <Textarea name="requirements" value={requirements} onChange={(event) => setRequirements(event.target.value)} placeholder="Description / requirements" required />
          <Input name="references" placeholder="Reference links, brand notes, or inspiration links" />
          <div>
            <label className="mb-2 block text-sm text-muted-foreground" htmlFor="deadline">Deadline</label>
            <Input id="deadline" name="deadline" type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} required />
          </div>
        </div>
      </Card>

      <Card className="bg-white/[0.03] shadow-none">
        <h2 className="text-xl font-semibold">Upload assets</h2>
        <p className="mt-2 text-sm text-muted-foreground">Upload images, logos, references, brand files, PDFs, or ZIP files. Each file can be up to 10MB.</p>
        <Input name="assets" type="file" multiple accept="image/*,.pdf,.zip,.ai,.psd,.eps,.svg,.doc,.docx" className="mt-5" />
      </Card>

      <Card className="bg-white/[0.03] shadow-none">
        <h2 className="text-xl font-semibold">Review request summary</h2>
        <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
          <p><span className="text-white">Client:</span> {client.name ?? client.email}</p>
          <p><span className="text-white">Service:</span> {selected?.name ?? "Choose a design type"}</p>
          <p><span className="text-white">Price:</span> {formatCurrency(selected ? Number(selected.basePrice) : 0)}</p>
          <p><span className="text-white">Project:</span> {projectName || "Not entered"}</p>
          <p><span className="text-white">Deadline:</span> {deadline || "Not selected"}</p>
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        <Button name="intent" value="draft" variant="outline" disabled={pending || !selected}>{pending ? "Saving..." : "Save Draft"}</Button>
        <Button name="intent" value="submit" disabled={pending || !selected}>{pending ? "Submitting..." : "Submit Project"}</Button>
      </div>
      {state?.message ? <p className={state.ok ? "text-sm text-emerald-300" : "text-sm text-red-300"}>{state.message}</p> : null}
    </form>
  );
}

export function ServiceExplorer() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  const filtered = useMemo(() => serviceCategories.filter((item) => item.toLowerCase().includes(query.toLowerCase())), [query]);
  const sorted = [...filtered].sort((a, b) => (sort === "az" ? a.localeCompare(b) : b.length - a.length));

  return (
    <div className="grid gap-6">
      <Card className="grid gap-4 md:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-3 size-5 text-muted-foreground" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search services" className="pl-10" />
        </div>
        <select value={sort} onChange={(event) => setSort(event.target.value)} className="h-11 rounded-xl border border-white/10 bg-[#130d09] px-4 text-sm">
          <option value="featured">Featured</option>
          <option value="az">A-Z</option>
        </select>
        <Button type="button" variant="outline" onClick={() => { setQuery(""); setSort("featured"); }}>
          <SlidersHorizontal className="size-4" />
          Reset
        </Button>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {sorted.map((category) => (
          <Card key={category} className="group transition hover:-translate-y-1 hover:border-primary/40">
            <div className="text-sm text-primary">From {formatCurrency(49)}</div>
            <h3 className="mt-3 text-lg font-semibold">{category}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Campaign-ready visuals with editable files, revisions, and fast delivery.</p>
            <Button className="mt-5 w-full" variant="outline" asChild>
              <a href={`/request-design?service=${encodeURIComponent(category)}`}>Order now</a>
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
