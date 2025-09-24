import { api } from '@/lib/api';

interface ConfigurationPayload {
  data: {
    config: any;
  };
}

export async function saveConfiguration(workflowJson: any) {
  const payload: ConfigurationPayload = {
    data: {
      config: workflowJson
    }
  };

  return api.post('/api/v1/client/private/configuration/create', payload);
}