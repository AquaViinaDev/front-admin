import React, {useState} from 'react';
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
  CRow,
} from '@coreui/react';
import {useNavigate} from 'react-router-dom';
import {createProduct} from "src/api/productApi";
import {toast} from "react-toastify";

const ProductAdd = () => {
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    name: '',
    brand: '',
    description: '',
    image: '',
    price: '',
    inStock: true,
    stockQty: 0,
    deliveryAvailable: true,
    characteristics: [],
    categorieIds: [],
  });

  const handleChange = (e) => {
    const {name, value, type, checked} = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCharacteristicChange = (index, field, value) => {
    const newChars = [...product.characteristics];
    newChars[index] = {...newChars[index], [field]: value};
    setProduct((prev) => ({...prev, characteristics: newChars}));
  };

  const addCharacteristic = () => {
    setProduct((prev) => ({
      ...prev,
      characteristics: [...prev.characteristics, {key: '', value: ''}],
    }));
  };

  const removeCharacteristic = (index) => {
    const newChars = [...product.characteristics];
    newChars.splice(index, 1);
    setProduct((prev) => ({...prev, characteristics: newChars}));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(product)
    try {
      const payload = {
        ...product,
        characteristics: Object.fromEntries(
          product.characteristics.map((c) => [c.key, c.value])
        ),
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
                type="text"
                name="name"
                label="Название"
                value={product.name}
                onChange={handleChange}
                className="mb-3"
                required
              />

              <CFormInput
                type="text"
                name="brand"
                label="Бренд"
                value={product.brand}
                onChange={handleChange}
                className="mb-3"
              />

              <CFormTextarea
                name="description"
                label="Описание"
                value={product.description}
                onChange={handleChange}
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

              <CFormSwitch
                label="Доставка доступна"
                name="deliveryAvailable"
                checked={product.deliveryAvailable}
                onChange={handleChange}
                className="mb-4"
              />

              <h6>Характеристики</h6>
              {product.characteristics.map((char, index) => (
                <CRow key={index} className="mb-2">
                  <CCol md={5}>
                    <CFormInput
                      placeholder="Название"
                      value={char.key}
                      onChange={(e) =>
                        handleCharacteristicChange(index, 'key', e.target.value)
                      }
                    />
                  </CCol>
                  <CCol md={5}>
                    <CFormInput
                      placeholder="Значение"
                      value={char.value}
                      onChange={(e) =>
                        handleCharacteristicChange(index, 'value', e.target.value)
                      }
                    />
                  </CCol>
                  <CCol md={2}>
                    <CButton
                      color="danger"
                      variant="outline"
                      onClick={() => removeCharacteristic(index)}
                    >
                      ✖
                    </CButton>
                  </CCol>
                </CRow>
              ))}

              <CButton color="secondary" className="mb-3" onClick={addCharacteristic}>
                + Добавить характеристику
              </CButton>

              <div>
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
