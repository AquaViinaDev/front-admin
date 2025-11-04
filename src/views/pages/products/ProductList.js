import React, {useEffect, useState} from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CCollapse,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
  CSpinner,
} from '@coreui/react'
import {useNavigate} from 'react-router-dom'
import {deleteProduct, getProducts} from 'src/api/productApi'
import {toast} from "react-toastify"

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getProducts();
        setProducts(data?.items);
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const openDeleteModal = (id) => {
    setDeleteId(id);
    setConfirmModalVisible(true);
  };

  const handleDelete = async () => {
    try {
      await deleteProduct(deleteId);
      setProducts((prev) => prev.filter((p) => p.id !== deleteId));
      toast.success('Товар успешно удалён');
    } catch (err) {
      console.error('Ошибка при удалении:', err);
    } finally {
      setConfirmModalVisible(false);
      setDeleteId(null);
    }
  };


  const toggleCollapse = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleAddProduct = () => {
    navigate('/products/add');
  };

  return (
    <>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <strong>Товары</strong>
              <CButton color="primary" onClick={handleAddProduct}>
                + Добавить товар
              </CButton>
            </CCardHeader>
            <CCardBody>
              {loading ? (
                <CSpinner color="primary" />
              ) : (
                products?.map((product, index) => (
                  <CCard key={product.id} className="mb-3">
                    <CCardHeader
                      className="d-flex justify-content-between align-items-center"
                      style={{cursor: 'pointer'}}
                      onClick={() => toggleCollapse(index)}
                    >
                      <div style={{fontWeight: '300'}}>
                        {product.name.ru} — {product.price} лей
                      </div>
                      <div>
                        <CButton
                          size="sm"
                          color="secondary"
                          className="me-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate("/products/add", { state: { copiedProductId: product.id } });
                          }}
                        >
                          📋
                        </CButton>
                        <CButton
                          size="sm"
                          color="info"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/products/${product.id}/edit`);
                          }}
                          className="me-2"
                        >
                          ✏️
                        </CButton>
                        <CButton
                          size="sm"
                          color="danger"
                          onClick={(e) => {
                            e.stopPropagation()
                            setConfirmModalVisible(true)
                            openDeleteModal(product.id);
                          }}
                        >
                          🗑️
                        </CButton>
                      </div>
                    </CCardHeader>
                    <CCollapse visible={openIndex === index}>
                      <CCardBody>
                        {product.image && (
                          <div className="mb-3">
                            <img
                              src={product.image}
                              alt={product.name.ru}
                              style={{ maxWidth: '200px', borderRadius: '8px' }}
                            />
                          </div>
                        )}
                        <p><strong>Тип:</strong> {product.type.ru}</p>
                        <p><strong>Название:</strong> {product.name.ru}</p>
                        {product.brand.ru && <p><strong>Бренд:</strong> {product.brand.ru}</p>}
                        <p><strong>Цена:</strong> {product.price} лей</p>
                        <p><strong>Наличие на складе:</strong> {product.inStock ? "есть" : "нет"}</p>
                        <p><strong>Описание:</strong> {product.description.ru || '—'}</p>

                        {product.characteristics && (
                          <>
                            <hr/>
                            <h6 className="mb-2"><strong>Характеристики:</strong></h6>
                            <ul>
                              {Object.entries(product.characteristics.ru)
                                .filter(([key, value]) => value !== null)
                                .map(([key, value]) => (
                                  <li key={key}>
                                    <strong>{key}:</strong> {value}
                                  </li>
                                ))
                              }
                            </ul>
                          </>
                        )}
                      </CCardBody>
                    </CCollapse>
                  </CCard>
                ))
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
      <CModal visible={confirmModalVisible} onClose={() => setConfirmModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>Подтвердите удаление</CModalTitle>
        </CModalHeader>
        <CModalBody>Вы уверены, что хотите удалить товар?</CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setConfirmModalVisible(false)}>
            Отмена
          </CButton>
          <CButton color="danger" onClick={handleDelete}>
            Удалить
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  );
};

export default ProductList;
