'use server'

import { fetchGraphQL } from '@/lib/api';
import { revalidatePath } from 'next/cache';
import { 
  CREATE_SERVICE_ORDER_MUTATION, 
  SERVICE_ORDERS_QUERY, 
  REMOVE_SERVICE_ORDER_MUTATION, 
  COMPLETE_SERVICE_ORDER_MUTATION, 
  MACHINE_QUERY, 
  UPDATE_SERVICE_ORDER_MUTATION 
} from '@/graphql/service-order.queries';

interface CreateInput {
  machineId: string;
  reason: string;
  type: string;
  priority: string;
  machineWasStoped: boolean;
  serviceDescription: string;
}

interface CompleteInput {
  id: string;
  serviceEndDate: string;
  serviceOrderLink?: string;
}

// ACTION: CRIAR
export async function createServiceOrderAction(input: CreateInput, session: any) {
  const response = await fetchGraphQL(CREATE_SERVICE_ORDER_MUTATION, { 
    createServiceOrderInput: input 
  }, session);
  revalidatePath('/painel/mecanica/ordemServio');
  return response.createServiceOrder;
}

// ACTION: REMOVER
export async function removeServiceOrderAction(id: string, session: any) {
  const response = await fetchGraphQL(REMOVE_SERVICE_ORDER_MUTATION, { id }, session);
  revalidatePath('/painel/mecanica/ordemServio');
  return response.removeServiceOrder;
}

// ACTION: FINALIZAR (CONCLUIR)
export async function completeServiceOrderAction(input: CompleteInput, session: any) {
  const response = await fetchGraphQL(COMPLETE_SERVICE_ORDER_MUTATION, { 
    completeServiceOrderInput: input 
  }, session);
  revalidatePath('/painel/mecanica/ordemServio');
  return response.completeServiceOrder;
}

// ACTION: ATUALIZAR LINK
export async function updateServiceOrderLinkAction(id: string, link: string, session: any) {
  const response = await fetchGraphQL(UPDATE_SERVICE_ORDER_MUTATION, { 
    updateServiceOrderInput: { id, serviceOrderLink: link } 
  }, session);
  revalidatePath('/painel/mecanica/ordemServio');
  return response.updateServiceOrder;
}

export async function fetchServiceOrdersAction(session: any) {
  const response = await fetchGraphQL(SERVICE_ORDERS_QUERY, {}, session);
  return response.serviceOrders || [];
}

export async function fetchMachinesAction(session: any) {
  const response = await fetchGraphQL(MACHINE_QUERY, {}, session);
  return response.machines || [];
}