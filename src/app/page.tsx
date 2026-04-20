import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { Button } from '@/components/ui/button';
import { fetchGraphQL } from '@/lib/api';
import { CREATE_MACHINE_MUTATION, MACHINE_QUERY } from '@/graphql/service-order.queries';
import { MachinesMaintenanceTable } from '@/components/MachinesMaintenanceTable';
import { Wrench, BarChart3, KeyRound } from 'lucide-react';

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

  await searchParams;

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

      <MachinesMaintenanceTable
        machineRows={machineRows}
        departments={departments}
        onCreateMachine={createMachineAction}
      />
    </section>
  );
}