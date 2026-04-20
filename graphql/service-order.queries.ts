export const CREATE_SERVICE_ORDER_MUTATION = `
  mutation CreateServiceOrder($createServiceOrderInput: CreateServiceOrderInput!) {
    createServiceOrder(createServiceOrderInput: $createServiceOrderInput) {
      id
      priority
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

export const CREATE_MACHINE_MUTATION = `
  mutation CreateMachine($createMachineInput: CreateMachineInput!) {
    createMachine(createMachineInput: $createMachineInput) {
      id
      name
      code
      description
      identifier
      functionality
      imageUrl
      department {
        id
        name
      }
    }
  }
`;

export const REMOVE_SERVICE_ORDER_MUTATION = `
  mutation RemoveServiceOrder($id: String!) {
    removeServiceOrder(id: $id) {
      id
    }
  }
`;

export const SERVICE_ORDERS_QUERY = `
  query {
    serviceOrders {
      id
      reason
      type
      priority
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

export const COMPLETE_SERVICE_ORDER_MUTATION = `
  mutation CompleteServiceOrder($completeServiceOrderInput: CompleteServiceOrderInput!) {
    completeServiceOrder(completeServiceOrderInput: $completeServiceOrderInput) {
      id
      serviceEndDate
      serviceOrderEndDate
      serviceOrderLink
    }
  }
`;

export const UPDATE_SERVICE_ORDER_MUTATION = `
  mutation UpdateServiceOrder($updateServiceOrderInput: UpdateServiceOrderInput!) {
    updateServiceOrder(updateServiceOrderInput: $updateServiceOrderInput) {
      id
      serviceOrderLink
    }
  }
`;

export const MACHINE_QUERY = `
  query {
    machines {
      id
      name
      code
      department {
        id
        name
      }
    }
  }
`;