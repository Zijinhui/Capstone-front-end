import { createContext,useContext,useEffect,useReducer} from "react";
import { useAuth } from "./Auth/AuthContext"

const Cart = createContext()

const Context = ({children}) =>{

    const [state,dispatch] = useReducer(cartReducer,{
        price:0,
        cart:[]
    })

    const { currentUser } = useAuth()

    useEffect(function(){
        if (currentUser){
            userDispatch({
                type:'SET_USER',
                user: currentUser
            })
        }
    },[currentUser])

    const [user,userDispatch] = useReducer(userReducer,{
        currentUser: currentUser
    })

    return <Cart.Provider value={{state,dispatch,user,userDispatch}}>
            {children}
        </Cart.Provider>
}

export const userReducer = (state,action) =>{
    switch(action.type){
        case 'Login_In':
            return {currentUser:action.payload}
        case 'Login_Out':
            return {currentUser:''}
        case 'SET_USER':
            return {currentUser:action.user.multiFactor.user.email}
        default :
            return state.currentUser
    }
}

export const cartReducer = (state,action) =>{
    switch(action.type){
        case 'ADD_TO_CART':
            let exist = false
            state.cart.map(e=> {
                if (e.food.id===action.payload.food.id){
                    e['qty'] = e.qty+1
                    exist = true
                    return {price:state.price+e.food.price, cart:state.cart}
                }
            })
            if (!exist){
                return {price:state.price+action.payload.food.price,cart:[...state.cart, {...action.payload,qty:1}]}
            }
            return {price:state.price+action.payload.food.price,cart:state.cart}
        case 'ROMOVE_ALL_CART':
            return {price:0, cart:[]}
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
        case 'SET_FINALPRICE':
                return {...state,price:action.price}
        default:
            return state
    }
}

export default Context

export const CartState = () =>{
    return useContext(Cart)
}
