export type CategoryKey = 'water' | 'land' | 'exp' | 'heal';

export type PayMethod = 'card' | 'transfer' | 'phone';

export type PersonType = {
  key: string;
  label: string;
  price: number;
  min: number;
  max: number;
};

export type Product = {
  id: string;
  category: CategoryKey;
  islandId: string;
  islandName: string;
  regionColor: string;
  name: string;
  photo?: string;
  diff: string;
  season: string;
  popularity: number;
  personTypes: PersonType[];
  availableDates?: string[];
  guide?: {
    place: string;
    items: string;
    cancelPolicy: string;
    contact: string;
  };
};

export type TimeSlot = { time: string; left: number };

export type CreateReservationPayload = {
  productId: string;
  date: string;
  time: string;
  persons: { key: string; count: number }[];
  booker: {
    name: string;
    phone: string;
    email?: string;
    request?: string;
  };
};

export type Reservation = CreateReservationPayload & {
  reservationId: string;
  productName: string;
  islandName: string;
  totalPrice: number;
  payMethod: PayMethod;
  status: 'paid';
  createdAt: string;
};

export type ReservationDraft = {
  productId: string;
  date: string;
  time: string;
  persons: { key: string; count: number }[];
  totalPrice: number;
};
