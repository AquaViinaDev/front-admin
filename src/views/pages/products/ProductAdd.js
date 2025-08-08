import React, { useState } from 'react';
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormSwitch,
  CFormTextarea,
  CFormSelect,
  CRow,
} from '@coreui/react';
import { useNavigate } from 'react-router-dom';
import { createProduct } from 'src/api/productApi';
import { toast } from 'react-toastify';

const CHARACTERISTICS_BY_TYPE = {
  'Кувшины': [
    'Тип фильтрации',
    'Материал',
    'Применение',
    'Объем кувшина',
    'Ресурс фильтра',
    'Температура воды',
    'Скорость фильтрации',
  ],
  'Проточный фильтр': [
    'Тип фильтрации',
    'Материал',
    'Применение',
    'Мин. давление',
    'Макс. давление',
    'Температура воды',
    'Кол-во ступеней очистки',
    'Скорость фильтрации',
    'Тип подключения',
  ],
  'Обратный осмос': [
    'Тип фильтрации',
    'Пористость',
    'Материал',
    'Применение',
    'Мин. давление',
    'Макс. давление',
    'Температура воды',
    'Кол-во ступеней очистки',
    'Скорость фильтрации',
    'Тип подключения',
  ],
  'Предфильтр': [
    'Тип фильтрации',
    'Размер',
    'Пористость',
    'Материал',
    'Применение',
    'Мин. давление',
    'Макс. давление',
    'Температура воды',
    'Кол-во ступеней очистки',
    'Скорость фильтрации',
    'Тип подключения',
  ],
};

const ProductAdd = () => {
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    name: { ru: '', ro: '' },
    brand: { ru: '', ro: '' },
    description: { ru: '', ro: '' },
    image: '',
    price: '',
    inStock: true,
    stockQty: 0,
    type: { ru: '', ro: '' },
    characteristics: { ru: {}, ro: {} },
    categorieIds: [],
  });

  const [selectedType, setSelectedType] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleLangChange = (field, lang, value) => {
    setProduct((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [lang]: value,
      },
    }));
  };

  const handleCharacteristicChange = (lang, key, value) => {
    setProduct((prev) => ({
      ...prev,
      characteristics: {
        ...prev.characteristics,
        [lang]: {
          ...prev.characteristics[lang],
          [key]: value,
        },
      },
    }));
  };

  const handleTypeSelect = (e) => {
    const typeRu = e.target.value;
    setSelectedType(typeRu);
    setProduct((prev) => ({
      ...prev,
      type: {
        ru: typeRu,
        ro: '',
      },
      characteristics: {
        ru: Object.fromEntries(
          CHARACTERISTICS_BY_TYPE[typeRu].map((char) => [char, null])
        ),
        ro: Object.fromEntries(
          CHARACTERISTICS_BY_TYPE[typeRu].map(() => [ '', null ])
        ),
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...product,
        price: parseFloat(product.price),
      };
      await createProduct(payload);
      toast.success('Товар успешно добавлен!');
      navigate('/products');
    } catch (err) {
      console.error('Ошибка при добавлении товара:', err);
      toast.error('Ошибка при добавлении');
    }
  };

  return (
    <CRow>
      <CCol xs={12}>
        <CCard>
          <CCardHeader>
            <strong>Добавление товара</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <CFormInput
                label="Название (ru)"
                value={product.name.ru}
                onChange={(e) => handleLangChange('name', 'ru', e.target.value)}
                className="mb-3"
                required
              />
              <CFormInput
                label="Название (ro)"
                value={product.name.ro}
                onChange={(e) => handleLangChange('name', 'ro', e.target.value)}
                className="mb-3"
              />
              <CFormInput
                label="Бренд (ru)"
                value={product.brand.ru}
                onChange={(e) => handleLangChange('brand', 'ru', e.target.value)}
                className="mb-3"
              />
              <CFormInput
                label="Бренд (ro)"
                value={product.brand.ro}
                onChange={(e) => handleLangChange('brand', 'ro', e.target.value)}
                className="mb-3"
              />
              <CFormTextarea
                label="Описание (ru)"
                value={product.description.ru}
                onChange={(e) => handleLangChange('description', 'ru', e.target.value)}
                className="mb-3"
              />
              <CFormTextarea
                label="Описание (ro)"
                value={product.description.ro}
                onChange={(e) => handleLangChange('description', 'ro', e.target.value)}
                className="mb-3"
              />
              <CFormInput
                type="text"
                name="image"
                label="Ссылка на изображение"
                value={product.image}
                onChange={handleChange}
                className="mb-3"
              />
              <CFormInput
                type="number"
                name="price"
                label="Цена"
                value={product.price}
                onChange={handleChange}
                className="mb-3"
                required
              />
              <CFormInput
                type="number"
                name="stockQty"
                label="Количество на складе"
                value={product.stockQty}
                onChange={handleChange}
                className="mb-3"
              />
              <CFormSwitch
                label="В наличии"
                name="inStock"
                checked={product.inStock}
                onChange={handleChange}
                className="mb-3"
              />
              <CFormSelect
                label="Тип товара"
                value={selectedType}
                onChange={handleTypeSelect}
                className="mb-3"
              >
                <option value="">Выберите тип</option>
                {Object.keys(CHARACTERISTICS_BY_TYPE).map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </CFormSelect>
              {selectedType && (
                <>
                  <CFormInput
                    label="Тип (ro)"
                    value={product.type.ro}
                    onChange={(e) => handleLangChange('type', 'ro', e.target.value)}
                    className="mb-3"
                  />
                  <h6 className="mt-4">Характеристики</h6>
                  {CHARACTERISTICS_BY_TYPE[selectedType].map((charKey, index) => (
                    <CRow key={index} className="mb-2">
                      <CCol md={6}>
                        <CFormInput
                          label={`${charKey} (ru)`}
                          value={product.characteristics.ru[charKey] ?? ''}
                          onChange={(e) => handleCharacteristicChange('ru', charKey, e.target.value)}
                        />
                      </CCol>
                      <CCol md={6}>
                        <CFormInput
                          label={`${charKey} (ro)`}
                          value={product.characteristics.ro[charKey] ?? ''}
                          onChange={(e) => handleCharacteristicChange('ro', charKey, e.target.value)}
                        />
                      </CCol>
                    </CRow>
                  ))}
                </>
              )}
              <div className="mt-4">
                <CButton color="primary" type="submit">
                  Добавить товар
                </CButton>
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default ProductAdd;
