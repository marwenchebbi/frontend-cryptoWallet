export interface PriceHistory {
    _id: string;
    price: number;
    currencyId: string; // Note: currencyId is a string (ObjectId), not an object, as population seems absent
    createdAt: string;
    updatedAt: string;
    __v: number;
  }