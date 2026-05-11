'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GraduationCap, Building2, User, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

const steps = [
  { id: 1, label: 'School Info', icon: Building2 },
  { id: 2, label: 'Admin Setup', icon: User },
  { id: 3, label: 'Choose Plan', icon: CheckCircle },
];

const plans = [
  {
    name: 'Starter',
    price: '৳999/month',
    students: '500 students',
    color: 'border-gray-200',
    badge: null,
    features: ['Student management', 'Attendance', 'Fee collection', 'Basic reports', '5GB storage'],
  },
  {
    name: 'Professional',
    price: '৳2,499/month',
    students: '2,000 students',
    color: 'border-blue-500',
    badge: 'Most Popular',
    features: ['All Starter features', 'SMS notifications', 'Payroll', 'Advanced reports', 'Custom domain', '20GB storage'],
  },
  {
    name: 'Enterprise',
    price: '৳5,999/month',
    students: 'Unlimited',
    color: 'border-purple-400',
    badge: 'Unlimited',
    features: ['All Professional features', 'Priority support', 'API access', 'White labeling', '100GB storage', 'Dedicated manager'],
  },
];

const inputClass = 'w-full h-11 px-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all';

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState('Professional');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 h-16 flex items-center px-6">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-gray-900">Shiksha ERP</span>
        </div>
        <div className="ml-auto text-sm text-gray-500">
          Already registered?{' '}
          <a href="/login" className="text-blue-600 font-medium hover:text-blue-700">Sign in</a>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-2xl">
          {/* Progress */}
          <div className="flex items-center justify-center gap-4 mb-10">
            {steps.map((s, i) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isDone = step > s.id;
              return (
                <div key={s.id} className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center transition-all
                      ${isDone ? 'bg-green-500 text-white' : isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      {isDone ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-4 w-4" />}
                    </div>
                    <span className={`text-sm font-medium hidden sm:block ${isActive ? 'text-blue-700' : isDone ? 'text-green-600' : 'text-gray-400'}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`h-px w-12 ${step > s.id ? 'bg-green-300' : 'bg-gray-200'}`} />
                  )}
                </div>
              );
            })}
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8">
            {step === 1 && <SchoolInfoStep />}
            {step === 2 && <AdminSetupStep />}
            {step === 3 && (
              <PlanStep selectedPlan={selectedPlan} onSelect={setSelectedPlan} plans={plans} />
            )}

            <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
              <Button
                variant="outline"
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                disabled={step === 1}
                leftIcon={<ArrowLeft className="h-4 w-4" />}
              >
                Back
              </Button>
              <Button
                onClick={() => {
                  if (step < 3) setStep((s) => s + 1);
                  else window.location.href = '/dashboard';
                }}
                rightIcon={step === 3 ? <CheckCircle className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              >
                {step === 3 ? 'Complete Setup' : 'Continue'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SchoolInfoStep() {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">School Information</h2>
      <p className="text-sm text-gray-500 mb-6">Tell us about your educational institution</p>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">School Name *</label>
            <input className={inputClass} placeholder="e.g. Dhaka Model School & College" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Institution Type *</label>
            <select className={inputClass}>
              <option>School</option>
              <option>College</option>
              <option>School & College</option>
              <option>Coaching Center</option>
              <option>Madrasa</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">EIIN Number</label>
            <input className={inputClass} placeholder="e.g. 108459" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone *</label>
            <input className={inputClass} placeholder="01XXXXXXXXX" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
            <input type="email" className={inputClass} placeholder="info@school.edu.bd" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Address *</label>
            <input className={inputClass} placeholder="School address..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">District *</label>
            <select className={inputClass}>
              <option>Dhaka</option>
              <option>Chattogram</option>
              <option>Sylhet</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Approx. Students</label>
            <select className={inputClass}>
              <option>Under 100</option>
              <option>100 - 500</option>
              <option>500 - 2,000</option>
              <option>2,000+</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminSetupStep() {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Admin Account Setup</h2>
      <p className="text-sm text-gray-500 mb-6">Create your administrator account</p>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
            <input className={inputClass} placeholder="Your full name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone *</label>
            <input className={inputClass} placeholder="01XXXXXXXXX" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address *</label>
            <input type="email" className={inputClass} placeholder="admin@school.edu.bd" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password *</label>
            <input type="password" className={inputClass} placeholder="Min 8 characters" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password *</label>
            <input type="password" className={inputClass} placeholder="Confirm password" />
          </div>
        </div>
        <div className="flex items-start gap-2 mt-2">
          <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600" />
          <label className="text-xs text-gray-600">
            I agree to the{' '}
            <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
          </label>
        </div>
      </div>
    </div>
  );
}

function PlanStep({ selectedPlan, onSelect, plans }: {
  selectedPlan: string;
  onSelect: (p: string) => void;
  plans: { name: string; price: string; students: string; color: string; badge: string | null; features: string[] }[];
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Choose Your Plan</h2>
      <p className="text-sm text-gray-500 mb-6">Start with a 14-day free trial. Cancel anytime.</p>
      <div className="grid grid-cols-3 gap-3">
        {plans.map((plan) => (
          <button
            key={plan.name}
            onClick={() => onSelect(plan.name)}
            className={`text-left p-4 rounded-xl border-2 transition-all relative
              ${selectedPlan === plan.name ? 'border-blue-500 bg-blue-50/50 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}
          >
            {plan.badge && (
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap">
                {plan.badge}
              </span>
            )}
            <div className="mt-1">
              <p className="font-bold text-gray-900">{plan.name}</p>
              <p className="text-lg font-bold text-blue-700 mt-1">{plan.price}</p>
              <p className="text-xs text-gray-500 mb-3">{plan.students}</p>
              <ul className="space-y-1.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-1.5 text-xs text-gray-600">
                    <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </button>
        ))}
      </div>
      <p className="text-center text-xs text-gray-400 mt-4">
        All plans include a 14-day free trial. No credit card required.
      </p>
    </div>
  );
}
