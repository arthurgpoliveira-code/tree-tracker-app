import { useState } from "react";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { KPIHeader } from "@/components/dashboard/KPIHeader";
import { NPSVibeMatrix } from "@/components/dashboard/NPSVibeMatrix";
import { DriversSection } from "@/components/dashboard/DriversSection";
import { WayfindingSection } from "@/components/dashboard/WayfindingSection";
import { SegmentsSection } from "@/components/dashboard/SegmentsSection";
import { PreferencesSection } from "@/components/dashboard/PreferencesSection";
import { DataHealthSection } from "@/components/dashboard/DataHealthSection";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function Dashboard() {
  const [filters, setFilters] = useState({
    dateRange: {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      to: new Date(),
    },
    eventType: null,
    gender: null,
    ageBand: null,
    transportMode: null,
  });

  const { data, isLoading } = useDashboardData(filters);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold">Dashboard CX</h1>
          <DashboardFilters filters={filters} onFiltersChange={setFilters} />
        </div>

        <KPIHeader data={data} isLoading={isLoading} />

        <NPSVibeMatrix data={data} isLoading={isLoading} />

        <DriversSection data={data} isLoading={isLoading} />

        <WayfindingSection data={data} isLoading={isLoading} />

        <SegmentsSection data={data} isLoading={isLoading} />

        <PreferencesSection data={data} isLoading={isLoading} />

        <DataHealthSection data={data} isLoading={isLoading} />
      </div>
    </div>
  );
}
