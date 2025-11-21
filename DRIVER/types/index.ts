export interface Order {
    id: string;
    pickup: string;
    dropoff: string;
    distance: string;
    price: number;
    status: 'PENDING' | 'ACCEPTED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED';
}
