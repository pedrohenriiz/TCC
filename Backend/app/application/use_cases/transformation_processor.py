from typing import Any, List, Dict
from sqlalchemy.orm import Session
from domain.entities.mapping import MappingTransformation
from application.transformations.transformation_factory import TransformationFactory

class TransformationProcessor:
    """
    Processa e aplica transformações em valores de colunas.
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    def apply_transformations(
        self, 
        value: Any, 
        transformations: List[MappingTransformation]
    ) -> Any:
        """
        Aplica uma sequência de transformações em um valor.
        As transformações são aplicadas na ordem definida pelo campo 'order'.
        
        Args:
            value: Valor original a ser transformado
            transformations: Lista de MappingTransformation ordenadas
            
        Returns:
            Valor após aplicar todas as transformações
        """
        if not transformations:
            return value
        
        # Ordena as transformações pela ordem definida
        sorted_transformations = sorted(transformations, key=lambda t: t.order)
        
        # ✨ LOG: Mostra a ordem das transformações
        print(f"\n🔄 Aplicando {len(sorted_transformations)} transformação(ões):")
        for t in sorted_transformations:
            print(f"  {t.order}. {t.transformation_type.code}")
        
        result = value
        print(f"\n📥 Valor inicial: '{result}'")
        
        for idx, mapping_transformation in enumerate(sorted_transformations, 1):
            # Extrai os parâmetros da transformação
            params = self._extract_params(mapping_transformation)
            
            # Cria a transformação usando a factory
            transformation = TransformationFactory.create(
                code=mapping_transformation.transformation_type.code,
                params=params
            )
            
            # ✨ LOG: Antes da transformação
            print(f"\n  [{idx}] {mapping_transformation.transformation_type.code}")
            print(f"      Antes: '{result}'")
            print(f"      Params: {params}")
            
            # Aplica a transformação
            result = transformation.transform(result)
            
            # ✨ LOG: Depois da transformação
            print(f"      Depois: '{result}'")
        
        print(f"\n✅ Valor final: '{result}'\n")
        
        return result
    
    def _extract_params(self, mapping_transformation: MappingTransformation) -> Dict[str, Any]:
        """
        Extrai os parâmetros de uma MappingTransformation.
        
        Args:
            mapping_transformation: Transformação do mapping
            
        Returns:
            Dicionário com os parâmetros {param_key: value}
        """
        params = {}
        
        for param_value in mapping_transformation.param_values:
            param_key = param_value.param_definition.param_key
            params[param_key] = param_value.value
        
        return params