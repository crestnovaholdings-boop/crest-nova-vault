import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/use-auth";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCOUNT_TYPES = ["checking", "savings", "business"] as const;
const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD"] as const;
const EMPLOYMENT = [
  "Employed",
  "Self-employed",
  "Business owner",
  "Student",
  "Retired",
  "Unemployed",
] as const;
const INCOME_BANDS = [
  "Under $25,000",
  "$25,000 – $50,000",
  "$50,000 – $100,000",
  "$100,000 – $250,000",
  "$250,000 – $1,000,000",
  "Over $1,000,000",
] as const;
const SOURCES = [
  "Salary / Employment",
  "Business income",
  "Investments",
  "Savings",
  "Inheritance",
  "Property sale",
  "Other",
] as const;

const schema = z
  .object({
    // Step 1 — Personal
    full_name: z.string().trim().min(2, "Full legal name required").max(120),
    date_of_birth: z
      .string()
      .min(1, "Required")
      .refine((v) => {
        const d = new Date(v);
        if (Number.isNaN(d.getTime())) return false;
        const age = (Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000);
        return age >= 18 && age < 120;
      }, "You must be at least 18"),
    phone: z
      .string()
      .trim()
      .min(7, "Enter a valid phone")
      .max(20)
      .regex(/^[+0-9()\-\s]+$/, "Digits, spaces and +()- only"),
    tax_id_last4: z
      .string()
      .trim()
      .regex(/^\d{4}$/, "Last 4 digits only"),

    // Step 2 — Address
    address: z.string().trim().min(4, "Required").max(200),
    city: z.string().trim().min(2, "Required").max(80),
    state_region: z.string().trim().min(2, "Required").max(80),
    postal_code: z.string().trim().min(2, "Required").max(20),
    country: z.string().trim().min(2, "Required").max(80),

    // Step 3 — Financial
    employment_status: z.enum(EMPLOYMENT, { message: "Select an option" }),
    occupation: z.string().trim().min(2, "Required").max(120),
    annual_income: z.enum(INCOME_BANDS, { message: "Select a band" }),
    source_of_funds: z.enum(SOURCES, { message: "Select a source" }),
    preferred_account_type: z.enum(ACCOUNT_TYPES),
    preferred_currency: z.enum(CURRENCIES),

    // Step 4 — Credentials
    email: z.string().trim().email().max(255),
    password: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Z]/, "Add an uppercase letter")
      .regex(/[a-z]/, "Add a lowercase letter")
      .regex(/[0-9]/, "Add a number"),
    confirm_password: z.string(),
    marketing_opt_in: z.boolean(),
    terms_accepted: z.literal(true, { message: "You must accept the terms" }),
  })
  .refine((d) => d.password === d.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords do not match",
  });

type FormValues = z.infer<typeof schema>;

const STEPS: { title: string; fields: (keyof FormValues)[] }[] = [
  {
    title: "Personal",
    fields: ["full_name", "date_of_birth", "phone", "tax_id_last4"],
  },
  {
    title: "Address",
    fields: ["address", "city", "state_region", "postal_code", "country"],
  },
  {
    title: "Financial",
    fields: [
      "employment_status",
      "occupation",
      "annual_income",
      "source_of_funds",
      "preferred_account_type",
      "preferred_currency",
    ],
  },
  {
    title: "Credentials",
    fields: ["email", "password", "confirm_password", "terms_accepted"],
  },
];

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Open an account — Crest Nova Holdings" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (session) navigate({ to: "/app", replace: true });
  }, [session, navigate]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      full_name: "",
      date_of_birth: "",
      phone: "",
      tax_id_last4: "",
      address: "",
      city: "",
      state_region: "",
      postal_code: "",
      country: "",
      employment_status: undefined as unknown as FormValues["employment_status"],
      occupation: "",
      annual_income: undefined as unknown as FormValues["annual_income"],
      source_of_funds: undefined as unknown as FormValues["source_of_funds"],
      preferred_account_type: "checking",
      preferred_currency: "USD",
      email: "",
      password: "",
      confirm_password: "",
      marketing_opt_in: false,
      terms_accepted: false as unknown as true,
    },
  });

  const goNext = async () => {
    const valid = await form.trigger(STEPS[step].fields as (keyof FormValues)[]);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: window.location.origin + "/app",
        data: {
          full_name: values.full_name,
          phone: values.phone,
          country: values.country,
          address: values.address,
          city: values.city,
          state_region: values.state_region,
          postal_code: values.postal_code,
          date_of_birth: values.date_of_birth,
          tax_id_last4: values.tax_id_last4,
          occupation: values.occupation,
          employment_status: values.employment_status,
          annual_income: values.annual_income,
          source_of_funds: values.source_of_funds,
          preferred_account_type: values.preferred_account_type,
          preferred_currency: values.preferred_currency,
          marketing_opt_in: values.marketing_opt_in,
        },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created. Check your email to verify.");
  };

  const onGoogle = async () => {
    const res = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/app",
    });
    if (res.error) toast.error(res.error.message);
  };

  return (
    <AuthShell
      title="Open your account"
      subtitle="A few quick details — same intake as a traditional bank, only faster."
    >
      {step === 0 && (
        <>
          <Button
            variant="outline"
            className="w-full"
            onClick={onGoogle}
            type="button"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign up with Google
          </Button>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-2 text-muted-foreground">
                or open an account with email
              </span>
            </div>
          </div>
        </>
      )}

      {/* Stepper */}
      <ol className="flex items-center justify-between mb-6 text-xs">
        {STEPS.map((s, i) => (
          <li key={s.title} className="flex-1 flex items-center">
            <div
              className={cn(
                "h-7 w-7 rounded-full grid place-content-center border font-medium",
                i < step && "bg-primary text-primary-foreground border-primary",
                i === step && "border-primary text-primary",
                i > step && "text-muted-foreground",
              )}
            >
              {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </div>
            <span
              className={cn(
                "ml-2 hidden sm:inline",
                i === step ? "text-foreground font-medium" : "text-muted-foreground",
              )}
            >
              {s.title}
            </span>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-px bg-border mx-2" />
            )}
          </li>
        ))}
      </ol>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {step === 0 && (
            <>
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full legal name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane A. Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date_of_birth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tax_id_last4"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax ID (last 4)</FormLabel>
                      <FormControl>
                        <Input
                          inputMode="numeric"
                          maxLength={4}
                          placeholder="1234"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>SSN / TIN — last 4 only.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 555 123 4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {step === 1 && (
            <>
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Park Avenue" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state_region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State / Region</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="postal_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal code</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="United States" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <FormField
                control={form.control}
                name="employment_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employment status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EMPLOYMENT.map((e) => (
                          <SelectItem key={e} value={e}>
                            {e}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="occupation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Occupation</FormLabel>
                    <FormControl>
                      <Input placeholder="Software engineer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="annual_income"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual income</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select range" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {INCOME_BANDS.map((b) => (
                            <SelectItem key={b} value={b}>
                              {b}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="source_of_funds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary source of funds</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select source" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SOURCES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="preferred_account_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ACCOUNT_TYPES.map((t) => (
                            <SelectItem key={t} value={t} className="capitalize">
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="preferred_currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CURRENCIES.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="At least 8 characters" {...field} />
                    </FormControl>
                    <FormDescription>
                      Use 8+ chars with upper, lower and a number.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirm_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="marketing_opt_in"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start gap-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0 text-sm font-normal text-muted-foreground">
                      Send me product updates and offers (optional).
                    </FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="terms_accepted"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start gap-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={!!field.value}
                        onCheckedChange={(v) => field.onChange(v === true)}
                      />
                    </FormControl>
                    <div className="space-y-1">
                      <FormLabel className="!mt-0 text-sm font-normal">
                        I agree to the Terms of Service, Privacy Policy and
                        electronic disclosures, and I confirm the information
                        provided is true and accurate.
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </>
          )}

          <div className="flex items-center gap-3 pt-2">
            {step > 0 && (
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={loading}
              >
                Back
              </Button>
            )}
            {step < STEPS.length - 1 ? (
              <Button
                type="button"
                className="flex-1 bg-gradient-hero"
                onClick={goNext}
              >
                Continue
              </Button>
            ) : (
              <Button
                type="submit"
                className="flex-1 bg-gradient-hero"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Open my account"
                )}
              </Button>
            )}
          </div>
        </form>
      </Form>

      <p className="mt-6 text-sm text-center text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
