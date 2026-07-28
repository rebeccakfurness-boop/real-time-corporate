'use client';

import { useCallback, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { SlidersHorizontal } from 'lucide-react';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterBarOptions {
  divisions: FilterOption[];
  departments: FilterOption[];
  teams: FilterOption[];
  locations: FilterOption[];
  workplaceGroups: FilterOption[];
}

const DOMAIN_OPTIONS: FilterOption[] = [
  { value: 'WORK_DESIGN', label: 'Work Design' },
  { value: 'CULTURE_AND_LEADERSHIP', label: 'Culture & Leadership' },
  { value: 'SOCIAL_CONNECTIONS', label: 'Social Connections' },
  { value: 'MANA_WHENUA', label: 'Mana Whenua' },
  { value: 'DEI', label: 'DEI' },
  { value: 'PERSONAL_FACTORS', label: 'Personal Factors' },
  { value: 'PSYCHOLOGICAL_SAFETY', label: 'Psychological Safety' },
  { value: 'PSYCHOSOCIAL_RISK', label: 'Psychosocial Risk' },
  { value: 'BURNOUT_BAT', label: 'Burnout (BAT)' },
  { value: 'WHO5', label: 'WHO-5' },
  { value: 'TE_WHARE_TAPA_WHA', label: 'Te Whare Tapa Whā' },
];

const RANGE_OPTIONS: FilterOption[] = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last quarter' },
  { value: '180', label: 'Last 6 months' },
  { value: '365', label: 'Last 12 months' },
];

function FilterSelect({
  param,
  placeholder,
  options,
}: {
  param: string;
  placeholder: string;
  options: FilterOption[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const value = searchParams.get(param) ?? '';

  const onChange = useCallback(
    (next: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next === '__all__') params.delete(param);
      else params.set(param, next);
      startTransition(() => router.push(`${pathname}?${params.toString()}`));
    },
    [param, pathname, router, searchParams]
  );

  return (
    <Select value={value || '__all__'} onValueChange={onChange}>
      <SelectTrigger className="h-8 w-auto min-w-[9rem] gap-1.5 border-dashed text-xs">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__all__">All {placeholder}</SelectItem>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function DashboardFilterBar({ options }: { options: FilterBarOptions }) {
  const searchParams = useSearchParams();
  const activeCount = ['division', 'department', 'team', 'location', 'workplaceGroup', 'seniority', 'employmentType', 'roleType', 'manager', 'domain'].filter(
    (k) => searchParams.get(k)
  ).length;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card/60 p-2.5">
      <span className="flex items-center gap-1.5 pl-1 text-xs font-medium text-muted-foreground">
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Filters
      </span>
      <FilterSelect param="division" placeholder="Divisions" options={options.divisions} />
      <FilterSelect param="department" placeholder="Departments" options={options.departments} />
      <FilterSelect param="team" placeholder="Teams" options={options.teams} />
      <FilterSelect param="location" placeholder="Locations" options={options.locations} />
      <FilterSelect param="workplaceGroup" placeholder="Workplace Groups" options={options.workplaceGroups} />
      <FilterSelect
        param="seniority"
        placeholder="Seniority"
        options={[
          { value: 'EXECUTIVE', label: 'Executive' },
          { value: 'SENIOR_LEADER', label: 'Senior Leader' },
          { value: 'MANAGER', label: 'Manager' },
          { value: 'TEAM_LEAD', label: 'Team Lead' },
          { value: 'INDIVIDUAL_CONTRIBUTOR', label: 'Individual Contributor' },
        ]}
      />
      <FilterSelect
        param="employmentType"
        placeholder="Employment Type"
        options={[
          { value: 'FULL_TIME', label: 'Full Time' },
          { value: 'PART_TIME', label: 'Part Time' },
          { value: 'CASUAL', label: 'Casual' },
          { value: 'FIXED_TERM', label: 'Fixed Term' },
          { value: 'CONTRACTOR', label: 'Contractor' },
        ]}
      />
      <FilterSelect param="domain" placeholder="Wellbeing Domains" options={DOMAIN_OPTIONS} />
      <div className="ml-auto flex items-center gap-2">
        {activeCount > 0 && <Badge variant="secondary">{activeCount} active</Badge>}
        <FilterSelect param="range" placeholder="Date Range" options={RANGE_OPTIONS} />
      </div>
    </div>
  );
}
