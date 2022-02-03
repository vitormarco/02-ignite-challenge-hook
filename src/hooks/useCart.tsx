import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { getProductById, getStockByProductId } from '../services/ProductsService/ProductsService';
import { Product } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart')

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const updatedCart = [...cart]
      const productExists = updatedCart.find(product => product.id === productId)

      const { amount: stockAmout } = await getStockByProductId(productId) 

      const currentAmount = productExists ? productExists.amount : 0
      const amount = currentAmount + 1

      if (amount > stockAmout) {
        // throw new Error('Quantidade solicitada fora de estoque')
        toast.error('Quantidade solicitada fora de estoque')
        return
      }

      if (productExists) {
        productExists.amount = amount
      } else {
        const product = await getProductById(productId)
        updatedCart.push({
          ...product,
          amount: 1
        })
      }

      setCart(updatedCart)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))

    } catch (err) {
      toast.error('Erro na adição do produto')
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const productExists = cart.find(product => product.id === productId)

      if (!productExists) {
        throw new Error('Erro na remoção do produto')
      }

      const filteredProducts = cart.filter(product => product.id !== productId)

      setCart(filteredProducts)
      
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(filteredProducts))
    } catch (err) {
      const message = 'Erro na remoção do produto'
      if (err instanceof Error) {
        toast.error(err?.message || message)
      } else {
        toast.error(message)
      }
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if (amount <= 0 ) {
        throw new Error()
      }

      const productExists = cart.find(product => product.id === productId)

      if (!productExists) {
        throw new Error('Erro na alteração de quantidade do produto')
      }

      const { amount: stockAmount } = await getStockByProductId(productId)

      if (amount > stockAmount) {
        throw new Error('Quantidade solicitada fora de estoque')
      }

      const updatedCart = cart.map(product => product.id === productId ? {
        ...product,
        amount
      } : product)

      setCart(updatedCart)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message)
      } 
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
