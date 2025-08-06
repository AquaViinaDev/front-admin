import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  CButton,
  CForm,
  CFormInput,
  CFormTextarea,
  CFormCheck,
  CCard,
  CCardBody,
  CRow,
  CCol,
} from '@coreui/react'
import { getProductById, updateProduct } from 'src/api/productApi'
import {toast} from "react-toastify";

const ProductEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [product, setProduct] = useState(null)
  const [characteristics, setCharacteristics] = useState({})

  useEffect(() => {
    const fetchProduct = async () => {
      const data = await getProductById(id)
      setProduct(data)
      setCharacteristics(data.characteristics || {})
    }

    fetchProduct()
  }, [id])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setProduct((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleCharacteristicChange = (key, value) => {
    setCharacteristics((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const addCharacteristic = () => {
    setCharacteristics((prev) => ({
      ...prev,
      [`Характеристика ${Object.keys(prev).length + 1}`]: '',
    }))
  }

  const removeCharacteristic = (keyToRemove) => {
    const updated = { ...characteristics }
    delete updated[keyToRemove]
    setCharacteristics(updated)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const updatedProduct = {
      ...product,
      characteristics,
    }

    try {
      await updateProduct(id, updatedProduct)
      toast.success('Товар успешно обновлён!');
      navigate('/products')
    } catch (err) {
      console.error(err)
      toast.error('Ошибка при обновлении товара!');
    }
  }

  if (!product) return <div>Загрузка...</div>

  return (
    <CCard>
      <CCardBody>
        <h4>Редактирование товара</h4>
        <CForm onSubmit={handleSubmit}>
          <CFormInput
            label="Название"
            name="name"
            value={product.name}
            onChange={handleInputChange}
            className="mb-3"
          />
          <CFormTextarea
            label="Описание"
            name="description"
            value={product.description}
            onChange={handleInputChange}
            className="mb-3"
          />
          <CFormInput
            label="Бренд"
            name="brand"
            value={product.brand || ''}
            onChange={handleInputChange}
            className="mb-3"
          />
          <CFormInput
            label="Изображение (URL или путь)"
            name="image"
            value={product.image}
            onChange={handleInputChange}
            className="mb-3"
          />
          <CFormInput
            label="Цена"
            name="price"
            value={product.price}
            onChange={handleInputChange}
            className="mb-3"
          />
          <CFormInput
            label="Количество на складе"
            name="stockQty"
            type="number"
            value={product.stockQty}
            onChange={handleInputChange}
            className="mb-3"
          />
          <CFormCheck
            label="В наличии"
            name="inStock"
            checked={product.inStock}
            onChange={handleInputChange}
            className="mb-3"
          />
          <CFormCheck
            label="Доставка доступна"
            name="deliveryAvailable"
            checked={product.deliveryAvailable}
            onChange={handleInputChange}
            className="mb-4"
          />

          <h5>Характеристики</h5>
          {Object.entries(characteristics).map(([key, value], index) => (
            <CRow className="mb-2" key={index}>
              <CCol>
                <CFormInput
                  value={key}
                  onChange={(e) => {
                    const newKey = e.target.value
                    const newChar = { ...characteristics }
                    const val = newChar[key]
                    delete newChar[key]
                    newChar[newKey] = val
                    setCharacteristics(newChar)
                  }}
                />
              </CCol>
              <CCol>
                <CFormInput
                  value={value}
                  onChange={(e) => handleCharacteristicChange(key, e.target.value)}
                />
              </CCol>
              <CCol xs="auto">
                <CButton size="sm" color="danger" onClick={() => removeCharacteristic(key)}>
                  🗑️
                </CButton>
              </CCol>
            </CRow>
          ))}

          <CButton color="secondary" onClick={addCharacteristic} className="mb-4">
            ➕ Добавить характеристику
          </CButton>

          <div>
            <CButton type="submit" color="primary">
              💾 Сохранить изменения
            </CButton>
            <CButton color="light" className="ms-2" onClick={() => navigate(-1)}>
              Отмена
            </CButton>
          </div>
        </CForm>
      </CCardBody>
    </CCard>
  )
}

export default ProductEdit
