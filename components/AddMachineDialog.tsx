'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type DepartmentOption = {
  id: string;
  name: string;
};

type AddMachineDialogProps = {
  departments: DepartmentOption[];
  onCreateMachine: (formData: FormData) => Promise<void>;
};

export function AddMachineDialog({ departments, onCreateMachine }: AddMachineDialogProps) {
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');

    const formElement = event.currentTarget;
    const formData = new FormData(formElement);

    startTransition(async () => {
      try {
        await onCreateMachine(formData);
        formElement.reset();
        setOpen(false);
        router.refresh();
      } catch (error) {
        setErrorMessage('Erro ao salvar máquina. Verifique os dados e tente novamente.');
        console.error(error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" type="button">
          <Plus className="h-4 w-4" />
          Adicionar máquina
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Adicionar máquina</DialogTitle>
          <DialogDescription>Preencha os dados para cadastrar uma nova máquina.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" id="add-machine-form">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input id="name" name="name" required placeholder="Ex.: Esteira 6" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="departmentId">Departamento *</Label>
              <select
                id="departmentId"
                name="departmentId"
                required
                defaultValue=""
                className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50"
              >
                <option value="" disabled>
                  Selecione um departamento
                </option>
                {departments.map(department => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
              {departments.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Nenhum departamento disponível. Cadastre departamentos primeiro.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Código</Label>
              <Input id="code" name="code" placeholder="Ex.: EST-06" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="identifier">Identificador</Label>
              <Input id="identifier" name="identifier" placeholder="Placa / Número de série" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="functionality">Funcionalidade</Label>
              <Input id="functionality" name="functionality" placeholder="Função da máquina" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">URL da imagem</Label>
              <Input id="imageUrl" name="imageUrl" placeholder="https://..." />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Descrição da máquina"
            />
          </div>

          {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

          <div className="flex justify-end">
            <Button type="submit" className="gap-2" disabled={isPending}>
              <Plus className="h-4 w-4" />
              {isPending ? 'Salvando...' : 'Salvar máquina'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
