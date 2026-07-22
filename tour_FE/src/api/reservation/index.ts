import {
  hash,
  getMinPrice,
  islandFilterColorName,
  MOCK_PRODUCTS,
  RESERVATION_ISLAND_FILTER,
  SPORT_DEFAULT_PRODUCT,
} from '@/api/reservation/mockData';import type {
  CreateReservationPayload,
  PayMethod,
  Product,
  Reservation,
  TimeSlot,
} from '@/types/reservation';

export { getMinPrice, RESERVATION_ISLAND_FILTER, SPORT_DEFAULT_PRODUCT, islandFilterColorName };

const STORAGE_KEY = 'hyland-reservations';
const SLOT_TIMES = ['09:00', '11:00', '14:00', '16:00'] as const;

function delay<T>(data: T, ms = 200): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), ms);
  });
}

type StoredReservation = CreateReservationPayload & {
  reservationId: string;
  productName: string;
  islandName: string;
  totalPrice: number;
  createdAt: string;
  payMethod?: PayMethod;
  status?: Reservation['status'];
};

function readStoredReservations(): StoredReservation[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StoredReservation[]) : [];
  } catch {
    return [];
  }
}

function writeStoredReservations(reservations: StoredReservation[]): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
}

function toPaidReservation(stored: StoredReservation): Reservation | null {
  if (stored.status !== 'paid' || !stored.payMethod) return null;
  return stored as Reservation;
}

function findProduct(id: string): Product | undefined {
  return MOCK_PRODUCTS.find((p) => p.id === id);
}

function computeTotal(product: Product, persons: { key: string; count: number }[]): number {
  return persons.reduce((sum, { key, count }) => {
    const pt = product.personTypes.find((p) => p.key === key);
    return sum + (pt ? pt.price * count : 0);
  }, 0);
}

function generateReservationId(date: string): string {
  const compact = date.replace(/-/g, '');
  const suffix = String(hash(`${compact}:${Date.now()}`) % 10000).padStart(4, '0');
  return `IQ-${compact}-${suffix}`;
}

export type GetProductsParams = {
  category?: Product['category'];
  islandId?: string;
  sort?: 'pop' | 'low' | 'high';
};

export async function getProducts(params: GetProductsParams = {}): Promise<Product[]> {
  let list = [...MOCK_PRODUCTS];

  if (params.category) {
    list = list.filter((p) => p.category === params.category);
  }
  if (params.islandId) {
    list = list.filter((p) => p.islandId === params.islandId);
  }

  switch (params.sort) {
    case 'low':
      list.sort((a, b) => getMinPrice(a) - getMinPrice(b));
      break;
    case 'high':
      list.sort((a, b) => getMinPrice(b) - getMinPrice(a));
      break;
    case 'pop':
    default:
      list.sort((a, b) => b.popularity - a.popularity);
      break;
  }

  return delay(list);
}

export async function getProduct(id: string): Promise<Product> {
  const product = findProduct(id);
  if (!product) {
    throw new Error(`상품을 찾을 수 없습니다: ${id}`);
  }
  return delay(product);
}

export async function getAvailability(productId: string, date: string): Promise<TimeSlot[]> {
  const product = findProduct(productId);
  if (!product?.availableDates?.includes(date)) {
    return delay([]);
  }

  const slots: TimeSlot[] = SLOT_TIMES.map((time) => ({
    time,
    left: hash(`${productId}${date}${time}`) % 7,
  }));

  return delay(slots);
}

export async function createReservation(
  payload: CreateReservationPayload,
): Promise<{ reservationId: string }> {
  const product = findProduct(payload.productId);
  if (!product) {
    throw new Error(`상품을 찾을 수 없습니다: ${payload.productId}`);
  }

  const reservationId = generateReservationId(payload.date);
  const totalPrice = computeTotal(product, payload.persons);
  const createdAt = new Date().toISOString();

  const draft: StoredReservation = {
    ...payload,
    reservationId,
    productName: product.name,
    islandName: product.islandName,
    totalPrice,
    createdAt,
  };

  const stored = readStoredReservations();
  stored.push(draft);
  writeStoredReservations(stored);

  return delay({ reservationId });
}

export async function payReservation(
  reservationId: string,
  payMethod: PayMethod,
): Promise<Reservation> {
  const stored = readStoredReservations();
  const index = stored.findIndex((r) => r.reservationId === reservationId);
  if (index === -1) {
    throw new Error(`예약을 찾을 수 없습니다: ${reservationId}`);
  }

  const updated: Reservation = {
    ...stored[index],
    payMethod,
    status: 'paid',
  };
  stored[index] = updated;
  writeStoredReservations(stored);

  return delay(updated);
}

export async function getMyReservations(): Promise<Reservation[]> {
  const stored = readStoredReservations();
  const paid = stored
    .map(toPaidReservation)
    .filter((r): r is Reservation => r !== null);
  return delay([...paid].reverse());
}

export async function getReservation(id: string): Promise<Reservation> {
  const stored = readStoredReservations();
  const reservation = stored.find((r) => r.reservationId === id);
  if (!reservation) {
    throw new Error(`예약을 찾을 수 없습니다: ${id}`);
  }
  const paid = toPaidReservation(reservation);
  if (!paid) {
    throw new Error(`결제가 완료되지 않은 예약입니다: ${id}`);
  }
  return delay(paid);
}
