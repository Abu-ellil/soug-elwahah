import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// Create typed hooks for easier usage
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Specific hooks for different parts of the state
export const useAuth = () => useAppSelector(state => state.auth);
export const useProducts = () => useAppSelector(state => state.products);
export const useStoreApplication = () => useAppSelector(state => state.storeApplication);
