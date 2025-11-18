export interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  stock: number;
  image?: string;
  isAvailable: boolean;
  category?: string;
}
