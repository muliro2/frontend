'use server';

import { revalidatePath } from 'next/cache';
import { fetchGraphQL } from '@/lib/api';
import {
  CREATE_INCIDENT_MUTATION,
  LAST_INCIDENTS_QUERY,
} from '@/graphql/incidentes.queries';

interface CreateIncidentInput {
  description: string;
  machineName: string;
  severity: 'BAIXA' | 'MEDIA' | 'ALTA';
  typeOfOccurrence: 'MECANICA' | 'ELETRICA' | 'SEGURANCA';
}

export async function createIncidentAction(input: CreateIncidentInput, session?: any) {
  const response = await fetchGraphQL(
    CREATE_INCIDENT_MUTATION,
    { createIncidentInput: input },
    session,
  );

  revalidatePath('/incidentes');
  return response.createIncident;
}

export async function fetchLastIncidentsAction(limit = 5, session?: any) {
  const response = await fetchGraphQL(LAST_INCIDENTS_QUERY, { limit }, session);
  return response.lastIncidents || [];
}
