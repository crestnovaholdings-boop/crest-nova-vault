export const fmtMoney = (amount: number | string, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(Number(amount));

export const fmtDate = (d: string | Date) =>
  new Date(d).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

export const fmtShortDate = (d: string | Date) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export const statusColor = (s: string) => {
  switch (s) {
    case "approved": return "bg-success/15 text-success border-success/30";
    case "pending": return "bg-gold/15 text-gold border-gold/30";
    case "rejected": return "bg-destructive/15 text-destructive border-destructive/30";
    default: return "bg-muted text-muted-foreground";
  }
};
