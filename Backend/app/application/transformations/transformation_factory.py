from typing import Dict, Any, Optional, Type
from domain.transformers.transformations.base_transformation import BaseTransformation
from domain.transformers.transformations.uppercase_transformation import UppercaseTransformation
from domain.transformers.transformations.lowercase_transformation import LowercaseTransformation
from domain.transformers.transformations.split_transformation import SplitTransformation
from domain.transformers.transformations.trim_transformation import TrimTransformation
from domain.transformers.transformations.replace_transformation import ReplaceTransformation
from domain.transformers.transformations.concat_transformation import ConcatTransformation
from domain.transformers.transformations.capitalize_transformation import CapitalizeTransformation
from domain.transformers.transformations.title_case_transformation import TitleCaseTransformation
from domain.transformers.transformations.remove_accents_transformation import RemoveAccentsTransformation
from domain.transformers.transformations.remove_special_chars_transformation import RemoveSpecialCharsTransformation
from domain.transformers.transformations.pad_transformation import PadTransformation
from domain.transformers.transformations.reverse_transformation import ReverseTransformation
from domain.transformers.transformations.round_transformation import RoundTransformation
from domain.transformers.transformations.format_number_transformation import FormatNumberTransformation
from domain.transformers.transformations.absolute_transformation import AbsoluteTransformation
from domain.transformers.transformations.math_operations_transformation import MathOperationTransformation
from domain.transformers.transformations.date_format_transformation import DateFormatTransformation
from domain.transformers.transformations.extract_date_transformation import ExtractDateTransformation
from domain.transformers.transformations.phone_format_transformation import PhoneFormatTransformation
from domain.transformers.transformations.document_format_transformation import DocumentFormatTransformation
from domain.transformers.transformations.cep_format_transformation import CepFormatTransformation
from domain.transformers.transformations.if_empty_transformation import IfEmptyTransformation
from domain.transformers.transformations.if_null_transformation import IfNullTransformation
from domain.transformers.transformations.regex_replace_transformation import RegexReplaceTransformation
from domain.transformers.transformations.regex_extract_transformation import RegexExtractTransformation
from domain.transformers.transformations.parse_number_transformation import ParseNumberTransformation

class TransformationFactory:
    """
    Factory para criar instâncias de transformações baseado no código.
    """
    
    # Registro de todas as transformações disponíveis
    _transformations: Dict[str, Type[BaseTransformation]] = {
        "UPPERCASE": UppercaseTransformation,
        "LOWERCASE": LowercaseTransformation,
        "SPLIT": SplitTransformation,
        "TRIM": TrimTransformation,
        "REPLACE": ReplaceTransformation,
        "CONCAT": ConcatTransformation,
        "CAPITALIZE": CapitalizeTransformation, 
        "TITLE_CASE": TitleCaseTransformation,
        "REMOVE_ACCENTS": RemoveAccentsTransformation,
        "REMOVE_SPECIAL_CHARS": RemoveSpecialCharsTransformation,
        "PAD": PadTransformation,
        "REVERSE": ReverseTransformation,
        "ROUND": RoundTransformation,
        "FORMAT_NUMBER": FormatNumberTransformation,
        "ABSOLUTE": AbsoluteTransformation,
        "MATH_OPERATION": MathOperationTransformation,
        "DATE_FORMAT": DateFormatTransformation, 
        "EXTRACT_DATE": ExtractDateTransformation,
        "PHONE_FORMAT": PhoneFormatTransformation,
        "DOCUMENT_FORMAT": DocumentFormatTransformation,
        "CEP_FORMAT": CepFormatTransformation,
        "IF_EMPTY": IfEmptyTransformation,
        "IF_NULL": IfNullTransformation,
        "REGEX_REPLACE": RegexReplaceTransformation,
        "REGEX_EXTRACT": RegexExtractTransformation,
        "PARSE_NUMBER": ParseNumberTransformation
    }
    
    @classmethod
    def create(cls, code: str, params: Optional[Dict[str, Any]] = None) -> BaseTransformation:
        """
        Cria uma instância de transformação baseada no código.
        
        Args:
            code: Código da transformação (ex: 'UPPERCASE')
            params: Parâmetros da transformação
            
        Returns:
            Instância da transformação
            
        Raises:
            ValueError: Se a transformação não for encontrada
        """
        transformation_class = cls._transformations.get(code.upper())
        
        if not transformation_class:
            raise ValueError(f"Transformação '{code}' não encontrada. Transformações disponíveis: {list(cls._transformations.keys())}")
        
        transformation = transformation_class(params)
        
        if not transformation.validate_params():
            raise ValueError(f"Parâmetros inválidos para a transformação '{code}'")
        
        return transformation
    
    @classmethod
    def register(cls, transformation_class: Type[BaseTransformation]):
        """
        Registra uma nova transformação na factory.
        Útil para adicionar transformações customizadas.
        
        Args:
            transformation_class: Classe da transformação a ser registrada
        """
        instance = transformation_class()
        cls._transformations[instance.code] = transformation_class
    
    @classmethod
    def get_available_transformations(cls) -> list:
        """
        Retorna lista de transformações disponíveis.
        
        Returns:
            Lista com os códigos das transformações disponíveis
        """
        return list(cls._transformations.keys())