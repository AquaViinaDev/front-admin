import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  CSpinner,
} from "@coreui/react";
import { getProductById, updateProduct } from "src/api/productApi";
import { toast } from "react-toastify";
import { CHARACTERISTICS_BY_TYPE } from "./types";
import { API_ORIGIN } from "src/config/api";
import {
  buildInitialProductState,
  buildProductFormData,
  sanitizeImageList,
} from "./productFormUtils";

const resolveImageUrl = (path) => {
  if (!path || typeof path !== "string") return null;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  if (path.startsWith("/")) {
    return `${API_ORIGIN}${path}`;
  }
  return `${API_ORIGIN}/${path}`;
};

const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(() => buildInitialProductState(null));
  const [imagesToKeep, setImagesToKeep] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const data = await getProductById(id);
        if (!isMounted) {
          return;
        }

        setProduct(buildInitialProductState(data));
        setImagesToKeep(sanitizeImageList(data?.images));
        setNewImages([]);
      } catch (error) {
        if (isMounted) {
          toast.error("Не удалось загрузить товар");
          console.error(error);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

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

  const handleFileChange = (e) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setNewImages(files);
  };

  const handleRemoveImage = (index) => {
    setImagesToKeep((prev) => {
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = buildProductFormData(product, {
        imagesToKeep,
        newImages,
      });
      await updateProduct(id, formData, true);
      toast.success("Товар успешно обновлён!");
      navigate("/products");
    } catch (err) {
      console.error(err);
      toast.error("Ошибка при обновлении товара!");
    }
  };

  if (isLoading) {
    return (
      <CRow>
        <CCol xs={12}>
          <CCard>
            <CCardBody className="d-flex flex-column align-items-center py-5">
              <CSpinner color="primary" />
              <p className="mt-3 mb-0 text-medium">Загружаем данные товара...</p>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    );
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard>
          <CCardBody>
            <h4 className="mb-4">Редактирование товара</h4>
            <CForm onSubmit={handleSubmit}>
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

              <CFormCheck
                type="checkbox"
                name="inStock"
                label="В наличии"
                checked={product.inStock}
                onChange={handleChange}
                className="mb-3"
              />

              <CFormInput
                label="Новые изображения"
                type="file"
                multiple
                onChange={handleFileChange}
                className="mb-3"
              />

              {imagesToKeep.length > 0 && (
                <div className="mb-3">
                  <p className="mb-2">Текущие изображения товара:</p>
                  <div className="d-flex flex-wrap gap-3">
                    {imagesToKeep.map((imagePath, index) => {
                      const previewUrl = resolveImageUrl(imagePath);
                      return (
                        <div
                          key={`${imagePath}-${index}`}
                          className="position-relative"
                          style={{ maxWidth: "160px" }}
                        >
                          {previewUrl ? (
                            <img
                              src={previewUrl}
                              alt={`Изображение ${index + 1}`}
                              style={{
                                width: "100%",
                                borderRadius: "8px",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <div className="bg-light border rounded d-flex align-items-center justify-content-center">
                              <span className="text-muted px-3 py-4 small">Не удалось загрузить</span>
                            </div>
                          )}
                          <CButton
                            color="danger"
                            size="sm"
                            className="position-absolute top-0 end-0 translate-middle badge rounded-pill"
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            title="Убрать изображение"
                          >
                            ✕
                          </CButton>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <h5 className="mt-4 mb-2">Характеристики</h5>
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
      </CCol>
    </CRow>
  );
};

export default ProductEdit;
