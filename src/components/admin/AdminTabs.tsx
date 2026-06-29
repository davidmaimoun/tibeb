"use client";

import { useState } from "react";
import { ClipboardList, CalendarDays } from "lucide-react";
import { AvailabilityManager } from "@/components/admin/AvailabilityManager";
import { OrdersPanel, type OrderRow } from "@/components/admin/OrdersPanel";
import { cn } from "@/lib/utils";

type DayRow = { date: string; status: "AVAILABLE" | "UNAVAILABLE" | "BOOKED" };

export function AdminTabs({
  orders,
  days,
}: {
  orders: OrderRow[];
  days: DayRow[];
}) {
  const [tab, setTab] = useState<"orders" | "availability">("orders");

  const nav = [
    { id: "orders" as const, label: "Orders", icon: ClipboardList, count: orders.length },
    { id: "availability" as const, label: "Availability", icon: CalendarDays },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[210px_1fr] lg:items-start">
      <nav className="flex gap-2 lg:flex-col">
        {nav.map((n) => {
          const Icon = n.icon;
          const active = tab === n.id;
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => setTab(n.id)}
              className={cn(
                "inline-flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors",
                active
                  ? "bg-ink text-cream"
                  : "text-ink/70 hover:bg-ink/5",
              )}
            >
              <Icon className="size-[18px]" />
              {n.label}
              {typeof n.count === "number" && (
                <span
                  className={cn(
                    "ml-auto rounded-full px-2 py-0.5 text-xs",
                    active ? "bg-cream/20" : "bg-ink/10",
                  )}
                >
                  {n.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div>
        {tab === "orders" ? (
          <OrdersPanel rows={orders} />
        ) : (
          <AvailabilityManager initial={days} />
        )}
      </div>
    </div>
  );
}