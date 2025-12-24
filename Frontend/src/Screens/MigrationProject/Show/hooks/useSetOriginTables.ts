import { useEffect } from 'react';
import useSourceTablesStore, {
  type SourceTable,
} from '../../../../store/useSourceTableStore';

export default function useSetOriginTables({
  id,
  data,
}: {
  id: string | undefined;
  data: { origin_tables: SourceTable[] };
}) {
  const { setSourceTableList, clearAllSourceTables } = useSourceTablesStore();

  useEffect(() => {
    if (id && id !== 'new' && data?.origin_tables) {
      setSourceTableList(data.origin_tables);
    }

    return () => {
      clearAllSourceTables();
    };
  }, [clearAllSourceTables, data?.origin_tables, id, setSourceTableList]);
}
