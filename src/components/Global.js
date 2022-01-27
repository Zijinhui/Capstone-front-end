import { createContext,useContext,useReducer,useState,useEffect} from "react";
import axios from 'axios'

const Cart = createContext()

const Context = ({children}) =>{

    const [state,dispatch] = useReducer(cartReducer,{
        price:0,
        cart:[]
    })

    return <Cart.Provider value={{state,dispatch}}>
            {children}
        </Cart.Provider>
}

export const cartReducer = (state,action) =>{
    console.log(action)
    console.log(state.cart)
    switch(action.type){
        case 'ADD_TO_CART':
            let exist = false
            state.cart.map(e=> {
                if (e.food.id===action.payload.food.id){
                    console.log(state.price)
                    e['qty'] = e.qty+1
                    exist = true
                    return {price:state.price+e.food.price, cart:state.cart}
                }
            })
            if (!exist){
                console.log('hi, not exist')
                return {price:state.price+action.payload.food.price,cart:[...state.cart, {...action.payload,qty:1}]}
            }
            return {price:state.price+action.payload.food.price,cart:state.cart}
        case 'ROMOVE_TO_CART':
            return {price:state.price-action.payload.food.price,cart: state.cart.filter(c=> c.id!== action.payload.food.id)}
        case 'CHANGE_QTY':
            return {...state.price,cart: state.cart.filter((c)=> c.id === action.payload.food.id? (c.qty=action.payload.food.qty) : c.qty)}
        case 'INCREMENT_IN_CART':
            state.cart.map(e => {
                if (e.food.id===action.payload.id){
                    e['qty'] = e.qty+1
                    return {price:state.price+action.payload.price,cart:state.cart}
                }
            })
            return {price:state.price+action.payload.price,cart:state.cart}
        case 'DECREMENT_IN_CART':
            state.cart.map(e => {
                if (e.food.id===action.payload.id){
                    if (e.qty>0){
                        e['qty'] = e.qty-1
                        return {...state.price,cart:state.cart}
                    }
                }
            })
            return {price:state.price-action.payload.price, cart: state.cart.filter(e=> e.qty!==0)}
        default:
            return state
    }
}

export default Context

export const CartState = () =>{
    return useContext(Cart)
}