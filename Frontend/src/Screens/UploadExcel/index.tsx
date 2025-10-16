// pages/UploadExcel.tsx
import React, { useState, useCallback } from 'react';
import {
  Upload,
  FileSpreadsheet,
  X,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Eye,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import useSourceTablesStore from '../../store/useSourceTableStore';

// ==========================================
// TIPOS E INTERFACES
// ==========================================

type DataType =
  | 'VARCHAR'
  | 'INT'
  | 'BIGINT'
  | 'TEXT'
  | 'DATE'
  | 'DATETIME'
  | 'BOOLEAN'
  | 'DECIMAL'
  | 'FLOAT';

type FileStatus = 'processing' | 'success' | 'error';

interface ColumnDefinition {
  name: string;
  type: DataType;
  max_length: number | null;
  nullable: boolean;
}

interface DetectedType {
  type: DataType;
  max_length: number | null;
}

interface ProcessedExcelData {
  fileName: string;
  sheetName: string;
  columns: ColumnDefinition[];
  data: Record<string, any>[];
  rowCount: number;
  size: number;
}

interface UploadedFile {
  id: number;
  file: File;
  name: string;
  size: number;
  status: FileStatus;
  progress: number;
  error: string | null;
  data: ProcessedExcelData | null;
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

const UploadExcel: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addSourceTableFromExcel } = useSourceTablesStore();

  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [previewData, setPreviewData] = useState<ProcessedExcelData | null>(
    null
  );

  // Processar arquivo Excel
  const processExcelFile = async (file: File): Promise<ProcessedExcelData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          if (!e.target?.result) {
            reject(new Error('Erro ao ler arquivo'));
            return;
          }

          const data = new Uint8Array(e.target.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });

          // Pegar a primeira aba
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          // Converter para JSON
          const jsonData = XLSX.utils.sheet_to_json<any[]>(worksheet, {
            header: 1,
            defval: '',
          });

          if (jsonData.length === 0) {
            reject(new Error('Arquivo vazio'));
            return;
          }

          // Primeira linha = headers
          const headers = jsonData[0] as string[];
          const rows = jsonData.slice(1);

          // Detectar tipos de dados
          const columns: ColumnDefinition[] = headers.map((header, index) => {
            const columnValues = rows
              .map((row) => row[index])
              .filter((v) => v !== '' && v !== null && v !== undefined);

            const detectedType = detectColumnType(columnValues);

            return {
              name: header || `coluna_${index + 1}`,
              type: detectedType.type,
              max_length: detectedType.max_length,
              nullable: columnValues.length < rows.length,
            };
          });

          // Converter rows para objetos
          const dataObjects: Record<string, any>[] = rows.map((row) => {
            const obj: Record<string, any> = {};
            headers.forEach((header, index) => {
              obj[header || `coluna_${index + 1}`] = row[index];
            });
            return obj;
          });

          resolve({
            fileName: file.name,
            sheetName: firstSheetName,
            columns,
            data: dataObjects,
            rowCount: rows.length,
            size: file.size,
          });
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsArrayBuffer(file);
    });
  };

  // Detectar tipo da coluna
  const detectColumnType = (values: any[]): DetectedType => {
    if (values.length === 0) {
      return { type: 'VARCHAR', max_length: 255 };
    }

    let isNumber = true;
    let isDate = true;
    let isBoolean = true;
    let maxLength = 0;

    for (const value of values) {
      const strValue = String(value);
      maxLength = Math.max(maxLength, strValue.length);

      // Verificar se é número
      if (isNaN(Number(value))) {
        isNumber = false;
      }

      // Verificar se é data
      if (!(value instanceof Date) && isNaN(Date.parse(value))) {
        isDate = false;
      }

      // Verificar se é boolean
      const boolValues = [
        true,
        false,
        'true',
        'false',
        1,
        0,
        'sim',
        'não',
        'SIM',
        'NÃO',
      ];
      if (!boolValues.includes(value)) {
        isBoolean = false;
      }
    }

    if (isBoolean) return { type: 'BOOLEAN', max_length: null };

    if (isNumber) {
      // Verificar se tem decimais
      const hasDecimals = values.some((v) => !Number.isInteger(Number(v)));
      return { type: hasDecimals ? 'DECIMAL' : 'INT', max_length: null };
    }

    if (isDate) return { type: 'DATE', max_length: null };

    // Default: texto
    const suggestedLength = Math.min(Math.max(maxLength * 1.5, 50), 255);
    return {
      type: maxLength > 255 ? 'TEXT' : 'VARCHAR',
      max_length: maxLength > 255 ? null : Math.ceil(suggestedLength),
    };
  };

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  // Handle drop
  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    await handleFiles(droppedFiles);
  }, []);

  // Handle file input change
  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    await handleFiles(selectedFiles);
  };

  // Processar arquivos
  const handleFiles = async (selectedFiles: File[]) => {
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const validFiles = selectedFiles.filter((file) => {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      return validExtensions.includes(extension);
    });

    if (validFiles.length === 0) {
      alert(
        'Nenhum arquivo válido selecionado. Formatos aceitos: .xlsx, .xls, .csv'
      );
      return;
    }

    // Processar cada arquivo
    for (const file of validFiles) {
      const fileId = Date.now() + Math.random();

      // Adicionar arquivo com status "processing"
      setFiles((prev) => [
        ...prev,
        {
          id: fileId,
          file,
          name: file.name,
          size: file.size,
          status: 'processing',
          progress: 0,
          error: null,
          data: null,
        },
      ]);

      try {
        // Simular progresso
        setFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, progress: 30 } : f))
        );

        const result = await processExcelFile(file);

        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? {
                  ...f,
                  status: 'success',
                  progress: 100,
                  data: result,
                }
              : f
          )
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Erro desconhecido';
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? {
                  ...f,
                  status: 'error',
                  error: errorMessage,
                }
              : f
          )
        );
      }
    }
  };

  // Remover arquivo
  const removeFile = (fileId: number) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  // Preview de dados
  const handlePreview = (fileData: ProcessedExcelData) => {
    setPreviewData(fileData);
    setShowPreview(true);
  };

  // Salvar e continuar
  const handleSave = () => {
    const successFiles = files.filter((f) => f.status === 'success' && f.data);

    if (successFiles.length === 0) {
      alert('Nenhum arquivo processado com sucesso');
      return;
    }

    // Salvar cada arquivo como tabela de origem
    successFiles.forEach((file) => {
      if (file.data) {
        addSourceTableFromExcel(
          file.data.fileName,
          file.data.data,
          file.data.columns,
          file.data.rowCount
        );
      }
    });

    alert(`${successFiles.length} arquivo(s) importado(s) com sucesso!`);
    navigate(`/migration-project/${id}/source-tables`);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='bg-white rounded-lg shadow-lg p-6 mb-6'>
          <div className='flex items-center gap-3'>
            <button
              onClick={() => navigate(`/migration-project/${id}/source-tables`)}
              className='p-2 hover:bg-gray-100 rounded-lg transition'
            >
              <ArrowLeft className='w-5 h-5' />
            </button>
            <FileSpreadsheet className='w-8 h-8 text-blue-600' />
            <div>
              <h1 className='text-2xl font-bold text-gray-800'>
                Upload de Arquivos Excel
              </h1>
              <p className='text-gray-600 text-sm'>
                Faça upload dos arquivos Excel com os dados de origem
              </p>
            </div>
          </div>
        </div>

        {/* Área de Upload */}
        <div className='bg-white rounded-lg shadow-lg p-6 mb-6'>
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-blue-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className='w-16 h-16 mx-auto mb-4 text-gray-400' />
            <h3 className='text-xl font-semibold text-gray-700 mb-2'>
              Arraste arquivos Excel aqui
            </h3>
            <p className='text-gray-500 mb-4'>ou clique para selecionar</p>
            <input
              type='file'
              id='file-input'
              multiple
              accept='.xlsx,.xls,.csv'
              onChange={handleFileInput}
              className='hidden'
            />
            <label
              htmlFor='file-input'
              className='inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 cursor-pointer transition'
            >
              Selecionar Arquivos
            </label>
            <p className='text-sm text-gray-500 mt-4'>
              Formatos aceitos: .xlsx, .xls, .csv
            </p>
          </div>
        </div>

        {/* Lista de Arquivos */}
        {files.length > 0 && (
          <div className='bg-white rounded-lg shadow-lg p-6'>
            <h2 className='text-lg font-semibold mb-4'>
              Arquivos ({files.length})
            </h2>
            <div className='space-y-4'>
              {files.map((file) => (
                <div
                  key={file.id}
                  className={`border rounded-lg p-4 ${
                    file.status === 'success'
                      ? 'border-green-200 bg-green-50'
                      : file.status === 'error'
                      ? 'border-red-200 bg-red-50'
                      : 'border-blue-200 bg-blue-50'
                  }`}
                >
                  <div className='flex items-start justify-between'>
                    <div className='flex items-start gap-3 flex-1'>
                      <FileSpreadsheet className='w-6 h-6 text-gray-600 mt-1' />
                      <div className='flex-1'>
                        <div className='flex items-center gap-2'>
                          <h3 className='font-semibold text-gray-800'>
                            {file.name}
                          </h3>
                          {file.status === 'success' && (
                            <CheckCircle className='w-5 h-5 text-green-600' />
                          )}
                          {file.status === 'error' && (
                            <AlertCircle className='w-5 h-5 text-red-600' />
                          )}
                        </div>
                        <p className='text-sm text-gray-600'>
                          {formatFileSize(file.size)}
                          {file.data &&
                            ` • ${file.data.rowCount} linhas • ${file.data.columns.length} colunas`}
                        </p>

                        {/* Barra de Progresso */}
                        {file.status === 'processing' && (
                          <div className='mt-2'>
                            <div className='w-full bg-gray-200 rounded-full h-2'>
                              <div
                                className='bg-blue-600 h-2 rounded-full transition-all'
                                style={{ width: `${file.progress}%` }}
                              ></div>
                            </div>
                            <p className='text-xs text-gray-500 mt-1'>
                              Processando... {file.progress}%
                            </p>
                          </div>
                        )}

                        {/* Erro */}
                        {file.status === 'error' && (
                          <p className='text-sm text-red-600 mt-2'>
                            ❌ Erro: {file.error}
                          </p>
                        )}

                        {/* Sucesso - Detalhes */}
                        {file.status === 'success' && file.data && (
                          <div className='mt-2'>
                            <div className='flex flex-wrap gap-2 text-xs'>
                              <span className='bg-white px-2 py-1 rounded border'>
                                📊 Aba: {file.data.sheetName}
                              </span>
                              <span className='bg-white px-2 py-1 rounded border'>
                                📝 {file.data.rowCount} registros
                              </span>
                              <span className='bg-white px-2 py-1 rounded border'>
                                📋 {file.data.columns.length} colunas
                              </span>
                            </div>
                            <button
                              onClick={() => handlePreview(file.data!)}
                              className='mt-2 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800'
                            >
                              <Eye className='w-4 h-4' />
                              Ver Preview
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Botão Remover */}
                    <button
                      onClick={() => removeFile(file.id)}
                      className='text-gray-400 hover:text-red-600 transition'
                    >
                      <X className='w-5 h-5' />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Botões de Ação */}
            <div className='flex justify-between items-center mt-6 pt-6 border-t'>
              <button
                onClick={() =>
                  navigate(`/migration-project/${id}/source-tables`)
                }
                className='px-6 py-3 border rounded-lg hover:bg-gray-50'
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!files.some((f) => f.status === 'success')}
                className='bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold'
              >
                Salvar e Continuar →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Preview */}
      {showPreview && previewData && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6'>
          <div className='bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col'>
            <div className='p-6 border-b flex items-center justify-between'>
              <div>
                <h2 className='text-xl font-bold text-gray-800'>
                  Preview: {previewData.fileName}
                </h2>
                <p className='text-sm text-gray-600'>
                  Primeiras 10 linhas de {previewData.rowCount} registros
                </p>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className='text-gray-400 hover:text-gray-600'
              >
                <X className='w-6 h-6' />
              </button>
            </div>

            <div className='p-6 overflow-auto flex-1'>
              <div className='overflow-x-auto'>
                <table className='w-full border-collapse'>
                  <thead>
                    <tr className='bg-gray-50'>
                      <th className='border px-4 py-2 text-left text-sm font-semibold'>
                        #
                      </th>
                      {previewData.columns.map((col, idx) => (
                        <th
                          key={idx}
                          className='border px-4 py-2 text-left text-sm font-semibold'
                        >
                          <div>{col.name}</div>
                          <div className='text-xs font-normal text-gray-500'>
                            {col.type}
                            {col.max_length && `(${col.max_length})`}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.data.slice(0, 10).map((row, rowIdx) => (
                      <tr key={rowIdx} className='hover:bg-gray-50'>
                        <td className='border px-4 py-2 text-sm text-gray-500'>
                          {rowIdx + 1}
                        </td>
                        {previewData.columns.map((col, colIdx) => (
                          <td key={colIdx} className='border px-4 py-2 text-sm'>
                            {String(row[col.name] || '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className='p-6 border-t flex justify-end'>
              <button
                onClick={() => setShowPreview(false)}
                className='bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700'
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadExcel;
