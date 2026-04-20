export const CREATE_INCIDENT_MUTATION = `
  mutation CreateIncident($createIncidentInput: CreateIncidentInput!) {
    createIncident(createIncidentInput: $createIncidentInput) {
      id
      machineName
      severity
      status
      typeOfOccurrence
      description
      createdAt
    }
  }
`;

export const LAST_INCIDENTS_QUERY = `
  query LastIncidents($limit: Int) {
    lastIncidents(limit: $limit) {
      id
      machineName
      severity
      status
      typeOfOccurrence
      description
      createdAt
    }
  }
`;
