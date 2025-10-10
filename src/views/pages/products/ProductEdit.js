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
import { toast } from 'react-toastify';
import { CHARACTERISTICS_BY_TYPE } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const ProductEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [product, setProduct] = useState(null)
  const [characteristics, setCharacteristics] = useState({})

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

  const handleValueChange = (key, value, lang) => {
    const updated = { ...characteristics }
    updated[lang] = {
      ...updated[lang],
      [key]: value,
    }
    setCharacteristics(updated)
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("name", JSON.stringify({
      ru: product.name_ru,
      ro: product.name_ro,
    }));
    formData.append("brand", JSON.stringify({
      ru: product.brand_ru,
      ro: product.brand_ro,
    }));
    formData.append("description", JSON.stringify({
      ru: product.description_ru,
      ro: product.description_ro,
    }));
    formData.append("type", JSON.stringify({
      ru: product.type_ru,
      ro: product.type_ro,
    }));
    formData.append("characteristics", JSON.stringify(characteristics));
    formData.append("price", product.price);
    formData.append("oldPrice", product.oldPrice);
    formData.append("inStock", product.inStock);
    formData.append("categorieIds", JSON.stringify(product.categorieIds || []));

    // старые изображения
    formData.append("images", JSON.stringify(product.images || []));

    // новые изображения (если выбрал)
    if (product.newImages?.length) {
      product.newImages.forEach((file) => {
        formData.append("images", file);
      });
    }

    try {
      await updateProduct(id, formData, true);
      toast.success("Товар успешно обновлён!");
      navigate("/products");
    } catch (err) {
      console.error(err);
      toast.error("Ошибка при обновлении товара!");
    }
  };

  if (!product) return <div>Загрузка...</div>

  return (
    <CCard>
      <CCardBody>
        <h4>Редактирование товара</h4>
        <CForm onSubmit={handleSubmit}>
          <CFormInput
            label="Тип (RU)"
            name="type_ru"
            value={product.type_ru}
            onChange={handleInputChange}
            className="mb-3"
          />
          <CFormInput
            label="Тип (RO)"
            name="type_ro"
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
            label="Изображения"
            type="file"
            name="images"
            onChange={(e) => {
              const files = Array.from(e.target.files)
              setProduct((prev) => ({
                ...prev,
                newImages: files,
              }))
            }}
            className="mb-3"
          />
          <div className="mt-3">
            {product?.images?.map((img, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center' }}>
                <img src={`${API_BASE_URL}${img}`} alt="preview" width={80} />
                <CButton
                  color="danger"
                  size="sm"
                  className="ms-2"
                  onClick={() => {
                    setProduct((prev) => ({
                      ...prev,
                      images: prev.images.filter((_, i) => i !== idx),
                    }));
                  }}
                >
                  ❌
                </CButton>
              </div>
            ))}
          </div>
          <CFormInput
            label="Цена"
            name="price"
            value={product.price}
            onChange={handleInputChange}
            className="mb-3"
          />
          <CFormInput
            type="number"
            name="oldPrice"
            label="Старая цена"
            value={product.oldPrice}
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
          <h5 className="mt-4">Характеристики</h5>
          {CHARACTERISTICS_BY_TYPE.ru.map((ruKey, index) => {
            const roKey = CHARACTERISTICS_BY_TYPE.ro[index];
            return (
              <CRow key={index} className="mb-2">
                <CCol md={6}>
                  <CFormInput
                    label={`${ruKey} (ru)`}
                    value={characteristics.ru?.[ruKey] ?? ""}
                    onChange={(e) => handleValueChange(ruKey, e.target.value, "ru")}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormInput
                    label={`${roKey} (ro)`}
                    value={characteristics.ro?.[roKey] ?? ""}
                    onChange={(e) => handleValueChange(roKey, e.target.value, "ro")}
                  />
                </CCol>
              </CRow>
            );
          })}

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
