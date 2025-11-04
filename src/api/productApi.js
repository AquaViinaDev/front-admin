import { API_BASE_URL } from 'src/config/api'

export const getProducts = async () => {
  const PAGE_SIZE = 100;

  const fetchPage = async (page) => {
    const url = new URL(`${API_BASE_URL}/products`);
    url.searchParams.set('limit', String(PAGE_SIZE));
    url.searchParams.set('page', String(page));

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Ошибка: ${response.status}`);
    }

    return response.json();
  };

  try {
    const aggregatedItems = [];
    let firstResponse = null;
    let total = null;
    let totalPages = null;
    let effectiveLimit = PAGE_SIZE;
    let currentPage = 1;

    while (true) {
      const pageData = await fetchPage(currentPage);

      if (!firstResponse) {
        firstResponse = pageData;
      }

      const items = Array.isArray(pageData.items) ? pageData.items : [];
      aggregatedItems.push(...items);

      if (typeof pageData.total === 'number') {
        total = pageData.total;
      }

      if (typeof pageData.totalPages === 'number') {
        totalPages = pageData.totalPages;
      }

      const currentLimit =
        typeof pageData.limit === 'number' ? pageData.limit : effectiveLimit;
      effectiveLimit = currentLimit;

      const nextPage = currentPage + 1;
      const hasMoreByTotalPages =
        typeof pageData.totalPages === 'number'
          ? nextPage <= pageData.totalPages
          : false;
      const hasMoreByCount = items.length > 0 && items.length === currentLimit;

      if (!hasMoreByTotalPages && !hasMoreByCount) {
        break;
      }

      currentPage = nextPage;

      if (currentPage > 1000) {
        console.warn('Превышено безопасное количество страниц при загрузке товаров');
        break;
      }
    }

    const effectiveTotal = typeof total === 'number' ? total : aggregatedItems.length;
    const inferredTotalPages =
      effectiveLimit > 0
        ? Math.ceil(effectiveTotal / effectiveLimit)
        : 1;
    const effectiveTotalPages =
      typeof totalPages === 'number' ? totalPages : inferredTotalPages;

    return {
      ...(firstResponse ?? {}),
      items: aggregatedItems,
      total: effectiveTotal,
      limit: effectiveLimit,
      totalPages: effectiveTotalPages,
      page: 1,
    };
  } catch (error) {
    console.error('Ошибка при получении товаров:', error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Ошибка при удалении: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Ошибка при удалении товара:', error);
    throw error;
  }
};

export const createProduct = async (formData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      body: formData,
    });
    console.log(response)

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Ошибка при создании товара: ${errText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка:', error);
    throw error;
  }
};

export const getProductById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/products/${id}`)
  if (!response.ok) {
    throw new Error('Ошибка при получении товара')
  }
  return await response.json()
}

export const updateProduct = async (id, data, isFormData = false) => {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'PUT',
    body: isFormData ? data : JSON.stringify(data),
    headers: isFormData ? {} : { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Ошибка при обновлении товара')
  }

  return await response.json();
};
