import { X, Save, Eye, Settings } from 'lucide-react';
import { useState } from 'react';

type TransformationType =
  | 'split'
  | 'concat'
  | 'default_value'
  | 'calculate'
  | 'format_date'
  | 'string_to_boolean';

interface TransformationConfig {
  type: TransformationType;
  config: any;
}

interface TransformationConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  transformation: TransformationConfig;
  onSave: (config: any) => void;
}

export default function TransformationConfigModal({
  isOpen,
  onClose,
  transformation,
  onSave,
}: TransformationConfigModalProps) {
  const [config, setConfig] = useState(transformation.config || {});
  const [preview, setPreview] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  const renderConfigForm = () => {
    switch (transformation.type) {
      case 'split':
        return (
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Delimitador <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                value={config.delimiter || ''}
                onChange={(e) =>
                  setConfig({ ...config, delimiter: e.target.value })
                }
                placeholder='Ex: espaço, vírgula, ponto-e-vírgula'
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500'
              />
              <p className='text-xs text-gray-500 mt-1'>
                Caractere(s) que separam o texto
              </p>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Posição <span className='text-red-500'>*</span>
              </label>
              <input
                type='number'
                min='0'
                value={config.position || 0}
                onChange={(e) =>
                  setConfig({ ...config, position: parseInt(e.target.value) })
                }
                placeholder='0'
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500'
              />
              <p className='text-xs text-gray-500 mt-1'>
                Qual parte pegar após dividir (0 = primeira parte, 1 = segunda,
                etc)
              </p>
            </div>

            {/* Preview */}
            <div className='bg-blue-50 border border-blue-200 rounded-lg p-3'>
              <p className='text-xs font-semibold text-blue-900 mb-2'>
                💡 Exemplo:
              </p>
              <div className='space-y-1 text-xs'>
                <p className='font-mono'>Entrada: "João Silva Santos"</p>
                <p className='font-mono'>Delimitador: " " (espaço)</p>
                <p className='font-mono'>Posição 0: "João"</p>
                <p className='font-mono'>Posição 1: "Silva"</p>
                <p className='font-mono'>Posição 2: "Santos"</p>
              </div>
            </div>
          </div>
        );

      case 'concat':
        return (
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Separador
              </label>
              <input
                type='text'
                value={config.separator || ''}
                onChange={(e) =>
                  setConfig({ ...config, separator: e.target.value })
                }
                placeholder='Ex: espaço, hífen, vírgula'
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500'
              />
              <p className='text-xs text-gray-500 mt-1'>
                Caractere entre os valores concatenados (deixe vazio para juntar
                direto)
              </p>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Colunas a concatenar <span className='text-red-500'>*</span>
              </label>
              <textarea
                value={config.columns || ''}
                onChange={(e) =>
                  setConfig({ ...config, columns: e.target.value })
                }
                placeholder='Ex: first_name, last_name'
                rows={3}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500'
              />
              <p className='text-xs text-gray-500 mt-1'>
                Liste as colunas separadas por vírgula
              </p>
            </div>

            <div className='bg-blue-50 border border-blue-200 rounded-lg p-3'>
              <p className='text-xs font-semibold text-blue-900 mb-2'>
                💡 Exemplo:
              </p>
              <div className='space-y-1 text-xs'>
                <p className='font-mono'>first_name: "João"</p>
                <p className='font-mono'>last_name: "Silva"</p>
                <p className='font-mono'>Separador: " "</p>
                <p className='font-mono'>Resultado: "João Silva"</p>
              </div>
            </div>
          </div>
        );

      case 'default_value':
        return (
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Valor Padrão <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                value={config.defaultValue || ''}
                onChange={(e) =>
                  setConfig({ ...config, defaultValue: e.target.value })
                }
                placeholder='Ex: N/A, 0, Desconhecido'
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500'
              />
              <p className='text-xs text-gray-500 mt-1'>
                Valor a usar quando o campo estiver vazio ou nulo
              </p>
            </div>

            <div className='bg-blue-50 border border-blue-200 rounded-lg p-3'>
              <p className='text-xs font-semibold text-blue-900 mb-2'>
                💡 Exemplo:
              </p>
              <div className='space-y-1 text-xs'>
                <p className='font-mono'>Campo vazio → "N/A"</p>
                <p className='font-mono'>Campo null → "Desconhecido"</p>
                <p className='font-mono'>Campo com valor → mantém o valor</p>
              </div>
            </div>
          </div>
        );

      case 'calculate':
        return (
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Fórmula <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                value={config.formula || ''}
                onChange={(e) =>
                  setConfig({ ...config, formula: e.target.value })
                }
                placeholder='Ex: {preco} * {quantidade}'
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono'
              />
              <p className='text-xs text-gray-500 mt-1'>
                Use {`{nome_coluna}`} para referenciar colunas. Operadores: +,
                -, *, /
              </p>
            </div>

            <div className='bg-blue-50 border border-blue-200 rounded-lg p-3'>
              <p className='text-xs font-semibold text-blue-900 mb-2'>
                💡 Exemplos:
              </p>
              <div className='space-y-1 text-xs font-mono'>
                <p>{`{preco} * {quantidade}`} → Total do pedido</p>
                <p>{`{valor} * 0.1`} → 10% de desconto</p>
                <p>{`{salario} * 12`} → Salário anual</p>
                <p>{`({nota1} + {nota2}) / 2`} → Média</p>
              </div>
            </div>
          </div>
        );

      case 'format_date':
        return (
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Formato de Entrada <span className='text-red-500'>*</span>
              </label>
              <select
                value={config.inputFormat || ''}
                onChange={(e) =>
                  setConfig({ ...config, inputFormat: e.target.value })
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500'
              >
                <option value=''>Selecione...</option>
                <option value='DD/MM/YYYY'>DD/MM/YYYY (31/12/2023)</option>
                <option value='MM/DD/YYYY'>MM/DD/YYYY (12/31/2023)</option>
                <option value='YYYY-MM-DD'>YYYY-MM-DD (2023-12-31)</option>
                <option value='timestamp'>Timestamp (Unix)</option>
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Formato de Saída <span className='text-red-500'>*</span>
              </label>
              <select
                value={config.outputFormat || ''}
                onChange={(e) =>
                  setConfig({ ...config, outputFormat: e.target.value })
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500'
              >
                <option value=''>Selecione...</option>
                <option value='DD/MM/YYYY'>DD/MM/YYYY (31/12/2023)</option>
                <option value='MM/DD/YYYY'>MM/DD/YYYY (12/31/2023)</option>
                <option value='YYYY-MM-DD'>YYYY-MM-DD (2023-12-31)</option>
                <option value='ISO8601'>ISO 8601 (2023-12-31T00:00:00Z)</option>
              </select>
            </div>

            <div className='bg-blue-50 border border-blue-200 rounded-lg p-3'>
              <p className='text-xs font-semibold text-blue-900 mb-2'>
                💡 Exemplo:
              </p>
              <p className='text-xs font-mono'>31/12/2023 → 2023-12-31</p>
            </div>
          </div>
        );

      case 'string_to_boolean':
        return (
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Valores TRUE <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                value={config.trueValues || 'S,Sim,Yes,1,true'}
                onChange={(e) =>
                  setConfig({ ...config, trueValues: e.target.value })
                }
                placeholder='S,Sim,Yes,1,true'
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500'
              />
              <p className='text-xs text-gray-500 mt-1'>
                Valores separados por vírgula que significam TRUE
              </p>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Valores FALSE <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                value={config.falseValues || 'N,Não,No,0,false'}
                onChange={(e) =>
                  setConfig({ ...config, falseValues: e.target.value })
                }
                placeholder='N,Não,No,0,false'
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500'
              />
              <p className='text-xs text-gray-500 mt-1'>
                Valores separados por vírgula que significam FALSE
              </p>
            </div>

            <div className='bg-blue-50 border border-blue-200 rounded-lg p-3'>
              <p className='text-xs font-semibold text-blue-900 mb-2'>
                💡 Exemplo:
              </p>
              <div className='space-y-1 text-xs font-mono'>
                <p>"S" → true</p>
                <p>"N" → false</p>
                <p>"Sim" → true</p>
                <p>"1" → true</p>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <p className='text-sm text-gray-600'>
            Esta transformação não requer configuração adicional.
          </p>
        );
    }
  };

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4'>
      <div className='bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col'>
        {/* Header */}
        <div className='px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-purple-50'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-purple-100 rounded-lg'>
              <Settings className='w-5 h-5 text-purple-600' />
            </div>
            <div>
              <h2 className='text-lg font-semibold text-gray-900'>
                Configurar Transformação
              </h2>
              <p className='text-xs text-gray-600'>
                Defina os parâmetros da transformação
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='p-2 hover:bg-purple-100 rounded-lg transition'
          >
            <X className='w-5 h-5 text-gray-500' />
          </button>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-y-auto p-6'>{renderConfigForm()}</div>

        {/* Footer */}
        <div className='px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3'>
          <button
            onClick={onClose}
            className='px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition font-medium'
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className='inline-flex items-center gap-2 px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium'
          >
            <Save className='w-4 h-4' />
            Salvar Configuração
          </button>
        </div>
      </div>
    </div>
  );
}
