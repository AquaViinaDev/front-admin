import React, { useState } from "react";
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormTextarea,
  CRow,
  CFormCheck,
} from "@coreui/react";
import { useNavigate } from "react-router-dom";
import { createProduct } from "src/api/productApi";
import { toast } from "react-toastify";
import { CHARACTERISTICS_BY_TYPE } from "./types";

const ProductAdd = () => {
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    name: { ru: "", ro: "" },
    brand: { ru: "", ro: "" },
    description: { ru: "", ro: "" },
    images: [],
    price: "",
    oldPrice: "",
    inStock: true,
    type: { ru: "", ro: "" },
    characteristics: {
      ru: Object.fromEntries(CHARACTERISTICS_BY_TYPE.ru.map((char) => [char, ""])),
      ro: Object.fromEntries(CHARACTERISTICS_BY_TYPE.ro.map((char) => [char, ""])),
    },
    categorieIds: [],
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();

      // строки
      formData.append("name", JSON.stringify(product.name));
      formData.append("brand", JSON.stringify(product.brand));
      formData.append("description", JSON.stringify(product.description));
      formData.append("type", JSON.stringify(product.type));

      // массивы/объекты
      formData.append("characteristics", JSON.stringify(product.characteristics));
      formData.append("categorieIds", JSON.stringify(product.categorieIds));

      // числа/булевые
      formData.append("price", String(product.price));
      if (product.oldPrice) formData.append("oldPrice", String(product.oldPrice));
      formData.append("inStock", String(product.inStock));

      // картинки
      product.images.forEach((file) => {
        formData.append("images", file);
      });

      await createProduct(formData);
      toast.success("Товар успешно добавлен!");
      navigate("/products");
    } catch (err) {
      console.error("Ошибка при добавлении товара:", err);
      toast.error("Ошибка при добавлении");
    }
  };

  const handleFileChange = (e) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setProduct((prev) => ({
      ...prev,
      images: files,
    }));
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
              {/* Название */}
              <CFormInput
                label="Название (ru)"
                value={product.name.ru}
                onChange={(e) => handleLangChange("name", "ru", e.target.value)}
                className="mb-3"
                required
              />
              <CFormInput
                label="Название (ro)"
                value={product.name.ro}
                onChange={(e) => handleLangChange("name", "ro", e.target.value)}
                className="mb-3"
              />

              {/* Бренд */}
              <CFormInput
                label="Бренд (ru)"
                value={product.brand.ru}
                onChange={(e) => handleLangChange("brand", "ru", e.target.value)}
                className="mb-3"
              />
              <CFormInput
                label="Бренд (ro)"
                value={product.brand.ro}
                onChange={(e) => handleLangChange("brand", "ro", e.target.value)}
                className="mb-3"
              />

              {/* Описание */}
              <CFormTextarea
                label="Описание (ru)"
                value={product.description.ru}
                onChange={(e) => handleLangChange("description", "ru", e.target.value)}
                className="mb-3"
              />
              <CFormTextarea
                label="Описание (ro)"
                value={product.description.ro}
                onChange={(e) => handleLangChange("description", "ro", e.target.value)}
                className="mb-3"
              />

              {/* Картинки */}
              <CFormInput
                type="file"
                multiple
                name="image"
                label="Изображения"
                onChange={handleFileChange}
                className="mb-3"
              />

              {/* Цены */}
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
                name="oldPrice"
                label="Старая цена"
                value={product.oldPrice}
                onChange={handleChange}
                className="mb-3"
              />

              {/* Наличие */}
              <CFormCheck
                type="checkbox"
                name="inStock"
                label="В наличии"
                checked={product.inStock}
                onChange={handleChange}
                className="mb-3"
              />

              {/* Тип товара */}
              <CFormInput
                label="Тип (ru)"
                value={product.type.ru}
                onChange={(e) => handleLangChange("type", "ru", e.target.value)}
                className="mb-3"
              />
              <CFormInput
                label="Тип (ro)"
                value={product.type.ro}
                onChange={(e) => handleLangChange("type", "ro", e.target.value)}
                className="mb-3"
              />

              {/* Характеристики */}
              <h6 className="mt-4">Характеристики</h6>
              {CHARACTERISTICS_BY_TYPE.ru.map((ruKey, index) => {
                const roKey = CHARACTERISTICS_BY_TYPE.ro[index];
                return (
                  <CRow key={index} className="mb-2">
                    <CCol md={6}>
                      <CFormInput
                        label={`${ruKey} (ru)`}
                        value={product.characteristics.ru[ruKey] ?? ""}
                        onChange={(e) => handleCharacteristicChange("ru", ruKey, e.target.value)}
                      />
                    </CCol>
                    <CCol md={6}>
                      <CFormInput
                        label={`${roKey} (ro)`}
                        value={product.characteristics.ro[roKey] ?? ""}
                        onChange={(e) => handleCharacteristicChange("ro", roKey, e.target.value)}
                      />
                    </CCol>
                  </CRow>
                );
              })}

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
