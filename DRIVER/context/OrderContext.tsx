import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Order } from '../types';

interface OrderContextType {
    activeOrder: Order | null;
    setActiveOrder: (order: Order | null) => void;
    updateOrderStatus: (status: Order['status']) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
    const [activeOrder, setActiveOrder] = useState<Order | null>(null);

    const updateOrderStatus = (status: Order['status']) => {
        if (activeOrder) {
            setActiveOrder({ ...activeOrder, status });
        }
    };

    return (
        <OrderContext.Provider value={{ activeOrder, setActiveOrder, updateOrderStatus }}>
            {children}
        </OrderContext.Provider>
    );
}

export function useOrder() {
    const context = useContext(OrderContext);
    if (context === undefined) {
        throw new Error('useOrder must be used within an OrderProvider');
    }
    return context;
}
