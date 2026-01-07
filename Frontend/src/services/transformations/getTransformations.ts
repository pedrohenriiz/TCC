import api from '../baseApi';
import type { Transformation } from '../../hooks/transformations/useTransformations';

export async function getTransformations(): Promise<Transformation[]> {
  const response = await api.get('/transformations');
  return response.data;
}
