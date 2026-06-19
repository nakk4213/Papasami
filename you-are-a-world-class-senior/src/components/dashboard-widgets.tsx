import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export function StatGrid({ stats }: { stats: { label: string; value: string | number; helper?: string }[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <p className="text-sm text-muted-foreground">{stat.label}</p>
          <div className="mt-3 text-3xl font-black">{stat.value}</div>
          {stat.helper ? <p className="mt-2 text-xs text-muted-foreground">{stat.helper}</p> : null}
        </Card>
      ))}
    </div>
  );
}

export function RevenueBars({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  return (
    <Card>
      <h2 className="font-semibold">Revenue analytics</h2>
      <div className="mt-6 flex h-48 items-end gap-3">
        {values.map((value, index) => (
          <div key={index} className="flex flex-1 flex-col items-center gap-2">
            <div className="w-full rounded-t-xl bg-gradient-to-t from-red-700 via-red-500 to-amber-400" style={{ height: `${(value / max) * 100}%` }} />
            <span className="text-xs text-muted-foreground">{formatCurrency(value).replace(".00", "")}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function DataTable({ title, rows }: { title: string; rows: Record<string, string | number>[] }) {
  const headers = Object.keys(rows[0] ?? { Empty: "" });
  return (
    <Card>
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{rows.length} records</p>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-muted-foreground">
            <tr>{headers.map((header) => <th key={header} className="py-3">{header}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-t border-white/10">
                {headers.map((header) => <td key={header} className="py-3">{row[header]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
