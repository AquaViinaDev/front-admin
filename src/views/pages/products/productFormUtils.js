import { CHARACTERISTICS_BY_TYPE } from './types';

export const createEmptyCharacteristics = () => ({
  ru: Object.fromEntries(CHARACTERISTICS_BY_TYPE.ru.map((charKey) => [charKey, ''])),
  ro: Object.fromEntries(CHARACTERISTICS_BY_TYPE.ro.map((charKey) => [charKey, ''])),
});

const trimText = (value) => {
  if (typeof value !== 'string') {
    return value === null || value === undefined ? '' : String(value).trim();
  }
  return value.trim();
};

export const parseMaybeObject = (value, fallback) => {
  if (value === null || value === undefined) {
    return fallback;
  }
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  if (typeof value === 'object') {
    return value;
  }
  return fallback;
};

export const normalizeCharacteristics = (source) => {
  const base = createEmptyCharacteristics();
  const parsed = parseMaybeObject(source, null);

  if (!parsed) {
    return base;
  }

  const normalizeLang = (lang) =>
    Object.fromEntries(
      Object.entries({
        ...base[lang],
        ...(parsed[lang] || {}),
      }).map(([key, value]) => [key, value ?? '']),
    );

  return {
    ru: normalizeLang('ru'),
    ro: normalizeLang('ro'),
  };
};

const normalizeMultilangField = (value, fallback) => {
  const parsed = parseMaybeObject(value, fallback) ?? fallback;
  return {
    ru: parsed?.ru ?? fallback.ru,
    ro: parsed?.ro ?? fallback.ro,
  };
};

const normalizeBoolean = (value, fallback = true) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lowered = value.trim().toLowerCase();
    if (lowered === 'true') return true;
    if (lowered === 'false') return false;
  }
  if (typeof value === 'number') {
    return value !== 0;
  }
  return fallback;
};

const stringifyNumber = (value) => {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
};

const formatNumericField = (value) => {
  if (value === null || value === undefined || String(value).trim() === '') {
    return '0';
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric.toString() : '0';
};

const formatOptionalNumericField = (value) => {
  if (value === null || value === undefined) {
    return null;
  }
  const trimmed = String(value).trim();
  if (!trimmed) {
    return null;
  }
  const numeric = Number(trimmed);
  return Number.isFinite(numeric) ? numeric.toString() : null;
};

export const sanitizeCategorieIds = (value) => {
  const parsed = parseMaybeObject(value, value);
  if (!Array.isArray(parsed)) {
    return [];
  }
  return parsed
    .map((id) => Number(id))
    .filter((id) => Number.isFinite(id));
};

export const sanitizeImageList = (value) => {
  const parsed = parseMaybeObject(value, value);
  if (!Array.isArray(parsed)) {
    return [];
  }
  return parsed
    .map((item) => (typeof item === 'string' ? item.trim() : null))
    .filter((item) => !!item);
};

export const buildInitialProductState = (seed) => {
  const empty = {
    name: { ru: '', ro: '' },
    brand: { ru: '', ro: '' },
    description: { ru: '', ro: '' },
    images: [],
    price: '',
    oldPrice: '',
    inStock: true,
    type: { ru: '', ro: '' },
    characteristics: createEmptyCharacteristics(),
    categorieIds: [],
  };

  if (!seed) {
    return empty;
  }

  const name = normalizeMultilangField(seed.name, empty.name);
  const brand = normalizeMultilangField(seed.brand, empty.brand);
  const description = normalizeMultilangField(seed.description, empty.description);
  const type = normalizeMultilangField(seed.type, empty.type);
  const categorieIds = sanitizeCategorieIds(seed.categorieIds);

  const price =
    seed.price !== undefined && seed.price !== null ? stringifyNumber(seed.price) : '';
  const oldPrice =
    seed.oldPrice !== undefined && seed.oldPrice !== null ? stringifyNumber(seed.oldPrice) : '';
  const inStock = normalizeBoolean(seed.inStock, true);

  return {
    ...empty,
    name,
    brand,
    description,
    price,
    oldPrice,
    inStock,
    type,
    characteristics: normalizeCharacteristics(seed.characteristics),
    categorieIds,
  };
};

const trimMultilangField = (field) => ({
  ru: trimText(field?.ru ?? ''),
  ro: trimText(field?.ro ?? ''),
});

const trimCharacteristicsField = (characteristics) => {
  const safe = characteristics ?? {};
  return {
    ru: Object.fromEntries(
      Object.entries(safe.ru ?? {}).map(([key, value]) => [key, trimText(value ?? '')]),
    ),
    ro: Object.fromEntries(
      Object.entries(safe.ro ?? {}).map(([key, value]) => [key, trimText(value ?? '')]),
    ),
  };
};

export const sanitizeProductTextFields = (product) => ({
  ...product,
  name: trimMultilangField(product.name),
  brand: trimMultilangField(product.brand),
  description: trimMultilangField(product.description),
  type: trimMultilangField(product.type),
  characteristics: trimCharacteristicsField(product.characteristics),
});

export const buildProductFormData = (
  product,
  { existingImages, imagesToKeep, newImages = [] } = {},
) => {
  const sanitizedProduct = sanitizeProductTextFields(product);
  const formData = new FormData();

  formData.append('name', JSON.stringify(sanitizedProduct.name));
  formData.append('brand', JSON.stringify(sanitizedProduct.brand));
  formData.append('description', JSON.stringify(sanitizedProduct.description));
  formData.append('type', JSON.stringify(sanitizedProduct.type));
  formData.append('characteristics', JSON.stringify(sanitizedProduct.characteristics));

  formData.append('categorieIds', JSON.stringify(sanitizeCategorieIds(sanitizedProduct.categorieIds)));
  formData.append('price', formatNumericField(sanitizedProduct.price));

  const normalizedOldPrice = formatOptionalNumericField(sanitizedProduct.oldPrice);
  if (normalizedOldPrice !== null) {
    formData.append('oldPrice', normalizedOldPrice);
  }

  formData.append('inStock', sanitizedProduct.inStock ? 'true' : 'false');

  if (Array.isArray(existingImages) && existingImages.length) {
    formData.append('existingImages', JSON.stringify(existingImages));
  }

  if (Array.isArray(imagesToKeep)) {
    formData.append('images', JSON.stringify(imagesToKeep));
  }

  newImages
    .filter(Boolean)
    .forEach((file) => {
      formData.append('images', file);
    });

  return formData;
};
