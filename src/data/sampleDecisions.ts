import { SampleDecision } from '../types/decision';

export const SAMPLE_DECISIONS: SampleDecision[] = [
  {
    title: "Accept Offer at Series B AI Startup or Stay at Senior Role in Big Tech?",
    options: ["Join Series B AI Startup", "Stay at Big Tech Company"],
    context: "Currently 5 years into Big Tech with strong compensation ($260k total comp) and steady 40hr/wk. Startup offers $190k base + 0.4% equity with heavy upside, but longer hours (55hr/wk) and 18-month cash runway. My goal over the next 5 years is accelerated learning and executive leadership.",
    tag: "Career"
  },
  {
    title: "Purchase a Suburb Single-Family Home vs Continue Renting in City & Maxing Index Investments?",
    options: ["Buy Suburban Home", "Rent in City & Invest Difference"],
    context: "Have saved $160,000 for a down payment. Mortgage rates are currently ~6.8%. Suburb home offers 2,400 sq ft, quiet, and equity building, but $3,900/mo all-in with high property tax and 45min commute. Renting city condo is $2,700/mo, walk to work, zero maintenance, and remaining cash generates ~8% compound in broad market funds.",
    tag: "Financial"
  },
  {
    title: "Build Custom In-House Billing Infrastructure vs Adopt Enterprise Stripe/Paddle Solution?",
    options: ["Build In-House Billing Engine", "Adopt Turnkey Stripe/Paddle Platform"],
    context: "Growing B2B SaaS startup with $2.5M ARR. Complex enterprise tiering and custom usage invoicing. In-house build takes 3 senior engineers 4 months (~$180k labor) but saves ~2.9% transaction fees long-term. Turnkey takes 2 weeks to integrate, carries a 3.5% fee margin, but has battle-tested tax compliance across 40 countries.",
    tag: "Tech & Ops"
  },
  {
    title: "Relocate Internationally to European Office vs Remain in Domestic Headquarters?",
    options: ["Relocate to European Office", "Stay in Domestic HQ"],
    context: "Company offered a 2-year expat placement in Amsterdam. Same salary with cost-of-living adjustments. Opportunity to travel Europe, learn a new cultural dynamic, and lead a local squad. Downside is distance from close family, time-zone disconnect with executive leadership, and partner needing to find new local remote employment.",
    tag: "Life & Relocation"
  }
];
