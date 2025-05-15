import Link from "next/link"
import { Check } from "lucide-react"

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for students and hobbyists",
    features: ["Access to all project ideas", "Save up to 10 projects", "Basic filtering options", "Community support"],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    description: "For serious learners and professionals",
    features: [
      "Everything in Free",
      "Unlimited saved projects",
      "Advanced filtering and search",
      "AI project recommendations",
      "Priority support",
      "Export projects in multiple formats",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Team",
    price: "$49",
    period: "/month",
    description: "For educational institutions and teams",
    features: [
      "Everything in Pro",
      "Team collaboration features",
      "Custom project templates",
      "Admin dashboard",
      "Usage analytics",
      "Dedicated account manager",
      "SSO authentication",
    ],
    cta: "Contact Sales",
    popular: false,
  },
]

export default function PricingPage() {
  return (
    <main className="container py-20">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-[#534D56] dark:text-[#F8F1FF] sm:text-5xl">
          Simple, transparent pricing
        </h1>
        <p className="mt-6 text-lg text-[#656176] dark:text-[#DECDF5]">
          Choose the plan that's right for you and start discovering project ideas today.
        </p>
      </div>

      <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-2xl border ${
              plan.popular
                ? "border-[#1B998B] bg-[#1B998B]/5 dark:bg-[#1B998B]/10"
                : "border-[#DECDF5] bg-white dark:border-[#656176] dark:bg-[#656176]/30"
            } p-8 shadow-sm`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-0 right-0 mx-auto w-32 rounded-full bg-[#1B998B] px-3 py-1 text-center text-sm font-medium text-white">
                Most Popular
              </div>
            )}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#534D56] dark:text-[#F8F1FF]">{plan.name}</h2>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-bold tracking-tight text-[#534D56] dark:text-[#F8F1FF]">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="ml-1 text-lg font-medium text-[#656176] dark:text-[#DECDF5]">{plan.period}</span>
                )}
              </div>
              <p className="mt-2 text-sm text-[#656176] dark:text-[#DECDF5]">{plan.description}</p>
            </div>

            <ul className="mb-8 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start">
                  <Check
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${plan.popular ? "text-[#1B998B]" : "text-[#1B998B]"}`}
                  />
                  <span className="text-sm text-[#656176] dark:text-[#DECDF5]">{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href={plan.name === "Team" ? "/contact" : "/signup"}
              className={`block w-full rounded-md px-4 py-2 text-center text-sm font-medium ${
                plan.popular
                  ? "bg-[#1B998B] text-white hover:bg-[#1B998B]/90"
                  : "bg-white text-[#534D56] border border-[#DECDF5] hover:bg-[#F8F1FF] dark:bg-[#656176]/50 dark:text-[#F8F1FF] dark:border-[#656176] dark:hover:bg-[#656176]"
              }`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-16 max-w-3xl rounded-2xl border border-[#DECDF5] bg-white p-8 text-center dark:border-[#656176] dark:bg-[#656176]/30">
        <h2 className="text-2xl font-bold text-[#534D56] dark:text-[#F8F1FF]">Need a custom plan?</h2>
        <p className="mt-2 text-[#656176] dark:text-[#DECDF5]">
          Contact us for custom pricing options for larger teams or specific requirements.
        </p>
        <Link
          href="/contact"
          className="mt-6 inline-block rounded-md border border-[#1B998B] bg-white px-6 py-2 text-sm font-medium text-[#1B998B] hover:bg-[#1B998B]/10 dark:bg-transparent"
        >
          Contact Sales
        </Link>
      </div>
    </main>
  )
}
