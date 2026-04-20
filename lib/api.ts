/**
 * Utilitário para chamadas GraphQL
 * @param query - A string da mutation ou query
 * @param variables - Objeto com as variáveis do GraphQL
 * @param session - A sessão do Next-Auth (opcional)
 */
export async function fetchGraphQL(
  query: string,
  variables: Record<string, unknown> = {},
  session?: {
    accessToken?: string;
    user?: Record<string, unknown>;
  } | null
) {
  const GRAPHQL_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/graphql';
  
  const token = session?.accessToken || session?.user?.accessToken;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables }),
      cache: 'no-store', 
    });

    const json = await res.json();

    if (json.errors) {
      console.error('Erro retornado pelo GraphQL:', json.errors);
      throw new Error(json.errors[0]?.message || 'Erro na requisição GraphQL');
    }

    return json.data;
  } catch (error) {
    console.error('Falha na comunicação com o servidor:', error);
    throw error;
  }
}