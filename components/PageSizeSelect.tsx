'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type PageSizeSelectProps = {
  value: number;
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export function PageSizeSelect({ value }: PageSizeSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = (newValue: string) => {
    const params = new URLSearchParams(searchParams?.toString());
    params.set('pageSize', newValue);
    params.set('page', '1');

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <Select value={String(value)} onValueChange={handleChange}>
      <SelectTrigger className="w-20">
        <SelectValue placeholder="10" />
      </SelectTrigger>
      <SelectContent>
        {PAGE_SIZE_OPTIONS.map(option => (
          <SelectItem key={option} value={String(option)}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
