import { useQuery } from '@tanstack/react-query';

import { getTransformations } from '../../services/transformations/getTransformations';

export interface ParamDefinition {
  id: number;
  param_key: string;
  param_label: string;
  param_type: string;
  required: boolean;
  param_order: number;
}

export interface Transformation {
  id: number;
  code: string;
  name: string;
  description: string;
  schema_definitions: ParamDefinition[];
}

export function useTransformations() {
  return useQuery<Transformation[]>({
    queryKey: ['transformations'],
    queryFn: getTransformations,

    staleTime: 1000 * 60 * 5, // 5 minutos - transformações não mudam com frequência
  });
}
