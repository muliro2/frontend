'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Combobox } from '@/components/ui/combobox';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BreadcrumbHeader } from '@/components/BreadcrumbHeader';
import {
  createIncidentAction,
  fetchLastIncidentsAction,
} from '@/app/actions/incidentes/incidentes';
import { fetchMachinesAction } from '@/app/actions/ordem-servico/ordem-servico';

type Severity = 'BAIXA' | 'MEDIA' | 'ALTA';
type TypeOfOccurrence = 'MECANICA' | 'ELETRICA' | 'SEGURANCA';

interface Incident {
  id: string;
  description: string;
  machineName: string;
  severity: Severity;
  createdAt: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  typeOfOccurrence: TypeOfOccurrence;
}

interface IncidentFormData {
  description: string;
  machineName: string;
  severity: '' | Severity;
  typeOfOccurrence: '' | TypeOfOccurrence;
}

interface IncidentFormErrors {
  description?: string;
  machineName?: string;
  severity?: string;
  typeOfOccurrence?: string;
}

interface Machine {
  id: string;
  name: string;
  code?: string | null;
}

const severityLabel: Record<Severity, string> = {
  BAIXA: 'Baixa',
  MEDIA: 'Media',
  ALTA: 'Alta',
};

const typeLabel: Record<TypeOfOccurrence, string> = {
  MECANICA: 'Mecanica',
  ELETRICA: 'Eletrica',
  SEGURANCA: 'Seguranca',
};

const statusLabel: Record<'OPEN' | 'IN_PROGRESS' | 'RESOLVED', string> = {
  OPEN: 'Aberto',
  IN_PROGRESS: 'Em andamento',
  RESOLVED: 'Resolvido',
};

export default function IncidentesPage() {
  const { data: session } = useSession();

  const [formData, setFormData] = useState<IncidentFormData>({
    description: '',
    machineName: '',
    severity: '',
    typeOfOccurrence: '',
  });
  const [errors, setErrors] = useState<IncidentFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedMachineId, setSelectedMachineId] = useState('');
  const [incidents, setIncidents] = useState<Incident[]>([]);

  const loadIncidents = async () => {
    setIsLoadingList(true);
    try {
      const data = await fetchLastIncidentsAction(5, session);
      setIncidents(data);
    } catch (error) {
      console.error('Erro ao buscar incidentes:', error);
      toast.error('Nao foi possivel carregar os incidentes recentes.');
    } finally {
      setIsLoadingList(false);
    }
  };

  const loadMachines = async () => {
    try {
      const data = await fetchMachinesAction(session);
      setMachines(data);
    } catch (error) {
      console.error('Erro ao buscar maquinas:', error);
      toast.error('Nao foi possivel carregar as maquinas.');
    }
  };

  useEffect(() => {
    if (session === undefined) return;
    loadIncidents();
    loadMachines();
  }, [session]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const validateForm = () => {
    const nextErrors: IncidentFormErrors = {};

    if (!formData.description.trim()) {
      nextErrors.description = 'Descricao e obrigatoria.';
    }

    if (!formData.machineName.trim()) {
      nextErrors.machineName = 'Nome da maquina e obrigatorio.';
    }

    if (!formData.severity) {
      nextErrors.severity = 'Severidade e obrigatoria.';
    }

    if (!formData.typeOfOccurrence) {
      nextErrors.typeOfOccurrence = 'Tipo de ocorrencia e obrigatorio.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) {
      toast.error('Preencha todos os campos obrigatorios.');
      return;
    }

    setIsSubmitting(true);

    try {
      await createIncidentAction(
        {
          description: formData.description.trim(),
          machineName: formData.machineName.trim(),
          severity: formData.severity as Severity,
          typeOfOccurrence: formData.typeOfOccurrence as TypeOfOccurrence,
        },
        session,
      );

      setFormData({
        description: '',
        machineName: '',
        severity: '',
        typeOfOccurrence: '',
      });
      setSelectedMachineId('');
      setErrors({});
      await loadIncidents();
      toast.success('Incidente registrado com sucesso.');
    } catch (error) {
      console.error('Erro ao criar incidente:', error);
      toast.error('Nao foi possivel registrar o incidente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSeverityBadgeVariant = (severity: Severity) => {
    if (severity === 'ALTA') return 'destructive';
    if (severity === 'MEDIA') return 'outline';
    return 'secondary';
  };

  const machineOptions = machines.map(machine => ({
    value: machine.id,
    label: `${machine.name}${machine.code ? ` (${machine.code})` : ''}`,
    keywords: [machine.name, machine.code],
  }));

  const breadcrumbItems = [
    { label: 'Painel', href: '/painel' },
    { label: 'Mecânica', href: '/painel/mecanica' },
    { label: 'Incidentes', href: '/incidentes' },
  ];

  return (
    <>
      <BreadcrumbHeader paths={breadcrumbItems} />
      <div className="container mx-auto max-w-6xl p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Registro de Ocorrências de Manutenção</h1>
          <p className="text-sm text-muted-foreground">
            Registre incidentes e acompanhe os ultimos acontecimentos.
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Novo incidente</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Descricao</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={event => {
                    setFormData(prev => ({ ...prev, description: event.target.value }));
                    if (errors.description) {
                      setErrors(prev => ({ ...prev, description: undefined }));
                    }
                  }}
                  placeholder="Descreva a ocorrencia de manutencao"
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="machineName">Maquina</Label>
                  <Combobox
                    options={machineOptions}
                    placeholder="Selecione a maquina"
                    title="Selecione a maquina"
                    onChange={value => {
                      const selectedMachine = machines.find(machine => machine.id === value);
                      setSelectedMachineId(value);
                      setFormData(prev => ({
                        ...prev,
                        machineName: selectedMachine?.name || '',
                      }));
                      if (errors.machineName) {
                        setErrors(prev => ({ ...prev, machineName: undefined }));
                      }
                    }}
                    defaultValue={selectedMachineId}
                  />
                  {errors.machineName && (
                    <p className="text-sm text-destructive">{errors.machineName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Severidade</Label>
                  <Select
                    value={formData.severity}
                    onValueChange={value => {
                      setFormData(prev => ({ ...prev, severity: value as Severity }));
                      if (errors.severity) {
                        setErrors(prev => ({ ...prev, severity: undefined }));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a severidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BAIXA">Baixa</SelectItem>
                      <SelectItem value="MEDIA">Media</SelectItem>
                      <SelectItem value="ALTA">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.severity && <p className="text-sm text-destructive">{errors.severity}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tipo de ocorrencia</Label>
                <Select
                  value={formData.typeOfOccurrence}
                  onValueChange={value => {
                    setFormData(prev => ({ ...prev, typeOfOccurrence: value as TypeOfOccurrence }));
                    if (errors.typeOfOccurrence) {
                      setErrors(prev => ({ ...prev, typeOfOccurrence: undefined }));
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MECANICA">Mecanica</SelectItem>
                    <SelectItem value="ELETRICA">Eletrica</SelectItem>
                    <SelectItem value="SEGURANCA">Seguranca</SelectItem>
                  </SelectContent>
                </Select>
                {errors.typeOfOccurrence && (
                  <p className="text-sm text-destructive">{errors.typeOfOccurrence}</p>
                )}
              </div>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Registrar incidente'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ultimos 5 incidentes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Maquina</TableHead>
                  <TableHead>Severidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descricao</TableHead>
                  <TableHead>Criado em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingList && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Carregando incidentes...
                    </TableCell>
                  </TableRow>
                )}

                {!isLoadingList && incidents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Nenhum incidente registrado.
                    </TableCell>
                  </TableRow>
                )}

                {!isLoadingList &&
                  incidents.map(incident => (
                    <TableRow key={incident.id}>
                      <TableCell>{incident.machineName}</TableCell>
                      <TableCell>
                        <Badge variant={getSeverityBadgeVariant(incident.severity)}>
                          {severityLabel[incident.severity]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{statusLabel[incident.status]}</Badge>
                      </TableCell>
                      <TableCell>{typeLabel[incident.typeOfOccurrence]}</TableCell>
                      <TableCell className="max-w-sm truncate" title={incident.description}>
                        {incident.description}
                      </TableCell>
                      <TableCell>{formatDate(incident.createdAt)}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
