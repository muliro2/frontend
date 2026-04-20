# Frontend - Desafio Técnico de Estágio

Aplicação web desenvolvida para consumir a API backend do desafio técnico de estágio.

O projeto foi construído com foco em organização, componentização e integração com uma API **GraphQL** disponibilizada pelo backend em **NestJS + Prisma + MongoDB**. A interface permite visualizar e gerenciar informações de manutenção, como máquinas e ordens de serviço.

## Tecnologias utilizadas

- **Next.js 15**
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**
- **Radix UI**
- **Lucide React**
- **NextAuth**
- **GraphQL**
- **Fetch API** centralizada em um utilitário de integração

## Pré-requisitos

Antes de executar o projeto, tenha instalado:

- **Node.js 20+**
- **npm** ou **yarn**
- O backend do projeto rodando localmente ou em um ambiente acessível

## Instalação e execução

### 1. Clonar o repositório

```bash
git clone https://github.com/muliro2/frontend
```

### 2. Acessar a pasta do frontend

```bash
cd frontend
```

### 3. Instalar dependências

```bash
npm install
```

### 4. Criar o arquivo de ambiente

Crie um arquivo chamado `.env.local` na raiz do frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/graphql
```

Se o backend estiver em outro endereço, ajuste o valor conforme o ambiente.

### 5. Executar em modo desenvolvimento

```bash
npm run dev
```

O frontend sobe por padrão em:

```bash
http://localhost:3001
```

### 6. Gerar build de produção

```bash
npm run build
```

### 7. Executar a versão compilada

```bash
npm run start
```

## Variáveis de ambiente

A aplicação utiliza a variável abaixo para apontar para o backend GraphQL:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/graphql
```

### Explicação

- `NEXT_PUBLIC_` indica que a variável pode ser lida no navegador.
- O valor deve apontar para o endpoint GraphQL do backend.
- Caso a variável não seja definida, o frontend usa o fallback `http://localhost:3000/graphql`.

## Estrutura do projeto

Estrutura principal do frontend:

```text
frontend/
├── components/
│   ├── ui/
│   ├── AddMachineDialog.tsx
│   ├── AppSidebar.tsx
│   ├── BreadcrumbHeader.tsx
│   ├── PageSizeSelect.tsx
│   └── Providers.tsx
├── graphql/
│   └── service-order.queries.ts
├── hooks/
│   └── use-export-service-orders.ts
├── lib/
│   ├── api.ts
│   └── utils.ts
├── public/
└── src/
		└── app/
				├── globals.css
				├── layout.tsx
				├── page.tsx
				├── ordem-servico/
				│   └── page.tsx
				└── actions/
						└── ordem-servico/
								└── ordem-servico.ts
```

### Organização por responsabilidade

- **components/**: componentes reutilizáveis e UI compartilhada
- **graphql/**: queries e mutations GraphQL centralizadas
- **hooks/**: hooks personalizados com lógica reutilizável
- **lib/**: utilitários de integração e funções auxiliares
- **src/app/**: páginas da aplicação e ações do Next.js App Router

## Funcionalidades

- Listagem de máquinas cadastradas
- Criação de nova máquina
- Visualização de ordens de serviço
- Criação de ordem de serviço
- Edição do link da ordem de serviço concluída
- Conclusão de ordem de serviço
- Exclusão de registros
- Filtros por tipo e status
- Busca por máquina, código ou motivo
- Paginação da lista
- Exportação de ordem de serviço para impressão/visualização

## Consumo da API

O frontend se comunica com o backend por meio de **GraphQL**.

As queries e mutations ficam centralizadas em [graphql/service-order.queries.ts](graphql/service-order.queries.ts) e são executadas pelo utilitário [lib/api.ts](lib/api.ts).

### Exemplo do utilitário de integração

```js
export async function fetchGraphQL(query, variables = {}, session) {
	const GRAPHQL_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/graphql';

	const headers = {
		'Content-Type': 'application/json',
	};

	const response = await fetch(GRAPHQL_URL, {
		method: 'POST',
		headers,
		body: JSON.stringify({ query, variables }),
		cache: 'no-store',
	});

	return response.json();
}
```

### Fluxo de integração

1. A tela chama uma action ou componente responsável pela operação.
2. A action usa `fetchGraphQL` para enviar query/mutation ao backend.
3. O backend retorna os dados já prontos para renderização.
4. A interface atualiza a lista e revalida a rota quando necessário.

## Scripts disponíveis

```bash
npm run dev      # inicia o ambiente de desenvolvimento na porta 3001
npm run build    # gera a build de produção
npm run start    # executa a build compilada
npm run lint     # executa a análise de código com ESLint
```

## Boas práticas aplicadas

- Componentização com UI reutilizável
- Separação de responsabilidades entre página, action, query e utilitário
- Consumo de API centralizado em um único ponto
- Uso de hooks para encapsular lógica reutilizável
- Uso de TypeScript para tipagem das entidades e respostas da API
- Layout com Tailwind CSS para consistência visual
- Integração com backend GraphQL sem acoplamento excessivo na UI

## Melhorias futuras

- Cobertura de testes com **Vitest** ou **Jest**
- Melhorias de responsividade para telas pequenas
- Tema escuro (dark mode)
- Autenticação e controle de acesso mais refinados
- Estados de carregamento e erro mais detalhados
- Filtros avançados e ordenação na tabela
- Componentes de feedback visual com toast/snackbar

## Como validar a integração com o backend

1. Suba o backend em `http://localhost:3000/graphql`.
2. Configure o `.env.local` do frontend.
3. Rode o frontend com `npm run dev`.
4. Acesse `http://localhost:3001`.
5. Verifique se as máquinas e ordens de serviço são carregadas corretamente.

## Observações do projeto

- O frontend foi estruturado como aplicação web moderna com **Next.js App Router**.
- O projeto conversa com a API backend via **GraphQL**.
- O uso de `NEXT_PUBLIC_API_URL` permite alternar facilmente entre ambientes local, homologação e produção.

## Licença

Projeto desenvolvido para fins acadêmicos e de portfólio.
