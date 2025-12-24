from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from domain.entities.table_config import TableConfigs, TableConfigColumns
from interfaces.schemas.table_config_schema import TableConfigCreate
from domain.entities.table_config import TableConfigColumns

class TableConfigRepository:
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, data: TableConfigCreate) -> TableConfigs:
        table = TableConfigs(name=data.name, exhibition_name=data.exhibition_name)

        if data.columns:
            for col in data.columns:
                column = TableConfigColumns(
                    name=col.name,
                    type=col.type,
                    size=col.size,
                    is_pk=col.is_pk,
                    is_nullable=col.is_nullable,
                    foreign_table_id=col.foreign_table_id,
                    foreign_column_id=col.foreign_column_id,
                    table_id=table.id
                )
                table.columns.append(column)
        
        self.db.add(table)
        self.db.commit()
        self.db.refresh(table)
        return table
    
    def list_tables(self, with_columns: bool = False):
        base_query = (
            self.db.query(
                TableConfigs.id,
                TableConfigs.name,
                TableConfigs.exhibition_name,
                TableConfigs.created_at,
                func.count(TableConfigColumns.id).label("total_columns"),
                func.count(TableConfigColumns.foreign_table_id)
                    .filter(TableConfigColumns.foreign_table_id.isnot(None))
                    .label("total_foreign_keys"),
            )
            .outerjoin(TableConfigColumns, TableConfigs.id == TableConfigColumns.table_id)
            .group_by(TableConfigs.id)
            .order_by(TableConfigs.name)
        )

        results = base_query.all()

        data = []
        for r in results:
            item = {
                "id": r.id,
                "name": r.name,
                "exhibition_name": r.exhibition_name,
                "created_at": r.created_at,
                "total_columns": r.total_columns,
                "total_foreign_keys": r.total_foreign_keys,
            }

            if with_columns:
                columns = (
                    self.db.query(TableConfigColumns)
                        .filter(TableConfigColumns.table_id == r.id)
                        .all()
                )

                item["columns"] = [
                    {
                        "id": c.id,
                        "name": c.name,
                        "type": c.type,
                        "foreign_table_id": c.foreign_table_id,
                        "foreign_column_id": c.foreign_column_id
                    }
                    for c in columns
                ]

            data.append(item)

        return data
    
    def update_table(self, table_id: int, data):
        table = self.db.query(TableConfigs).filter(TableConfigs.id == table_id).first()

        if not table:
            return None
        
        update_data = data.dict(exclude_unset=True)

        for key, value in update_data.items():
            if key == "columns" and value is not None:
                # Garante que col_data é dict
                new_columns_data = [
                    col if isinstance(col, dict) else col.dict(exclude_unset=True)
                    for col in value
                ]
                
                # Cria um mapa das colunas existentes por nome
                existing_columns = {col.name: col for col in table.columns}
                new_column_names = {col['name'] for col in new_columns_data}
                
                # Atualiza ou cria colunas
                for col_data in new_columns_data:
                    col_name = col_data['name']
                    
                    if col_name in existing_columns:
                        # Atualiza coluna existente
                        existing_col = existing_columns[col_name]
                        for field, val in col_data.items():
                            if field != 'id':  # Não atualiza o ID
                                setattr(existing_col, field, val)
                    else:
                        # Cria nova coluna
                        new_col = TableConfigColumns(**col_data)
                        table.columns.append(new_col)
                
                # Remove colunas que não existem mais
                # CUIDADO: Só remove se não houver mapping_columns associados
                for col_name, col in existing_columns.items():
                    if col_name not in new_column_names:
                        # Verifica se tem mapeamentos
                        has_mappings = self.db.query(self.db.query(col.mapping_columns).exists()).scalar()
                        
                        if not has_mappings:
                            table.columns.remove(col)
                        else:
                            print(f"⚠️ Não é possível remover coluna '{col_name}' - existem mapeamentos associados")
            else:
                setattr(table, key, value)
        
        self.db.commit()
        self.db.refresh(table)

        return table       

    def get_by_id(self, table_id: int) -> TableConfigs:
        return self.db.query(TableConfigs).options(joinedload(TableConfigs.columns)).filter(TableConfigs.id == table_id).first()
    
    def delete_tables(self, table_id: int):
        table = self.db.query(TableConfigs).filter(TableConfigs.id == table_id).first()

        if not table:
            return False

        self.db.delete(table)
        self.db.commit()
        return True
        