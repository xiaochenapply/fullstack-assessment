'use client';

import { useState } from 'react';
import { checkoutSchema, type CheckoutFormData } from '@/lib/checkout-schema';
import { useCartStore } from '@/lib/cart-store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, MapPin, Mail, Check, Home } from 'lucide-react';

type FieldErrors = Partial<Record<keyof CheckoutFormData, string>>;

const initialForm: CheckoutFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  cardNumber: '',
  cardName: '',
  expiryDate: '',
  cvv: '',
  billingAddress: '',
  billingCity: '',
  billingState: '',
  billingZipCode: '',
};

const STEPS = [
  { label: 'Information', icon: MapPin },
  { label: 'Payment', icon: CreditCard },
  { label: 'Complete', icon: Check },
];

interface CheckoutFormProps {
  onSuccess: () => void;
}

export function CheckoutForm({ onSuccess }: CheckoutFormProps) {
  const [form, setForm] = useState<CheckoutFormData>(initialForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const totalPrice = useCartStore((s) => s.totalPrice());

  const updateField = (field: keyof CheckoutFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const shippingFields: (keyof CheckoutFormData)[] = [
    'firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode',
  ];
  const paymentFields: (keyof CheckoutFormData)[] = [
    'cardNumber', 'cardName', 'expiryDate', 'cvv',
    'billingAddress', 'billingCity', 'billingState', 'billingZipCode',
  ];

  const validateStep = (fields: (keyof CheckoutFormData)[]) => {
    const result = checkoutSchema.safeParse(form);
    if (result.success) return true;

    const fieldErrors: FieldErrors = {};
    result.error.issues.forEach((issue) => {
      const field = issue.path[0] as keyof CheckoutFormData;
      if (fields.includes(field) && !fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    });

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 0) {
      if (validateStep(shippingFields)) {
        setErrors({});
        setStep(1);
      }
    } else if (step === 1) {
      const formToValidate = sameAsShipping
        ? { ...form, billingAddress: form.address, billingCity: form.city, billingState: form.state, billingZipCode: form.zipCode }
        : form;
      setForm(formToValidate);
      const result = checkoutSchema.safeParse(formToValidate);
      const fieldErrors: FieldErrors = {};
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          const field = issue.path[0] as keyof CheckoutFormData;
          if (paymentFields.includes(field) && !fieldErrors[field]) {
            fieldErrors[field] = issue.message;
          }
        });
      }
      if (Object.keys(fieldErrors).length === 0) {
        setErrors({});
        setSubmitted(true);
        setStep(2);
        onSuccess();
      }
    }
  };

  if (submitted) {
    return (
      <div className="space-y-6">
        <StepIndicator currentStep={2} />
        <Card className="text-center py-16">
          <CardContent>
            <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="h-7 w-7 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Order Placed Successfully!</h2>
            <p className="text-muted-foreground mb-1">
              Thank you for your purchase.
            </p>
            <p className="text-muted-foreground text-sm">
              Your order is being processed and you&apos;ll receive a confirmation email shortly.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StepIndicator currentStep={step} />

      {step === 0 && (
        <div className="space-y-5">
          {/* Shipping Address */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field
                  label="First Name"
                  value={form.firstName}
                  error={errors.firstName}
                  onChange={(v) => updateField('firstName', v)}
                  required
                />
                <Field
                  label="Last Name"
                  value={form.lastName}
                  error={errors.lastName}
                  onChange={(v) => updateField('lastName', v)}
                  required
                />
              </div>
              <Field
                label="Street Address"
                value={form.address}
                error={errors.address}
                onChange={(v) => updateField('address', v)}
                required
              />
              <div className="grid grid-cols-3 gap-3">
                <Field
                  label="City"
                  value={form.city}
                  error={errors.city}
                  onChange={(v) => updateField('city', v)}
                  required
                />
                <Field
                  label="State"
                  value={form.state}
                  error={errors.state}
                  onChange={(v) => updateField('state', v)}
                  required
                />
                <Field
                  label="ZIP Code"
                  value={form.zipCode}
                  error={errors.zipCode}
                  onChange={(v) => updateField('zipCode', v)}
                  placeholder="12345"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Mail className="h-4 w-4" />
                Contact Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Field
                label="Email"
                type="email"
                value={form.email}
                error={errors.email}
                onChange={(v) => updateField('email', v)}
                required
              />
              <Field
                label="Mobile Number"
                type="tel"
                value={form.phone}
                error={errors.phone}
                onChange={(v) => updateField('phone', v)}
                required
              />
            </CardContent>
          </Card>

          <Button onClick={handleNext} className="w-full" size="lg">
            Continue to Payment
          </Button>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-5">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="h-4 w-4" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/30 mb-1">
                <div className="h-4 w-4 rounded-full border-4 border-primary" />
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Debit / Credit Card</span>
              </div>
              <Field
                label="Card Number"
                value={form.cardNumber}
                error={errors.cardNumber}
                onChange={(v) => updateField('cardNumber', v)}
                placeholder="1234 1234 1234 1234"
                required
              />
              <Field
                label="Name on Card"
                value={form.cardName}
                error={errors.cardName}
                onChange={(v) => updateField('cardName', v)}
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Valid Date"
                  value={form.expiryDate}
                  error={errors.expiryDate}
                  onChange={(v) => updateField('expiryDate', v)}
                  placeholder="MM/YY"
                  required
                />
                <Field
                  label="CVV"
                  value={form.cvv}
                  error={errors.cvv}
                  onChange={(v) => updateField('cvv', v)}
                  placeholder="CVV"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Your card details would be securely saved for faster payments. Your CVV will not be stored.
              </p>
            </CardContent>
          </Card>

          {/* Billing Address */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Home className="h-4 w-4" />
                Billing Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sameAsShipping}
                  onChange={(e) => setSameAsShipping(e.target.checked)}
                  className="h-4 w-4 rounded border-input"
                />
                <span className="text-sm">Same as shipping address</span>
              </label>
              {!sameAsShipping && (
                <div className="space-y-3 pt-1">
                  <Field
                    label="Street Address"
                    value={form.billingAddress}
                    error={errors.billingAddress}
                    onChange={(v) => updateField('billingAddress', v)}
                    required
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <Field
                      label="City"
                      value={form.billingCity}
                      error={errors.billingCity}
                      onChange={(v) => updateField('billingCity', v)}
                      required
                    />
                    <Field
                      label="State"
                      value={form.billingState}
                      error={errors.billingState}
                      onChange={(v) => updateField('billingState', v)}
                      required
                    />
                    <Field
                      label="ZIP Code"
                      value={form.billingZipCode}
                      error={errors.billingZipCode}
                      onChange={(v) => updateField('billingZipCode', v)}
                      placeholder="12345"
                      required
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              size="lg"
              onClick={() => setStep(0)}
            >
              Back
            </Button>
            <Button onClick={handleNext} className="flex-1" size="lg">
              Pay ${totalPrice.toFixed(2)}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-0">
      {STEPS.map((s, idx) => (
        <div key={s.label} className="flex items-center">
          <div className="flex items-center gap-1.5">
            <div
              className={`flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold transition-colors ${
                idx < currentStep
                  ? 'bg-green-600 text-white'
                  : idx === currentStep
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {idx < currentStep ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                idx + 1
              )}
            </div>
            <span
              className={`text-sm ${
                idx <= currentStep
                  ? 'font-medium text-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              {s.label}
            </span>
          </div>
          {idx < STEPS.length - 1 && (
            <div
              className={`w-16 h-px mx-3 ${
                idx < currentStep ? 'bg-green-600' : 'bg-border'
              }`}
              style={{ borderTop: '2px dashed', borderColor: idx < currentStep ? 'rgb(22 163 74)' : undefined }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function Field({
  label,
  value,
  error,
  onChange,
  type = 'text',
  placeholder,
  required,
}: {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium leading-none">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || label}
        className={error ? 'border-destructive' : ''}
      />
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
