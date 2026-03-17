# Finance Toolkit

A collection of personal finance calculators, hosted on GitHub Pages.

## Tools

### [Mortgage Offset Calculator](https://bstillitano.github.io/finance-toolkit/)

Model how offset account contributions and lump-sum windfalls accelerate your mortgage payoff.

**Features:**
- Input your loan balance, offset balance, interest rate, and weekly repayment
- Add any number of **windfalls** (lump sums) at specific months — e.g. bonuses, tax returns, inheritances
- Add any number of **scenarios** comparing different monthly offset contribution levels
- Toggle scenarios on/off to declutter the chart
- Live-updating chart and milestone table showing:
  - When the effective balance (loan minus offset) hits $0 — i.e. when you stop paying interest
  - When the actual loan balance is fully repaid
- All calculations run in-browser — no data is sent anywhere

**No build step required.** Pure HTML + vanilla JS + [Chart.js](https://www.chartjs.org/) via CDN.

---

## Running Locally

Just open `index.html` in a browser. No server needed.

```bash
open index.html
```

## Deploying

This repo is configured for GitHub Pages. Any push to `main` will update the live site at:

```
https://bstillitano.github.io/finance-toolkit/
```

To enable GitHub Pages on a new fork:
1. Go to **Settings → Pages**
2. Set source to **Deploy from branch → main → / (root)**

---

## Assumptions & Limitations

- Interest is calculated monthly on the effective balance (loan minus offset)
- Weekly repayments are converted to a monthly equivalent (`weekly × 52 / 12`)
- Once the offset exceeds the loan balance, no further offset growth is modelled (surplus would need to be redirected)
- All figures are approximate and for illustrative purposes only — not financial advice

---

## License

MIT

## Tools

| Tool | Description |
|------|-------------|
| [Mortgage Offset Calculator](mortgage-offset.html) | Offset contributions, windfalls, multiple scenarios |
| [Loan Comparison](loan-comparison.html) | Side-by-side mortgage comparison |
| [Property Cash Flow](property-cashflow.html) | Investment property yield and negative gearing |
| [Stamp Duty](stamp-duty.html) | All Australian states, FHB concessions |
| [Rent vs. Buy](rent-vs-buy.html) | Break-even analysis with opportunity cost |
| [Borrowing Capacity](borrowing-capacity.html) | Max loan estimate with APRA buffer |
| [Offset vs. Invest](offset-vs-invest.html) | Offset vs. market returns after tax |
| [Compound Growth](compound-growth.html) | Lump sum + contributions with tax toggle |
| [Net Worth Tracker](net-worth.html) | Assets vs. liabilities dashboard |
| [FIRE Timeline](fire-timeline.html) | Path to financial independence |
| [Salary & Tax Optimiser](salary-tax.html) | Take-home pay, super, salary sacrifice |
