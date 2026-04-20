'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Combobox } from '@/components/ui/combobox';
import React, { useState, useEffect, useMemo } from 'react';
import {
  fetchServiceOrdersAction, 
  fetchMachinesAction, 
  createServiceOrderAction, 
  removeServiceOrderAction, 
  completeServiceOrderAction,
  updateServiceOrderLinkAction 
} from '@/app/actions/ordem-servico/ordem-servico';
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
} from '@/components/ui/dialog';
import { useExportServiceOrders } from '@/hooks/use-export-service-orders';
import { BreadcrumbHeader } from '@/components/BreadcrumbHeader';
import { PageSizeSelect } from '@/components/PageSizeSelect';

interface ServiceOrderData {
  machineId: string;
  reason: string;
  type: string;
  priority: string;
  machineWasStoped: boolean;
  serviceDescription: string;
  servicePerformed: string;
  serviceInitDate: string;
  serviceEndDate: string;
  serviceOrderEndDate: string;
}

interface Machine {
  id: string;
  name: string;
  code?: string | null;
  identifier?: string;
}

interface ServiceOrder {
  id: string;
  reason: string;
  type: string;
  priority?: string;
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

export default function OrdemServicoPage() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [orderData, setOrderData] = useState<ServiceOrderData>({
    machineId: '',
    reason: '',
    type: '',
    priority: '',
    machineWasStoped: false,
    serviceDescription: '',
    servicePerformed: '',
    serviceInitDate: '',
    serviceEndDate: '',
    serviceOrderEndDate: '',
  });

  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [isCompletingOrder, setIsCompletingOrder] = useState(false);
  const [isDeletingOrder, setIsDeletingOrder] = useState(false);
  const [completeData, setCompleteData] = useState({
    serviceEndDate: '',
    serviceOrderLink: '',
  });

  const [machines, setMachines] = useState<Machine[]>([]); 
  const [showEditLinkModal, setShowEditLinkModal] = useState(false);
  const [editLinkOrderId, setEditLinkOrderId] = useState('');
  const [editLinkData, setEditLinkData] = useState({ serviceOrderLink: '' });


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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const input = {
        machineId: orderData.machineId,
        reason: orderData.reason,
        type: orderData.type,
        priority: orderData.priority,
        machineWasStoped: orderData.machineWasStoped,
        serviceDescription: orderData.serviceDescription,
      };

      await createServiceOrderAction(input, session);
      
      // Limpar e fechar
      setOrderData({
        machineId: '', reason: '', type: '', priority: '',
        machineWasStoped: false, serviceDescription: '',
        servicePerformed: '', serviceInitDate: '',
        serviceEndDate: '', serviceOrderEndDate: ''
      });
      setShowForm(false);
      fetchServiceOrders();
    } catch (error) {
      console.error('Erro ao criar OS:', error);
    }
  };

  const fetchServiceOrders = async () => {
    setIsLoadingOrders(true);
    setOrdersError('');
    try {
      const data = await fetchServiceOrdersAction(session);
      setServiceOrders(data);
    } catch (error) {
      console.error('Erro ao buscar ordens:', error);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // Adicionar função para buscar máquinas
  const fetchMachines = async () => {
    try {
      const data = await fetchMachinesAction(session);
      setMachines(data);
    } catch (error) {
      console.error('Erro ao buscar máquinas:', error);
    }
  };

  useEffect(() => {
    if (session === undefined) return;
    
    const loadData = async () => {
      await fetchServiceOrders();
      await fetchMachines();
    };
    
    loadData();
  }, [session]);

  const filteredOrders = useMemo(() => {
    const filtered = serviceOrders.filter(order => {
      const matchesSearch =
        order.machine?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.machine?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.reason?.toLowerCase().includes(searchTerm.toLowerCase());

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

  const pageParam = searchParams?.get('page');
  const pageSizeParam = searchParams?.get('pageSize');
  const parsedPage = Number.parseInt(pageParam || '1', 10);
  const parsedPageSize = Number.parseInt(pageSizeParam || '10', 10);
  const allowedPageSizes = [10, 20, 50];
  const PAGE_SIZE = allowedPageSizes.includes(parsedPageSize) ? parsedPageSize : 10;
  const totalRows = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / PAGE_SIZE));
  const currentPage = Number.isNaN(parsedPage)
    ? 1
    : Math.min(Math.max(parsedPage, 1), totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

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
    if (isDeletingOrder) return;
    try {
      setIsDeletingOrder(true);
      await removeServiceOrderAction(id, session);
      setServiceOrders(prev => prev.filter(order => order.id !== id));
      
      console.log('Ordem removida com sucesso');
    } catch (error) {
      console.error('Erro ao deletar ordem de serviço:', error);
      alert('Erro ao deletar ordem de serviço. Tente novamente.');
    } finally {
      setIsDeletingOrder(false);
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
        label: `${m.name} (${m.identifier})`,
        keywords: [m.identifier, m.name],
      })),
    [machines],
  );

  const selectedMachineDisplay = useMemo(() => {
    const m = (machines || []).find(x => x.id === orderData.machineId);
    return m ? `${m.name} (${m.code})` : '';
  }, [machines, orderData.machineId]);

  const handleCompleteSubmit = async () => {
    if (isCompletingOrder || !selectedOrderId || !completeData.serviceEndDate) return;

    try {
      setIsCompletingOrder(true);
      
      const date = new Date(completeData.serviceEndDate);
      date.setHours(12, 0, 0, 0);

      const input = {
        id: selectedOrderId,
        serviceEndDate: date.toISOString(),
        serviceOrderLink: completeData.serviceOrderLink?.trim() || undefined,
      };

      const response = await completeServiceOrderAction(input, session);

      if (response?.id) {
        await fetchServiceOrders();
        setShowCompleteModal(false);
        setCompleteData({ serviceEndDate: '', serviceOrderLink: '' });
        setSelectedOrderId('');
        alert('Ordem de serviço concluída com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao concluir OS:', error);
    } finally {
      setIsCompletingOrder(false);
    }
  };

const handleCompleteDataChange = (field: string, value: string) => {
    setCompleteData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditLink = (id: string, currentLink: string) => {
    setEditLinkOrderId(id);
    setEditLinkData({ serviceOrderLink: currentLink });
    setShowEditLinkModal(true);
  };

  const handleEditLinkSubmit = async () => {
    if (!session) return;
    try {
      await updateServiceOrderLinkAction(
        editLinkOrderId, 
        editLinkData.serviceOrderLink, 
        session
      );

      await fetchServiceOrders();

      setShowEditLinkModal(false);
      setEditLinkData({ serviceOrderLink: '' });
      setEditLinkOrderId('');
      fetchServiceOrders();
      alert('Link atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar link da ordem de serviço:', error);
      alert('Erro ao atualizar link. Verifique sua conexão.');
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
                {['preventiva', 'corretiva', 'planejada'].map(type => {
                  const isSelected = selectedTypes.includes(type);
                  const typeLabels = {
                    preventiva: 'Preventiva',
                    corretiva: 'Corretiva',
                    planejada: 'Planejada',
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
              <div className="w-50 font-medium">
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
            <CardTitle>Lista de Ordens de Serviço ({totalRows})</CardTitle>
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
                {paginatedOrders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.machine?.name || 'Sem máquina'}</div>
                        <div className="text-sm text-gray-500">{order.machine?.code || '-'}</div>
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
                    <TableCell>{order.machine?.department?.name || '-'}</TableCell>
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
                              <AlertDialogCancel disabled={isDeletingOrder}>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteOrder(order.id)}
                                disabled={isDeletingOrder}
                              >
                                {isDeletingOrder ? 'Deletando...' : 'Deletar'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {isLoadingOrders && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      Carregando ordens de serviço...
                    </TableCell>
                  </TableRow>
                )}
                {!isLoadingOrders && ordersError && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-red-600">
                      {ordersError}
                    </TableCell>
                  </TableRow>
                )}
                {!isLoadingOrders && !ordersError && filteredOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      Nenhuma ordem de serviço encontrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <p>
                Mostrando {totalRows === 0 ? 0 : startIndex + 1} a {Math.min(endIndex, totalRows)} de {totalRows} registro(s)
              </p>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span>Linhas por página</span>
                  <PageSizeSelect value={PAGE_SIZE} />
                </div>
                <p>Página {currentPage} de {totalPages}</p>
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                      <div className="space-y-2">
                        <Label htmlFor="priority">Prioridade *</Label>
                        <Select
                          value={orderData.priority}
                          onValueChange={value => handleSelectChange('priority', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a prioridade" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="BAIXA">Baixa</SelectItem>
                            <SelectItem value="MEDIA">Média</SelectItem>
                            <SelectItem value="ALTA">Alta</SelectItem>
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
        <Dialog
          open={showCompleteModal}
          onOpenChange={open => {
            if (isCompletingOrder) return;
            setShowCompleteModal(open);
          }}
        >
          <DialogContent className="sm:max-w-106.25">
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
                disabled={isCompletingOrder}
                onClick={() => {
                  setShowCompleteModal(false);
                  setCompleteData({
                    serviceEndDate: '',
                    serviceOrderLink: '',
                  });
                  setSelectedOrderId('');
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleCompleteSubmit} disabled={isCompletingOrder}>
                {isCompletingOrder ? 'Concluindo...' : 'Concluir'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de edição do link da ordem de serviço */}
        <Dialog open={showEditLinkModal} onOpenChange={setShowEditLinkModal}>
          <DialogContent className="sm:max-w-106.25">
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