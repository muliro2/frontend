'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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
import { Search, Plus, Trash2, Printer, CheckCircle, ExternalLink, Edit } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { graphqlRequest } from '@/hooks/use-graphql';
import { useExportServiceOrders } from '@/hooks/use-export-service-orders';
import { BreadcrumbHeader } from '@/components/BreadcrumbHeader/BreadcrumbHeader';
import { useSession, signOut } from 'next-auth/react';
import { Combobox } from '@/components/Combobox';

interface ServiceOrderData {
  machineId: string;
  reason: string;
  type: string;
  machineWasStoped: boolean;
  serviceDescription: string;
  servicePerformed: string;
  serviceInitDate: string;
  serviceEndDate: string;
  serviceOrderEndDate: string;
}

interface ServiceOrder {
  id: string;
  reason: string;
  type: string;
  machineWasStoped: boolean;
  serviceDescription: string;
  servicePerformed?: string;
  createdAt: string;
  serviceInitDate?: string;
  serviceEndDate?: string;
  serviceOrderEndDate?: string;
  serviceOrderLink?: string;
  machine: {
    id: string;
    name: string;
    code: string;
    department: {
      id: string;
      name: string;
    };
  };
}



const SERVICE_ORDERS_QUERY = `
  query {
    serviceOrders {
      id
      reason
      type
      machineWasStoped
      serviceDescription
      servicePerformed
      createdAt
      serviceInitDate
      serviceEndDate
      serviceOrderEndDate
      serviceOrderLink
      machine {
        id
        name
        code
        department {
          id
          name
        }
      }
    }
  }
`;



const CREATE_SERVICE_ORDER_MUTATION = `
  mutation CreateServiceOrder($createServiceOrderInput: CreateServiceOrderInput!) {
    createServiceOrder(createServiceOrderInput: $createServiceOrderInput) {
      id
      machine {
        id
        name
        code
      }
      reason
      type
      machineWasStoped
      serviceDescription
      servicePerformed
      createdAt
      serviceInitDate
      serviceEndDate
      serviceOrderEndDate
    }
  }
`;




export default function OrdemServicoPage() {
  const { data: session } = useSession();

  const [orderData, setOrderData] = useState<ServiceOrderData>({
    machineId: '',
    reason: '',
    type: '',
    machineWasStoped: false,
    serviceDescription: '',
    servicePerformed: '',
    serviceInitDate: '',
    serviceEndDate: '',
    serviceOrderEndDate: '',
  });

  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [completeData, setCompleteData] = useState({
    serviceEndDate: '',
    serviceOrderLink: '',
  });


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setOrderData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setOrderData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setOrderData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const createServiceOrder = async () => {
    if (!session) return;
    try {
      const variables = {
        createServiceOrderInput: {
          machineId: orderData.machineId,
          reason: orderData.reason,
          type: orderData.type,
          machineWasStoped: orderData.machineWasStoped,
          serviceDescription: orderData.serviceDescription,
        },
      };

      console.log(variables);

      const response = await graphqlRequest(CREATE_SERVICE_ORDER_MUTATION, variables, session);
      console.log('Ordem de serviço criada:', response.createServiceOrder);

      // Limpar formulário
      setOrderData({
        machineId: '',
        reason: '',
        type: '',
        machineWasStoped: false,
        serviceDescription: '',
        servicePerformed: '',
        serviceInitDate: '',
        serviceEndDate: '',
        serviceOrderEndDate: '',
      });

      // Recarregar lista
      await fetchServiceOrders();

      return response.createServiceOrder;
    } catch (error) {
      // await signOut({ callbackUrl: '/' });
      console.error('Erro ao criar ordem de serviço:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createServiceOrder();
      setShowForm(false);
    } catch (error) {
      console.error('Erro no envio do formulário:', error);
    }
  };

  const fetchServiceOrders = async () => {
    if (!session) return;
    try {
      const response = await graphqlRequest(SERVICE_ORDERS_QUERY, {}, session);
      console.log('Ordens de serviço:', response);
      setServiceOrders(response.serviceOrders || []);
    } catch (error) {
      // await signOut({ callbackUrl: '/' });
      console.error('Erro ao buscar ordens de serviço:', error);
    }
  };

  // Adicionar função para buscar máquinas
  const fetchMachines = async () => {
    if (!session) return;

    try {
      const response = await graphqlRequest(MACHINE_QUERY, {}, session);
      console.log('Máquinas:', response.machines);
      setMachines(response.machines || []);
    } catch (error) {
      console.error('Erro ao buscar máquinas:', error);
      await signOut({ callbackUrl: '/' });
    }
  };

  useEffect(() => {
    fetchServiceOrders();
    fetchMachines(); // Adicionar chamada para buscar máquinas
  }, [session]);

  const filteredOrders = useMemo(() => {
    const filtered = serviceOrders.filter(order => {
      const matchesSearch =
        order.machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.machine.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.reason.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(order.type);

      const matchesStatus =
        selectedStatus === 'all' ||
        (selectedStatus === 'open' && !order.serviceOrderEndDate) ||
        (selectedStatus === 'completed' && !!order.serviceOrderEndDate);

      return matchesSearch && matchesType && matchesStatus;
    });

    return filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [serviceOrders, searchTerm, selectedTypes, selectedStatus]);

  const getStatusBadge = (order: ServiceOrder) => {
    if (order.serviceOrderEndDate) {
      return <Badge variant="secondary">Concluído</Badge>;
    }
    return <Badge variant="default">Em Aberto</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const typeMap = {
      preventiva: { label: 'Preventiva', variant: 'default' as const },
      corretiva: { label: 'Corretiva', variant: 'destructive' as const },
      preditiva: { label: 'Preditiva', variant: 'secondary' as const },
      instalacao: { label: 'Instalação', variant: 'outline' as const },
      inspecao: { label: 'Inspeção', variant: 'outline' as const },
    };

    const typeInfo = typeMap[type as keyof typeof typeMap] || {
      label: type,
      variant: 'outline' as const,
    };
    return <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDeleteOrder = async (id: string) => {
    if (!session) return;
    try {
      await graphqlRequest(REMOVE_SERVICE_ORDER_MUTATION, { id }, session);
      // Remove o item da lista local
      setServiceOrders(prev => prev.filter(order => order.id !== id));
      console.log('Ordem de serviço deletada com sucesso');
    } catch (error) {
      console.error('Erro ao deletar ordem de serviço:', error);
    }
  };

  const { exportServiceOrder } = useExportServiceOrders();

  const handlePrintOrder = (order: any) => {
    exportServiceOrder(order);
  };

  const handleCompleteOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setCompleteData({
      serviceEndDate: '',
      serviceOrderLink: '',
    });
    setShowCompleteModal(true);
  };

  const machinesOptions = useMemo(
    () =>
      (machines || []).map(m => ({
        value: m.id,
        label: `${m.name} (${m.code})`,
        keywords: [m.code, m.name],
      })),
    [machines],
  );

  const selectedMachineDisplay = useMemo(() => {
    const m = (machines || []).find(x => x.id === orderData.machineId);
    return m ? `${m.name} (${m.code})` : '';
  }, [machines, orderData.machineId]);

  const handleCompleteSubmit = async () => {
    if (!session) return;

    console.log('Estado completeData:', completeData);

    if (!completeData.serviceEndDate || completeData.serviceEndDate.trim() === '') {
      alert('Por favor, preencha a data de término do serviço.');
      return;
    }

    try {
      // Para input type="date", o valor vem no formato YYYY-MM-DD
      // Converter para o padrão ISO 8601: 2024-01-15T14:30:00.000Z
      const dateValue = completeData.serviceEndDate + 'T12:00:00.000Z';
      const date = new Date(dateValue);
      const formattedDate = date.toISOString();

      const completeServiceOrderInput = {
        id: selectedOrderId,
        serviceEndDate: formattedDate,
        serviceOrderLink: completeData.serviceOrderLink,
      };

      console.log(completeServiceOrderInput);

      await graphqlRequest(
        COMPLETE_SERVICE_ORDER_MUTATION,
        {
          completeServiceOrderInput,
        },
        session,
      );

      setShowCompleteModal(false);
      setCompleteData({ serviceEndDate: '', serviceOrderLink: '' });
      setSelectedOrderId('');
      fetchServiceOrders();
    } catch (error) {
      console.error('Erro ao concluir ordem de serviço:', error);
      alert('Erro ao concluir ordem de serviço. Tente novamente.');
    }
  };

  const handleCompleteDataChange = (field: string, value: string) => {
    setCompleteData(prev => ({
      ...prev,
      [field]: value,
    }));
  };



      await graphqlRequest(
        UPDATE_SERVICE_ORDER_MUTATION,
        {
          updateServiceOrderInput,
        },
        session,
      );

      setShowEditLinkModal(false);
      setEditLinkData({ serviceOrderLink: '' });
      setEditLinkOrderId('');
      fetchServiceOrders();
      alert('Link atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar link da ordem de serviço:', error);
      alert('Erro ao atualizar link. Verifique sua conexão e tente novamente.');
    }
  };

  const handleEditLinkDataChange = (value: string) => {
    setEditLinkData({ serviceOrderLink: value });
  };

  const breadcrumbItems = [
    { label: 'Painel', href: '/painel' },
    { label: 'Mecânica', href: '/painel/mecanica' },
    { label: 'Ordem de Serviço', href: '/painel/mecanica/ordemServio' },
  ];

  return (
    <>
      <BreadcrumbHeader paths={breadcrumbItems} />
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header com título e botão de nova OS */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Ordens de Serviço</h1>
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nova Ordem de Serviço
          </Button>
        </div>

        {/* Filtros e busca */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Campo de busca */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por equipamento, código ou motivo..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filtros por tipo - Chips selecionáveis */}
              <div className="flex gap-2">
                {['preventiva', 'corretiva', 'preditiva'].map(type => {
                  const isSelected = selectedTypes.includes(type);
                  const typeLabels = {
                    preventiva: 'Preventiva',
                    corretiva: 'Corretiva',
                    preditiva: 'Planejada',
                  };

                  return (
                    <Button
                      key={type}
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setSelectedTypes(prev =>
                          isSelected ? prev.filter(t => t !== type) : [...prev, type],
                        );
                      }}
                    >
                      {typeLabels[type as keyof typeof typeLabels]}
                    </Button>
                  );
                })}
              </div>

              {/* Filtro por status */}
              <div className="w-[200px] font-medium">
                <Select value={selectedStatus} onValueChange={value => setSelectedStatus(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Status</SelectItem>
                    <SelectItem value="open">Em Aberto</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de ordens de serviço */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Ordens de Serviço ({filteredOrders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipamento</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Início da Ocorrência</TableHead>
                  <TableHead>Fim da Ocorrência</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.machine.name}</div>
                        <div className="text-sm text-gray-500">{order.machine.code}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(order.type)}</TableCell>
                    <TableCell>{getStatusBadge(order)}</TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate" title={order.reason}>
                        {order.reason}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>{formatDate(order.serviceOrderEndDate)}</TableCell>
                    <TableCell>{order.machine.department.name}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePrintOrder(order)}
                          className="h-8 w-8 p-0"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        {order.serviceOrderEndDate &&
                          order.serviceOrderLink &&
                          order.serviceOrderLink.trim() !== '' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const link = order.serviceOrderLink;
                                const url =
                                  link?.startsWith('http://') || link?.startsWith('https://')
                                    ? link
                                    : `https://${link}`;
                                window.open(url, '_blank');
                              }}
                              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              title="Visualizar link da ordem de serviço"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                        {order.serviceOrderEndDate && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditLink(order.id, order.serviceOrderLink || '')}
                            className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                            title="Editar link da ordem de serviço"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {!order.serviceOrderEndDate && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCompleteOrder(order.id)}
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja deletar esta ordem de serviço? Esta ação não
                                pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteOrder(order.id)}>
                                Deletar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      Nenhuma ordem de serviço encontrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Modal/Form para criar nova OS */}
        {showForm && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <Card className="border-0 shadow-none">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-2xl font-bold">Nova Ordem de Serviço</CardTitle>
                    <Button variant="ghost" onClick={() => setShowForm(false)}>
                      ✕
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="machineId">Máquina *</Label>
                        <Combobox
                          title="Selecione a máquina"
                          placeholder="busque por nome ou código"
                          options={machinesOptions}
                          defaultValue={selectedMachineDisplay}
                          onChange={val => handleSelectChange('machineId', val || '')}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reason">Motivo *</Label>
                        <Input
                          id="reason"
                          name="reason"
                          value={orderData.reason}
                          onChange={handleInputChange}
                          placeholder="Digite o motivo da ordem de serviço"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="type">Tipo de Serviço *</Label>
                        <Select
                          value={orderData.type}
                          onValueChange={value => handleSelectChange('type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo de serviço" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="preventiva">Manutenção Preventiva</SelectItem>
                            <SelectItem value="corretiva">Manutenção Corretiva</SelectItem>
                            <SelectItem value="planejada">Manutenção Planejada</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="machineWasStoped"
                          checked={orderData.machineWasStoped}
                          onChange={e => handleCheckboxChange('machineWasStoped', e.target.checked)}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="machineWasStoped">Máquina foi parada?</Label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="serviceDescription">Descrição do Serviço *</Label>
                      <Textarea
                        id="serviceDescription"
                        name="serviceDescription"
                        value={orderData.serviceDescription}
                        onChange={handleInputChange}
                        placeholder="Descreva detalhadamente o serviço a ser realizado"
                        rows={4}
                        required
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" size="lg" className="px-8">
                        Criar Ordem de Serviço
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Modal de conclusão da ordem de serviço */}
        <Dialog open={showCompleteModal} onOpenChange={setShowCompleteModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Concluir Ordem de Serviço</DialogTitle>
              <DialogDescription>
                Preencha os dados para concluir esta ordem de serviço.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="serviceEndDate" className="text-right">
                  Data de término *
                </Label>
                <Input
                  id="serviceEndDate"
                  type="date"
                  value={completeData.serviceEndDate}
                  onChange={e => handleCompleteDataChange('serviceEndDate', e.target.value)}
                  className="col-span-2"
                  required
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="serviceOrderLink" className="text-right">
                  Link do documento
                </Label>
                <Input
                  id="serviceOrderLink"
                  type="url"
                  value={completeData.serviceOrderLink}
                  onChange={e => handleCompleteDataChange('serviceOrderLink', e.target.value)}
                  className="col-span-2"
                  placeholder="https://..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCompleteModal(false);
                  setCompleteData({
                    serviceEndDate: '',
                    serviceOrderLink: '',
                  });
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleCompleteSubmit}>Concluir</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de edição do link da ordem de serviço */}
        <Dialog open={showEditLinkModal} onOpenChange={setShowEditLinkModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Editar Link da Ordem de Serviço</DialogTitle>
              <DialogDescription>
                Atualize o link do documento da ordem de serviço.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editServiceOrderLink" className="text-right">
                  Link do documento
                </Label>
                <Input
                  id="editServiceOrderLink"
                  type="url"
                  value={editLinkData.serviceOrderLink}
                  onChange={e => handleEditLinkDataChange(e.target.value)}
                  className="col-span-3"
                  placeholder="https://..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditLinkModal(false);
                  setEditLinkData({ serviceOrderLink: '' });
                  setEditLinkOrderId('');
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleEditLinkSubmit}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}