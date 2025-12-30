import { useEffect } from 'react';
import useSourceTablesStore, {
  type SourceTable,
} from '../../../../store/useSourceTableStore';

interface UseSetOriginTablesProps {
  id: string | undefined;
  data: { origin_tables: SourceTable[] };
}

export default function useSetOriginTables({
  id,
  data,
}: UseSetOriginTablesProps) {
  const { setSourceTableList, clearAllSourceTables } = useSourceTablesStore();

  useEffect(() => {
    if (id && id !== 'new' && data?.origin_tables) {
      setSourceTableList(data.origin_tables);
    }

    return () => {
      clearAllSourceTables();
    };
  }, [data?.origin_tables, id, clearAllSourceTables, setSourceTableList]);
}
