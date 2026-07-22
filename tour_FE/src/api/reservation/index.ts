import {
  hash,
  getMinPrice,
  islandFilterColorName,
  MOCK_PRODUCTS,
  RESERVATION_ISLAND_FILTER,
  SPORT_DEFAULT_PRODUCT,
} from '@/api/reservation/mockData';
import { calcCancelFee } from '@/api/reservation/cancelRules';
import type {
  CreateReservationPayload,
  PayMethod,
  Product,
  Reservation,
  TimeSlot,
} from '@/types/reservation';

export { getMinPrice, RESERVATION_ISLAND_FILTER, SPORT_DEFAULT_PRODUCT, islandFilterColorName };
export { CANCEL_FEE_RULES, calcCancelFee, getDaysUntilUseDate } from '@/api/reservation/cancelRules';
export type { CancelFeeResult } from '@/api/reservation/cancelRules';

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
  cancelledAt?: string;
  refundAmount?: number;
  cancelFee?: number;
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

function toListedReservation(stored: StoredReservation): Reservation | null {
  if (!stored.payMethod) return null;
  if (stored.status !== 'paid' && stored.status !== 'cancelled') return null;
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

export async function cancelReservation(reservationId: string): Promise<Reservation> {
  const stored = readStoredReservations();
  const index = stored.findIndex((r) => r.reservationId === reservationId);
  if (index === -1) {
    throw new Error(`예약을 찾을 수 없습니다: ${reservationId}`);
  }

  const current = stored[index];
  if (current.status === 'cancelled') {
    throw new Error('이미 취소된 예약입니다.');
  }
  if (current.status !== 'paid' || !current.payMethod) {
    throw new Error('결제 완료된 예약만 취소할 수 있습니다.');
  }

  const fee = calcCancelFee(current.date, current.totalPrice);
  if (!fee.cancelable) {
    throw new Error(fee.reason);
  }

  const updated: Reservation = {
    ...current,
    payMethod: current.payMethod,
    status: 'cancelled',
    cancelledAt: new Date().toISOString(),
    cancelFee: fee.feeAmount,
    refundAmount: fee.refundAmount,
  };
  stored[index] = updated;
  writeStoredReservations(stored);

  return delay(updated);
}

export async function getMyReservations(): Promise<Reservation[]> {
  const stored = readStoredReservations();
  const list = stored
    .map(toListedReservation)
    .filter((r): r is Reservation => r !== null);
  return delay([...list].reverse());
}

export async function getReservation(id: string): Promise<Reservation> {
  const stored = readStoredReservations();
  const reservation = stored.find((r) => r.reservationId === id);
  if (!reservation) {
    throw new Error(`예약을 찾을 수 없습니다: ${id}`);
  }
  const listed = toListedReservation(reservation);
  if (!listed) {
    throw new Error(`확인할 수 없는 예약입니다: ${id}`);
  }
  return delay(listed);
}
