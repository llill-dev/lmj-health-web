import { doctorApi } from '@/lib/doctor/client';
import type {
  EncounterOrder,
  EncounterOrdersListResponse,
} from '@/lib/doctor/encounters/encounterClinicalTypes';
import {
  buildEncounterOrderCreateBody,
  buildEncounterOrderCreateCandidates,
  buildStandaloneOrderCreateCandidates,
  isEncounterOrderCreateValidationError,
  resolveEncounterOrderIdFromCreateResponse,
} from '@/lib/doctor/encounters/encounterOrderBodies';
import {
  filterEncounterOrdersByCategory,
  isDraftEncounterOrder,
  sortEncounterOrdersByRecent,
  type EncounterOrderCategoryKey,
} from '@/lib/doctor/encounters/encounterOrderCategories';
import type {
  CreateEncounterOrderBody,
  EncounterOrderResponse,
  OrderCatalogListResponse,
} from '@/lib/doctor/encounters/encounterOrderTypes';

export {
  filterEncounterOrdersByCategory,
  normalizeEncounterOrderCategory,
  resolveEncounterOrderStatusLabel,
  resolveEncounterOrderTitle,
} from '@/lib/doctor/encounters/encounterOrderCategories';

function normalizeEncounterOrderId(
  order: EncounterOrder & { id?: string; orderId?: string },
): string | undefined {
  return order._id?.trim() || order.id?.trim() || order.orderId?.trim();
}

function normalizeEncounterOrder(
  raw: EncounterOrder & { id?: string; orderId?: string },
): EncounterOrder | null {
  const id = normalizeEncounterOrderId(raw);
  if (!id) return null;
  return { ...raw, _id: id };
}

function extractEncounterOrdersRows(
  list: EncounterOrdersListResponse & {
    data?: { orders?: EncounterOrder[] } | EncounterOrder[];
    encounterOrders?: EncounterOrder[];
  },
): EncounterOrder[] {
  if (Array.isArray(list.orders)) return list.orders;
  if (Array.isArray(list.encounterOrders)) return list.encounterOrders;
  const data = list.data;
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && Array.isArray(data.orders)) {
    return data.orders;
  }
  const results = list.results;
  if (Array.isArray(results)) return results as EncounterOrder[];
  return [];
}

export function normalizeEncounterOrdersList(
  list: EncounterOrdersListResponse | null | undefined,
): EncounterOrder[] {
  if (!list) return [];
  const rows = extractEncounterOrdersRows(list);
  return rows
    .map((row) => normalizeEncounterOrder(row))
    .filter((order): order is EncounterOrder => Boolean(order));
}

async function fetchOrderDetail(
  doctorId: string,
  patientId: string,
  encounterId: string,
  orderId: string,
) {
  const response = await doctorApi.patients.getEncounterOrder(
    doctorId,
    patientId,
    encounterId,
    orderId,
  );
  const order = response.order;
  if (!order) throw new Error('missing_order');
  return normalizeEncounterOrder(order) ?? order;
}

async function listEncounterOrders(
  doctorId: string,
  patientId: string,
  encounterId: string,
) {
  const list = await doctorApi.patients.listEncounterOrders(
    doctorId,
    patientId,
    encounterId,
    { limit: 100, page: 1 },
  );
  return normalizeEncounterOrdersList(list);
}

async function resolveEncounterPatientId(
  doctorId: string,
  routePatientId: string,
  encounterId: string,
): Promise<string> {
  const routeId = routePatientId.trim();
  try {
    const response = await doctorApi.patients.getEncounter(
      doctorId,
      routeId,
      encounterId,
    );
    const embedded = response.encounter?.patient?._id?.trim();
    return embedded || routeId;
  } catch {
    return routeId;
  }
}

function normalizeCatalogListItems(
  data: OrderCatalogListResponse | undefined,
  category: EncounterOrderCategoryKey,
) {
  if (!data) return [];
  const nested = data.data;
  if (data.items?.length) return data.items;
  if (nested?.items?.length) return nested.items;
  if (category === 'lab') {
    return data.labTests ?? nested?.labTests ?? [];
  }
  if (category === 'radiology') {
    return data.imaging ?? nested?.imaging ?? [];
  }
  return data.procedures ?? nested?.procedures ?? [];
}

function pickFirstCatalogItemId(
  data: OrderCatalogListResponse | undefined,
  category: EncounterOrderCategoryKey,
): string | undefined {
  const items = normalizeCatalogListItems(data, category);
  const id = items[0]?._id?.trim();
  if (!id || id.length < 12) return undefined;
  return id;
}

async function fetchFirstCatalogItemId(
  category: EncounterOrderCategoryKey,
): Promise<string | undefined> {
  try {
    if (category === 'lab') {
      return pickFirstCatalogItemId(
        await doctorApi.patients.listLabCatalog({ limit: 1, page: 1 }),
        category,
      );
    }
    if (category === 'radiology') {
      return pickFirstCatalogItemId(
        await doctorApi.patients.listImagingCatalog({ limit: 1, page: 1 }),
        category,
      );
    }
    if (category === 'procedure') {
      return pickFirstCatalogItemId(
        await doctorApi.patients.listProcedureCatalog({ limit: 1, page: 1 }),
        category,
      );
    }
  } catch {
    return undefined;
  }
  return undefined;
}

async function createStandaloneTypedOrder(
  category: EncounterOrderCategoryKey,
  body: CreateEncounterOrderBody,
): Promise<EncounterOrderResponse> {
  switch (category) {
    case 'lab':
      return doctorApi.orders.createLab(body);
    case 'radiology':
      return doctorApi.orders.createImaging(body);
    case 'procedure':
      return doctorApi.orders.createProcedure(body);
    case 'referral':
      return doctorApi.orders.createCompat({
        ...body,
        type: 'referral',
        orderType: 'REFERRAL_ORDER',
      });
    default:
      throw new Error('unsupported_category');
  }
}

async function createEncounterOrderByCategory(
  doctorId: string,
  patientId: string,
  encounterId: string,
  category: EncounterOrderCategoryKey,
  body: CreateEncounterOrderBody,
) {
  switch (category) {
    case 'lab':
      return doctorApi.patients.createEncounterLabOrder(
        doctorId,
        patientId,
        encounterId,
        body,
      );
    case 'radiology':
      return doctorApi.patients.createEncounterImagingOrder(
        doctorId,
        patientId,
        encounterId,
        body,
      );
    case 'procedure':
      return doctorApi.patients.createEncounterProcedureOrder(
        doctorId,
        patientId,
        encounterId,
        body,
      );
    case 'referral':
      return doctorApi.patients.createEncounterReferralOrder(
        doctorId,
        patientId,
        encounterId,
        body,
      );
    default:
      throw new Error('unsupported_category');
  }
}

async function createEncounterOrderWithFallback(
  doctorId: string,
  patientId: string,
  encounterId: string,
  category: EncounterOrderCategoryKey,
  createBody?: CreateEncounterOrderBody,
) {
  const catalogItemId =
    category === 'referral'
      ? undefined
      : await fetchFirstCatalogItemId(category);

  const candidates = createBody
    ? [createBody]
    : buildEncounterOrderCreateCandidates(
        category,
        patientId,
        encounterId,
        catalogItemId,
      );

  let lastError: unknown;
  for (const payload of candidates) {
    try {
      return await createEncounterOrderByCategory(
        doctorId,
        patientId,
        encounterId,
        category,
        payload,
      );
    } catch (error) {
      lastError = error;
      if (!isEncounterOrderCreateValidationError(error)) throw error;
    }
  }

  const standaloneCandidates =
    category === 'referral'
      ? candidates
      : buildStandaloneOrderCreateCandidates(
          category,
          patientId,
          catalogItemId,
        );

  for (const payload of standaloneCandidates) {
    try {
      return await createStandaloneTypedOrder(category, payload);
    } catch (error) {
      lastError = error;
      if (!isEncounterOrderCreateValidationError(error)) throw error;
    }
  }

  throw lastError;
}

/** يحمّل مسودة للتحرير، أو آخر طلب، أو ينشئ مسودة جديدة للزيارة. */
export async function loadEncounterOrderForWorkspace(
  doctorId: string,
  patientId: string,
  encounterId: string,
  category: EncounterOrderCategoryKey,
  createBody?: CreateEncounterOrderBody,
): Promise<EncounterOrder> {
  const resolvedPatientId = await resolveEncounterPatientId(
    doctorId,
    patientId,
    encounterId,
  );

  const resolveFromList = async () => {
    const all = await listEncounterOrders(
      doctorId,
      resolvedPatientId,
      encounterId,
    );
    const scoped = filterEncounterOrdersByCategory(all, category);
    const draft = scoped.find(isDraftEncounterOrder);
    if (draft?._id) {
      return fetchOrderDetail(
        doctorId,
        resolvedPatientId,
        encounterId,
        draft._id,
      );
    }
    const latest = sortEncounterOrdersByRecent(scoped)[0];
    if (latest?._id) {
      return fetchOrderDetail(
        doctorId,
        resolvedPatientId,
        encounterId,
        latest._id,
      );
    }
    return null;
  };

  const existing = await resolveFromList();
  if (existing) return existing;

  try {
    const created = await createEncounterOrderWithFallback(
      doctorId,
      resolvedPatientId,
      encounterId,
      category,
      createBody,
    );
    const orderId = resolveEncounterOrderIdFromCreateResponse(created);
    return fetchOrderDetail(
      doctorId,
      resolvedPatientId,
      encounterId,
      orderId,
    );
  } catch (error) {
    const raced = await resolveFromList();
    if (raced) return raced;
    throw error;
  }
}

export async function loadEncounterImagingOrderForWorkspace(
  doctorId: string,
  patientId: string,
  encounterId: string,
) {
  return loadEncounterOrderForWorkspace(
    doctorId,
    patientId,
    encounterId,
    'radiology',
  );
}

export async function loadEncounterLabOrderForWorkspace(
  doctorId: string,
  patientId: string,
  encounterId: string,
) {
  return loadEncounterOrderForWorkspace(doctorId, patientId, encounterId, 'lab');
}

export async function loadEncounterProcedureOrderForWorkspace(
  doctorId: string,
  patientId: string,
  encounterId: string,
) {
  return loadEncounterOrderForWorkspace(
    doctorId,
    patientId,
    encounterId,
    'procedure',
  );
}

export async function loadEncounterOrderForPreview(
  doctorId: string,
  patientId: string,
  encounterId: string,
  category: EncounterOrderCategoryKey,
) {
  const all = await listEncounterOrders(doctorId, patientId, encounterId);
  const scoped = filterEncounterOrdersByCategory(all, category);
  const draft = scoped.find(isDraftEncounterOrder);
  const target = draft ?? sortEncounterOrdersByRecent(scoped)[0];
  if (!target?._id) return null;
  return fetchOrderDetail(doctorId, patientId, encounterId, target._id);
}

export async function loadEncounterReferralOrderForWorkspace(
  doctorId: string,
  patientId: string,
  encounterId: string,
  createBody?: CreateEncounterOrderBody,
) {
  return loadEncounterOrderForWorkspace(
    doctorId,
    patientId,
    encounterId,
    'referral',
    createBody ??
      buildEncounterOrderCreateBody(
        'referral',
        patientId,
        encounterId,
      ),
  );
}
