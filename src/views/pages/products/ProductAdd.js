import React, { useEffect, useState } from "react";
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
  CSpinner,
} from "@coreui/react";
import { useLocation, useNavigate } from "react-router-dom";
import { createProduct, getProductById } from "src/api/productApi";
import { toast } from "react-toastify";
import { CHARACTERISTICS_BY_TYPE } from "./types";
import { API_BASE_URL } from "src/config/api";
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
    return `${API_BASE_URL}${path}`;
  }
  return `${API_BASE_URL}/${path}`;
};

const ProductAdd = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const copiedProductId = location.state?.copiedProductId;
  const isCopyMode = Boolean(copiedProductId);

  const [product, setProduct] = useState(() => buildInitialProductState(null));
  const [copiedSource, setCopiedSource] = useState(null);
  const [prefilledImages, setPrefilledImages] = useState([]);
  const [isLoadingCopy, setIsLoadingCopy] = useState(isCopyMode);

  useEffect(() => {
    let isMounted = true;

    const loadCopiedProduct = async () => {
      if (!isCopyMode || !copiedProductId) {
        if (isMounted) {
          setCopiedSource(null);
          setPrefilledImages([]);
          setProduct(buildInitialProductState(null));
          setIsLoadingCopy(false);
        }
        return;
      }

      setIsLoadingCopy(true);
      try {
        const data = await getProductById(copiedProductId);
        if (!isMounted) {
          return;
        }

        setCopiedSource(data);
        setProduct(buildInitialProductState(data));

        const existingImages = sanitizeImageList(data?.images);
        setPrefilledImages(existingImages);
      } catch (error) {
        if (isMounted) {
          setCopiedSource(null);
          setProduct(buildInitialProductState(null));
          setPrefilledImages([]);
          toast.error("Не удалось загрузить товар для копирования");
          console.error(error);
        }
      } finally {
        if (isMounted) {
          setIsLoadingCopy(false);
        }
      }
    };

    loadCopiedProduct();

    return () => {
      isMounted = false;
    };
  }, [copiedProductId, isCopyMode]);

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
    if (isCopyMode && isLoadingCopy) {
      toast.info("Подождите, копия товара ещё готовится");
      return;
    }
    try {
      const formData = buildProductFormData(product, {
        existingImages: prefilledImages,
        newImages: product.images,
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

  const handleRemovePrefilledImage = (index) => {
    setPrefilledImages((prev) => {
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
  };

  if (isCopyMode && isLoadingCopy) {
    return (
      <CRow>
        <CCol xs={12}>
          <CCard>
            <CCardBody className="d-flex flex-column align-items-center py-5">
              <CSpinner color="primary" />
              <p className="mt-3 mb-0 text-medium">Подготавливаем копию товара...</p>
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
          <CCardHeader>
            <strong>Добавление товара</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              {isCopyMode && (
                <p className="mb-3 text-success fw-semibold">
                  Создаётся копия товара “
                  {copiedSource?.name?.ru ||
                    copiedSource?.name?.ro ||
                    product.name.ru ||
                    product.name.ro ||
                    "Без названия"}
                  ”. Проверьте данные перед сохранением.
                </p>
              )}
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
              {prefilledImages.length > 0 && (
                <div className="mb-3">
                  <p className="mb-2">Эти изображения будут скопированы вместе с товаром:</p>
                  <div className="d-flex flex-wrap gap-3">
                    {prefilledImages.map((imagePath, index) => {
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
                              alt={`Скопированное изображение ${index + 1}`}
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
                            onClick={() => handleRemovePrefilledImage(index)}
                            title="Убрать изображение из копии"
                          >
                            ✕
                          </CButton>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

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
