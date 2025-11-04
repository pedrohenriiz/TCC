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
    
    def list_tables(self):
        query = (
            self.db.query(
                TableConfigs.id,
                TableConfigs.name,
                TableConfigs.exhibition_name,
                TableConfigs.created_at,
                func.count(TableConfigColumns.id).label("total_columns"),
                func.count(TableConfigColumns.foreign_table_id).filter(
                    TableConfigColumns.foreign_table_id.isnot(None)
                ).label("total_foreign_keys"),
            ).outerjoin(TableConfigColumns, TableConfigs.id == TableConfigColumns.table_id).group_by(TableConfigs.id).order_by(TableConfigs.name)
        )

        data = [
            {
                "id": r.id,
                "name": r.name,
                "created_at": r.created_at,
                "exhibition_name": r.exhibition_name,
                "total_columns": r.total_columns,
                "total_foreign_keys": r.total_foreign_keys,
            }
            for r in query
        ]

        return data
    
    def update_table(self, table_id: int, data):
        table = self.db.query(TableConfigs).filter(TableConfigs.id == table_id).first()

        if not table:
            return None
        
        update_data = data.dict(exclude_unset=True)

        for key, value in update_data.items():
            if key == "columns" and value is not None:
                # Atualização especial para colunas (pode ser um loop ou substituição total)
                # Exemplo: apagar antigas e inserir novas
                table.columns.clear()
                for col_data in value:
                    new_col = TableConfigColumns(**col_data.dict(exclude_unset=True))
                    table.columns.append(new_col)
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
        