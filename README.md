# Finance Toolkit

A suite of open-source personal finance calculators built for Australians. No frameworks, no build step — pure HTML, CSS, and vanilla JavaScript, deployed to GitHub Pages.

**Live site:** [bstillitano.github.io/finance-toolkit](https://bstillitano.github.io/finance-toolkit/)

---

## Tools

### Mortgage & Property
| Tool | Description |
|------|-------------|
| [Mortgage Offset Calculator](https://bstillitano.github.io/finance-toolkit/mortgage-offset.html) | Model offset contributions and lump-sum windfalls across multiple scenarios. Includes interest saved, effective balance, and full loan payoff projections. |
| [Loan Comparison](https://bstillitano.github.io/finance-toolkit/loan-comparison.html) | Compare two mortgages side by side — rates, terms, P&I vs. interest only, offset, and annual fees. |
| [Repayment to Loan Size](https://bstillitano.github.io/finance-toolkit/repayment-to-loan.html) | Enter a weekly, fortnightly, or monthly repayment budget and find the maximum loan you can service. Includes rate and term sensitivity tables. |
| [Property Cash Flow](https://bstillitano.github.io/finance-toolkit/property-cashflow.html) | Analyse an investment property's gross/net yield, negative gearing benefit, and Div 40/43 depreciation impact. |
| [Stamp Duty Calculator](https://bstillitano.github.io/finance-toolkit/stamp-duty.html) | Transfer duty for all Australian states and territories. Supports owner-occupier, investor, first home buyer, and foreign purchaser rates. |
| [Rent vs. Buy](https://bstillitano.github.io/finance-toolkit/rent-vs-buy.html) | Find the break-even horizon where buying beats renting, accounting for stamp duty, opportunity cost of deposit, and property growth. |
| [Borrowing Capacity](https://bstillitano.github.io/finance-toolkit/borrowing-capacity.html) | Estimate maximum loan size based on income, expenses, and liabilities. Uses APRA serviceability buffer with multiple lender scenarios. |

### Investing & Wealth
| Tool | Description |
|------|-------------|
| [Offset vs. Invest](https://bstillitano.github.io/finance-toolkit/offset-vs-invest.html) | Compare putting spare cash into your offset against investing in the market. Models after-tax returns across growth, income, and super structures. |
| [Compound Growth](https://bstillitano.github.io/finance-toolkit/compound-growth.html) | Model lump sum and regular contributions compounding over time. Toggle between no tax, super (15%), income, and CGT discount treatment. |
| [Net Worth Tracker](https://bstillitano.github.io/finance-toolkit/net-worth.html) | Track assets and liabilities across home equity, super, investments, and debt. Visualised with breakdown and summary charts. |

### Retirement & Tax
| Tool | Description |
|------|-------------|
| [FIRE Timeline](https://bstillitano.github.io/finance-toolkit/fire-timeline.html) | Calculate your path to financial independence using the 4% rule. Shows FI date, post-retirement portfolio longevity, and year-by-year net worth vs. target. |
| [Salary & Tax Optimiser](https://bstillitano.github.io/finance-toolkit/salary-tax.html) | Model take-home pay under different super contribution levels and salary sacrifice strategies. Based on 2024–25 Australian tax rates including Medicare levy and HELP repayments. |
| [CGT Discount vs. Indexation](https://bstillitano.github.io/finance-toolkit/cgt-calculator.html) | Compare after-tax proceeds on an asset sale under the 50% CGT discount method and the new CPI-indexed cost base method. Shows break-even inflation and supports individual, SMSF, and company structures. |

---

## Architecture

The toolkit is intentionally simple — no bundler, no framework, no npm.

```
finance-toolkit/
├── index.html              # Landing page
├── shared.css              # Design system (dark theme, typography, components)
├── nav.js                  # Global nav, auth (Supabase), and cloud sync
├── config.js               # Runtime config — gitignored, injected at deploy time
├── config.example.js       # Template for local development
├── [tool].html             # One self-contained file per tool
├── supabase/
│   └── migrations/
│       └── 001_tool_states.sql
└── .github/
    └── workflows/
        └── deploy.yml      # GitHub Actions — injects secrets, deploys to Pages
```

Each tool is a single `.html` file containing all markup, styles, and logic. Tools share `shared.css` for consistent design and `nav.js` for authentication and cloud sync.

---

## Features

- **Persistent state** — all inputs are saved to `localStorage` automatically and restored on next visit
- **Cloud sync** — sign in to sync your data across devices via Supabase
- **Authentication** — email/password and magic link sign-in via Supabase Auth
- **Analytics** — Firebase Analytics with user identification (authenticated vs. anonymous)
- **No build step** — open any `.html` file directly in a browser for local development
- **Mobile responsive** — all tools work on phone and tablet

---

## Running Locally

Clone the repo and open any HTML file directly — no server required for most features.

```bash
git clone https://github.com/bstillitano/finance-toolkit.git
cd finance-toolkit
open index.html
```

To enable cloud sync and auth locally, copy the config template and fill in your Supabase credentials:

```bash
cp config.example.js config.js
# Edit config.js with your Supabase URL and anon key
```

---

## Deployment

The site deploys automatically to GitHub Pages on every push to `main` via GitHub Actions. Secrets are injected into `config.js` at build time — the file is never committed to the repository.

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anonymous (public) key |
| `FIREBASE_API_KEY` | Firebase project API key |
| `FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `FIREBASE_APP_ID` | Firebase app ID |
| `FIREBASE_MEASUREMENT_ID` | Firebase Analytics measurement ID (G-XXXXXXXX) |

### Enabling GitHub Pages

1. Go to **Settings → Pages**
2. Set source to **GitHub Actions**
3. Push to `main` — the workflow handles the rest

---

## Supabase Setup

Run the migration to create the cloud sync table:

```sql
-- supabase/migrations/001_tool_states.sql
-- Run this in your Supabase SQL editor or via the CLI
```

The schema stores per-user, per-tool JSON state with RLS policies ensuring users can only access their own data.

In the Supabase dashboard, set:
- **Authentication → URL Configuration → Site URL:** `https://bstillitano.github.io/finance-toolkit/`
- **Authentication → URL Configuration → Redirect URLs:** `https://bstillitano.github.io/finance-toolkit/`

---

## Tech Stack

- **Frontend:** Vanilla HTML, CSS, JavaScript
- **Charts:** [Chart.js](https://www.chartjs.org/) (via CDN)
- **Auth & sync:** [Supabase](https://supabase.com/)
- **Analytics:** [Firebase Analytics](https://firebase.google.com/products/analytics)
- **Hosting:** GitHub Pages
- **CI/CD:** GitHub Actions

---

## Disclaimer

All calculations are approximate and for illustrative purposes only. This is not financial advice. Tax rates and thresholds are based on 2024–25 Australian figures and may not reflect recent legislative changes. Always verify with a qualified financial adviser or the relevant government authority.

---

## License

MIT
