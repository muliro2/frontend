'use server'

import { fetchGraphQL } from '@/lib/api';
import { revalidatePath } from 'next/cache';
import { 
  CREATE_SERVICE_ORDER_MUTATION, 
  REMOVE_SERVICE_ORDER_MUTATION,
  COMPLETE_SERVICE_ORDER_MUTATION 
} from '@/graphql/service-order.queries';

// CRIAR ORDEM DE SERVIÇO
export async function createServiceOrderAction(formData: FormData) {
  const input = {
    machineId: formData.get('machineId'),
    reason: formData.get('reason'),
    type: formData.get('type'),
    machineWasStoped: formData.get('machineWasStoped') === 'on',
    serviceDescription: formData.get('serviceDescription'),
  };

  await fetchGraphQL(CREATE_SERVICE_ORDER_MUTATION, { createServiceOrderInput: input });
  revalidatePath('/ordem-servico');
}

// REMOVER ORDEM DE SERVIÇO
export async function removeServiceOrderAction(id: string) {
  await fetchGraphQL(REMOVE_SERVICE_ORDER_MUTATION, { id });
  revalidatePath('/ordem-servico');
}

// FINALIZAR ORDEM DE SERVIÇO
export async function completeServiceOrderAction(id: string, performed: string) {
  const input = { id, servicePerformed: performed };
  await fetchGraphQL(COMPLETE_SERVICE_ORDER_MUTATION, { completeServiceOrderInput: input });
  revalidatePath('/ordem-servico');
}