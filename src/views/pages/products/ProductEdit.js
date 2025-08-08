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

  const langs = ['ro', 'ru']
  console.log(product)

  useEffect(() => {
    const fetchProduct = async () => {
      const data = await getProductById(id)

      setProduct({
        ...data,
        name_ru: data.name?.ru || '',
        name_ro: data.name?.ro || '',
        description_ru: data.description?.ru || '',
        description_ro: data.description?.ro || '',
        brand_ru: data.brand?.ru || '',
        brand_ro: data.brand?.ro || '',
        type_ru: data.type?.ru || '',
        type_ro: data.type?.ro || '',
      })

      setCharacteristics({
        ru: data.characteristics?.ru || {},
        ro: data.characteristics?.ro || {},
      })
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

  const handleKeyChange = (oldKey, newKey, lang) => {
    const updated = { ...characteristics }
    const entries = updated[lang] || {}

    const value = entries[oldKey]
    delete entries[oldKey]
    entries[newKey] = value

    updated[lang] = entries
    setCharacteristics(updated)
  }

  const handleValueChange = (key, value, lang) => {
    const updated = { ...characteristics }
    updated[lang] = {
      ...updated[lang],
      [key]: value,
    }
    setCharacteristics(updated)
  }

  const removeCharacteristic = (key) => {
    const updated = { ...characteristics }
    for (const lang of langs) {
      if (updated[lang]) {
        delete updated[lang][key]
      }
    }
    setCharacteristics(updated)
  }

  // const handleCharacteristicChange = (key, value) => {
  //   setCharacteristics((prev) => ({
  //     ...prev,
  //     [key]: value,
  //   }))
  // }

  // const addCharacteristic = () => {
  //   setCharacteristics((prev) => ({
  //     ...prev,
  //     [`Характеристика ${Object.keys(prev).length + 1}`]: '',
  //   }))
  // }

  // const removeCharacteristic = (keyToRemove) => {
  //   const updated = { ...characteristics }
  //   delete updated[keyToRemove]
  //   setCharacteristics(updated)
  // }

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

  const allKeys = new Set([
    ...Object.keys(characteristics?.ru || {}),
    ...Object.keys(characteristics?.ro || {}),
  ])

  if (!product) return <div>Загрузка...</div>

  return (
    <CCard>
      <CCardBody>
        <h4>Редактирование товара</h4>
        <CForm onSubmit={handleSubmit}>
          <CFormInput
            label="Тип (RU)"
            name="name_ru"
            value={product.type_ru}
            onChange={handleInputChange}
            className="mb-3"
          />
          <CFormInput
            label="Тип (RO)"
            name="name_ro"
            value={product.type_ro}
            onChange={handleInputChange}
            className="mb-3"
          />
          <CFormInput
            label="Название (RU)"
            name="name_ru"
            value={product.name_ru}
            onChange={handleInputChange}
            className="mb-3"
          />
          <CFormInput
            label="Название (RO)"
            name="name_ro"
            value={product.name_ro}
            onChange={handleInputChange}
            className="mb-3"
          />
          <CFormTextarea
            label="Описание (RU)"
            name="description_ru"
            value={product.description_ru}
            onChange={handleInputChange}
            className="mb-3"
          />
          <CFormTextarea
            label="Описание (RO)"
            name="description_ro"
            value={product.description_ro}
            onChange={handleInputChange}
            className="mb-3"
          />
          <CFormInput
            label="Бренд (RU)"
            name="brand_ru"
            value={product.brand_ru}
            onChange={handleInputChange}
            className="mb-3"
          />
          <CFormInput
            label="Бренд (RO)"
            name="brand_ro"
            value={product.brand_ro}
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
          <h5>Характеристики</h5>
          {[...allKeys].map((key, index) => (
            <div key={index} className="mb-3">
              <CRow className="mb-2">
                <CCol xs={12}>
                  <strong>Ключ характеристики:</strong>
                  <CFormInput
                    className="mt-1"
                    value={key}
                    readOnly={true}
                  />
                </CCol>
              </CRow>

              <CRow>
                {langs.map((lang) => (
                  <CCol md={6} key={lang}>
                    <label>
                      Значение ({lang.toUpperCase()}):
                      <CFormInput
                        className="mt-1"
                        value={characteristics?.[lang]?.[key] || ''}
                        onChange={(e) => handleValueChange(key, e.target.value, lang)}
                      />
                    </label>
                  </CCol>
                ))}
              </CRow>

              <hr />
            </div>
          ))}

          {/*<CButton color="secondary" onClick={addCharacteristic} className="mb-4">*/}
          {/*  ➕ Добавить характеристику*/}
          {/*</CButton>*/}

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
