/*import { DocumentNode, OperationVariables, QueryOptions } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { print } from 'graphql';

export function useGraphQL<
  TData = any,
  TVariables extends OperationVariables = OperationVariables
>(
  query: DocumentNode,
  options: QueryOptions<TVariables> = {} as QueryOptions<TVariables>
) {
  const { data, loading, error, refetch } = useQuery<TData, TVariables>(query, {
    ...options,
    notifyOnNetworkStatusChange: true,
  });

  return {
    data,
    loading,
    error,
    refetch,
  };
}

export const fetchGraphQL = async (query: string | DocumentNode, variables: any, session: any) => {

  const queryString = typeof query === 'string' ? query : print(query);
  // /api/graphql é o endpoint que criamos para lidar com as requisições GraphQL
  const response = await fetch('http://localhost:3001/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.accessToken}`,
    },
    body: JSON.stringify({
      query: queryString,
      variables,
    }),
  });

  const data = await response.json();

  if (data.errors) {
    throw new Error(data.errors[0].message);
  }

  return data.data;
};*/