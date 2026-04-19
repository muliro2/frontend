import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fetchGraphQL } from '@/lib/api';
import { CREATE_MACHINE_MUTATION, MACHINE_QUERY } from '@/graphql/service-order.queries';
import { AddMachineDialog } from '@/components/AddMachineDialog';
import { PageSizeSelect } from '@/components/PageSizeSelect';
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
import {
  Search,
  Wrench,
  BarChart3,
  KeyRound,
  Columns3,
} from 'lucide-react';

interface MachineRow {
  id: string;
  name: string;
  code?: string | null;
  department?: {
    id: string;
    name: string;
  } | null;
}

interface DepartmentOption {
  id: string;
  name: string;
}

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  async function createMachineAction(formData: FormData) {
    'use server';

    const name = String(formData.get('name') || '').trim();
    const departmentId = String(formData.get('departmentId') || '').trim();

    if (!name || !departmentId) {
      throw new Error('Nome e departamento são obrigatórios.');
    }

    const createMachineInput = {
      name,
      departmentId,
      code: String(formData.get('code') || '').trim() || undefined,
      description: String(formData.get('description') || '').trim() || undefined,
      identifier: String(formData.get('identifier') || '').trim() || undefined,
      functionality: String(formData.get('functionality') || '').trim() || undefined,
      imageUrl: String(formData.get('imageUrl') || '').trim() || undefined,
    };

    await fetchGraphQL(CREATE_MACHINE_MUTATION, { createMachineInput });
    revalidatePath('/');
  }

  let machineRows: MachineRow[] = [];
  let departments: DepartmentOption[] = [];

  try {
    const response = await fetchGraphQL(MACHINE_QUERY);
    machineRows = response?.machines || [];
    const departmentMap = new Map<string, DepartmentOption>();

    machineRows.forEach(machine => {
      if (machine.department?.id && machine.department?.name) {
        departmentMap.set(machine.department.id, {
          id: machine.department.id,
          name: machine.department.name,
        });
      }
    });

    departments = Array.from(departmentMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name, 'pt-BR'),
    );
  } catch (error) {
    console.error('Erro ao carregar máquinas na home:', error);
  }

  const resolvedSearchParams = await searchParams;
  const pageParam = Array.isArray(resolvedSearchParams?.page)
    ? resolvedSearchParams?.page[0]
    : resolvedSearchParams?.page;
  const pageSizeParam = Array.isArray(resolvedSearchParams?.pageSize)
    ? resolvedSearchParams?.pageSize[0]
    : resolvedSearchParams?.pageSize;
  const parsedPage = Number.parseInt(pageParam || '1', 10);
  const parsedPageSize = Number.parseInt(pageSizeParam || '10', 10);
  const allowedPageSizes = [10, 20, 50];
  const PAGE_SIZE = allowedPageSizes.includes(parsedPageSize) ? parsedPageSize : 10;
  const totalRows = machineRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / PAGE_SIZE));
  const currentPage = Number.isNaN(parsedPage)
    ? 1
    : Math.min(Math.max(parsedPage, 1), totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedRows = machineRows.slice(startIndex, endIndex);

  const buildPageHref = (page: number) => {
    const params = new URLSearchParams();
    if (page > 1) {
      params.set('page', String(page));
    }
    if (PAGE_SIZE !== 10) {
      params.set('pageSize', String(PAGE_SIZE));
    }
    const query = params.toString();
    return query ? `/?${query}` : '/';
  };

  return (
    <section className="px-6 py-5">
      <div className="mb-5 text-sm text-muted-foreground">Painel &gt; Manutenção</div>

      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-4xl font-semibold">Mecânica e manutenção</h2>
        <div className="flex items-center gap-2">
          <Link href="/ordem-servico">
            <Button variant="outline" className="gap-2">
              <Wrench className="h-4 w-4" />
              Ordem de serviço
            </Button>
          </Link>
          <Button variant="outline" className="gap-2">
            <KeyRound className="h-4 w-4" />
            Registro de paradas
          </Button>
          <Button variant="outline" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Gráficos e relatórios
          </Button>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div className="relative w-[320px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Pesquise uma máquina" />
        </div>

        <Select>
          <SelectTrigger className="w-55">
            <SelectValue placeholder="Selecione um setor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="producao">Produção</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" className="gap-2">
          <Columns3 className="h-4 w-4" />
          Colunas visíveis
        </Button>

        <div className="ml-auto">
          <AddMachineDialog departments={departments} onCreateMachine={createMachineAction} />
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
    </section>
  );
}