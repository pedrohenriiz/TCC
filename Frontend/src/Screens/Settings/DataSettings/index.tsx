import React, { useState } from 'react';
import { Plus, Trash2, Edit3 } from 'lucide-react';
import AddDataTypeModal from './AddDataTypeModal';
import { useDataSettingsStore } from '../../../store/useDataSettingStore';
import Table from './Table';

interface DataType {
  id: number;
  name: string;
  baseType: string;
  config: Record<string, any>;
}

export default function DataTypesPage() {
  const { addDataSetting, updateDataSetting, dataSettings } =
    useDataSettingsStore();

  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState(null);

  const [editingId, setEditingId] = useState<number | null>(null);

  const handleSave = (values: DataType) => {
    if (editingId) {
      updateDataSetting(editingId, values);
    } else {
      addDataSetting(values);
    }
    setShowModal(!showModal);
  };

  const handleEdit = (type: DataType) => {
    setEditingId(type.id);
  };

  const handleDelete = (id: number) => {};

  const renderDynamicFields = (values: any, setFieldValue: any) => {
    switch (values.baseType) {
      case 'string':
        return (
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Mínimo de caracteres
              </label>
              <input
                type='number'
                value={values.config?.minLength || ''}
                onChange={(e) =>
                  setFieldValue('config', {
                    ...values.config,
                    minLength: e.target.value,
                  })
                }
                className='mt-1 w-full border rounded-md px-2 py-1'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Máximo de caracteres
              </label>
              <input
                type='number'
                value={values.config?.maxLength || ''}
                onChange={(e) =>
                  setFieldValue('config', {
                    ...values.config,
                    maxLength: e.target.value,
                  })
                }
                className='mt-1 w-full border rounded-md px-2 py-1'
              />
            </div>
          </div>
        );

      case 'number':
        return (
          <>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Dígitos inteiros
                </label>
                <input
                  type='number'
                  value={values.config?.integers || ''}
                  onChange={(e) =>
                    setFieldValue('config', {
                      ...values.config,
                      integers: e.target.value,
                    })
                  }
                  className='mt-1 w-full border rounded-md px-2 py-1'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Casas decimais
                </label>
                <input
                  type='number'
                  value={values.config?.decimals || ''}
                  onChange={(e) =>
                    setFieldValue('config', {
                      ...values.config,
                      decimals: e.target.value,
                    })
                  }
                  className='mt-1 w-full border rounded-md px-2 py-1'
                />
              </div>
            </div>

            <div className='mt-3'>
              <label className='block text-sm font-medium text-gray-700'>
                Permitir negativo?
              </label>
              <select
                value={values.config?.allowNegative || ''}
                onChange={(e) =>
                  setFieldValue('config', {
                    ...values.config,
                    allowNegative: e.target.value,
                  })
                }
                className='mt-1 w-full border rounded-md px-2 py-1'
              >
                <option value=''>Selecione</option>
                <option value='true'>Sim</option>
                <option value='false'>Não</option>
              </select>
            </div>
          </>
        );

      case 'boolean':
        return (
          <>
            <label className='block text-sm font-medium text-gray-700'>
              Formato de armazenamento
            </label>
            <select
              value={values.config?.format || ''}
              onChange={(e) =>
                setFieldValue('config', {
                  ...values.config,
                  format: e.target.value,
                })
              }
              className='mt-1 w-full border rounded-md px-2 py-1'
            >
              <option value=''>Selecione</option>
              <option value='true_false'>true / false</option>
              <option value='1_0'>1 / 0</option>
              <option value='V_F'>V / F</option>
              <option value='custom'>Personalizado</option>
            </select>

            {values.config?.format === 'custom' && (
              <div className='grid grid-cols-2 gap-4 mt-2'>
                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    Valor Verdadeiro
                  </label>
                  <input
                    type='text'
                    value={values.config?.trueValue || ''}
                    onChange={(e) =>
                      setFieldValue('config', {
                        ...values.config,
                        trueValue: e.target.value,
                      })
                    }
                    className='mt-1 w-full border rounded-md px-2 py-1'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    Valor Falso
                  </label>
                  <input
                    type='text'
                    value={values.config?.falseValue || ''}
                    onChange={(e) =>
                      setFieldValue('config', {
                        ...values.config,
                        falseValue: e.target.value,
                      })
                    }
                    className='mt-1 w-full border rounded-md px-2 py-1'
                  />
                </div>
              </div>
            )}
          </>
        );

      case 'date':
        return (
          <>
            <label className='block text-sm font-medium text-gray-700'>
              Formato da Data
            </label>
            <input
              type='text'
              placeholder='Ex: YYYY-MM-DD'
              value={values.config?.format || ''}
              onChange={(e) =>
                setFieldValue('config', {
                  ...values.config,
                  format: e.target.value,
                })
              }
              className='mt-1 w-full border rounded-md px-2 py-1'
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h3 className='text-lg font-medium text-gray-800'>Tipos de Dados</h3>

        <button
          onClick={() => setShowModal(!showModal)}
          className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md'
        >
          <Plus className='w-4 h-4' />
          Novo tipo de dado
        </button>
      </div>

      <Table
        data={dataSettings}
        handleDelete={handleDelete}
        handleEdit={handleEdit}
      />

      {showModal && (
        <AddDataTypeModal
          initialValues={editingType || { name: '', baseType: '', config: {} }}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditingType(null);
          }}
          renderDynamicFields={renderDynamicFields}
        />
      )}
    </div>
  );
}
