import { Product, Stock } from "../../types";
import { api } from "../api";

export async function fetchProducts (): Promise<Product[]> {
  const { data } = await api.get<Product[]>('/products')
  return data
}

export async function getProductById (productId: number):Promise<Product> {
  const { data } = await api.get<Product>(`/products/${productId}`)
  return data
}

export async function fetchStock (): Promise<Stock[]> {
  const { data } = await api.get<Stock[]>('/stock')
  return data
}

export async function getStockByProductId (productId: number): Promise<Stock> {
  const { data } = await api.get<Stock>(`/stock/${productId}`)
  return data 
}