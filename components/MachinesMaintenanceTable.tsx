'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Search, Columns3 } from 'lucide-react';
import { AddMachineDialog } from '@/components/AddMachineDialog';
import { PageSizeSelect } from '@/components/PageSizeSelect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

type MachineRow = {
  id: string;
  name: string;
  code?: string | null;
  department?: {
    id: string;
    name: string;
  } | null;
};

type DepartmentOption = {
  id: string;
  name: string;
};

type MachinesMaintenanceTableProps = {
  machineRows: MachineRow[];
  departments: DepartmentOption[];
  onCreateMachine: (formData: FormData) => Promise<void>;
};

const SECTOR_OPTIONS = [
  { value: 'moldagem-extrusao', label: 'Moldagem e Extrusão' },
  { value: 'preparacao-massa', label: 'Preparação de Massa' },
  { value: 'secagem-queima', label: 'Secagem e Queima' },
] as const;

const normalizeText = (value?: string | null) =>
  (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export function MachinesMaintenanceTable({
  machineRows,
  departments,
  onCreateMachine,
}: MachinesMaintenanceTableProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');

  const filteredRows = useMemo(() => {
    const selectedSectorLabel =
      selectedSector === 'all'
        ? ''
        : SECTOR_OPTIONS.find(option => option.value === selectedSector)?.label || '';

    return machineRows.filter(machine => {
      const matchesSearch =
        normalizeText(machine.name).includes(normalizeText(searchTerm)) ||
        normalizeText(machine.code).includes(normalizeText(searchTerm));

      const matchesSector =
        selectedSector === 'all' ||
        normalizeText(machine.department?.name) === normalizeText(selectedSectorLabel);

      return matchesSearch && matchesSector;
    });
  }, [machineRows, searchTerm, selectedSector]);

  const pageParam = searchParams?.get('page');
  const pageSizeParam = searchParams?.get('pageSize');
  const parsedPage = Number.parseInt(pageParam || '1', 10);
  const parsedPageSize = Number.parseInt(pageSizeParam || '10', 10);
  const allowedPageSizes = [10, 20, 50];
  const PAGE_SIZE = allowedPageSizes.includes(parsedPageSize) ? parsedPageSize : 10;
  const totalRows = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / PAGE_SIZE));
  const currentPage = Number.isNaN(parsedPage)
    ? 1
    : Math.min(Math.max(parsedPage, 1), totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedRows = filteredRows.slice(startIndex, endIndex);

  const buildPageHref = (page: number) => {
    const params = new URLSearchParams(searchParams?.toString());

    if (page > 1) {
      params.set('page', String(page));
    } else {
      params.delete('page');
    }

    if (PAGE_SIZE !== 10) {
      params.set('pageSize', String(PAGE_SIZE));
    } else {
      params.delete('pageSize');
    }

    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  return (
    <>
      <div className="mb-4 flex items-center gap-3">
        <div className="relative w-[320px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Pesquise uma máquina"
            value={searchTerm}
            onChange={event => setSearchTerm(event.target.value)}
          />
        </div>

        <Select value={selectedSector} onValueChange={value => setSelectedSector(value)}>
          <SelectTrigger className="w-55">
            <SelectValue placeholder="Selecione um setor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os setores</SelectItem>
            {SECTOR_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" className="gap-2">
          <Columns3 className="h-4 w-4" />
          Colunas visíveis
        </Button>

        <div className="ml-auto">
          <AddMachineDialog departments={departments} onCreateMachine={onCreateMachine} />
        </div>
      </div>

      <div className="overflow-hidden rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[320px]">Máquina</TableHead>
              <TableHead>Setor</TableHead>
              <TableHead>Último reparo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Próxima parada</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRows.map(machine => (
              <TableRow key={machine.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{machine.name}</div>
                    <div className="text-xs text-muted-foreground">{machine.code || '-'}</div>
                  </div>
                </TableCell>
                <TableCell>{machine.department?.name || '-'}</TableCell>
                <TableCell>N/A</TableCell>
                <TableCell>
                  <Badge variant="secondary">Done</Badge>
                </TableCell>
                <TableCell>N/A</TableCell>
              </TableRow>
            ))}
            {paginatedRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Nenhuma máquina encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <p>0 of {totalRows} row(s) selected.</p>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span>Rows per page</span>
            <PageSizeSelect value={PAGE_SIZE} />
          </div>
          <p>Page {currentPage} of {totalPages}</p>
          <div className="flex items-center gap-2">
            {currentPage > 1 ? (
              <Link href={buildPageHref(currentPage - 1)}>
                <Button variant="outline" size="sm" type="button">
                  Anterior
                </Button>
              </Link>
            ) : (
              <Button variant="outline" size="sm" type="button" disabled>
                Anterior
              </Button>
            )}

            {currentPage < totalPages ? (
              <Link href={buildPageHref(currentPage + 1)}>
                <Button variant="outline" size="sm" type="button">
                  Próxima
                </Button>
              </Link>
            ) : (
              <Button variant="outline" size="sm" type="button" disabled>
                Próxima
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
