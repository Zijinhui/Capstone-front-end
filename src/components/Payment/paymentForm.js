import React, {useState} from 'react'
import {CardElement, useElements, useStripe } from '@stripe/react-stripe-js'
import axios from 'axios'
import { useAuth } from "../Auth/AuthContext"
import { CartState } from '../GlobalContext';


export default function PaymentForm (props){

    const [success,setSuccess] = useState(false)
    const stripe = useStripe()
    const elements = useElements()
    const {currentUser} = useAuth()
    const {state:{price},dispath} = CartState()

    const [info, setInfo] = useState({
        first_name:"",
        last_name:"",
        phone:"",
        address: "",
        apt: "",
        city: "",
        state: "",
        zip: "" 
    })

    function updateAddress (e) {      
        setInfo({...info, [e.target.name]: e.target.value})
    }
    console.log(info)

    const showAddress = () => {
        return(
            <div className="address-form">   
                <div className="input">
                    <label>First Name</label> 
                    <input type="text" name="first_name" onChange={updateAddress} />     
                </div>
                <div className="input">
                    <label>Last Name</label> 
                    <input type="text" name="last_name" onChange={updateAddress} />                             
                </div >

                <div className="input">
                    <label>Street</label> 
                    <input type="text" name="address" onChange={updateAddress} />  
                </div>
                <div className="input"> 
                    <label >Apt(optional)</label> 
                    <input type="text" name="apt" onChange={updateAddress}/>                                        
                </div>
                <div className="input">
                    <label>City</label> 
                    <input type="text" name="city" onChange={updateAddress} />
                </div>
                <div className="input">
                    <label>State</label> 
                    <input type="text" name="state" onChange={updateAddress} />                                
                </div>
                <div className="input">
                    <label>Zip</label> 
                    <input type="text" name="zip" onChange={updateAddress} /> 
                </div>
                <div className="input">
                    <label>Phone</label> 
                    <input type="text" name="phone" onChange={updateAddress} />                               
                </div>    
                
            
        </div>
        )
    }
    
    const CARD_OPTIONS = {
        iconStyle: "solid",
        style: {
            base: {
                iconColor: "#c4f0ff",
                color: "#fff",
                fontWeight: 500,
                fontFamily: "Roboto, Open Sans, Segoe UI, sans-serif",
                fontSize: "16px",
                fontSmoothing: "antialiased",
                ":-webkit-autofill": { color: "#fce883" },
                "::placeholder": { color: "#87bbfd" }
            },
            invalid: {
                iconColor: "#ffc7ee",
                color: "#ffc7ee"
            }
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        console.log(info)
        //props.updateAddress(true)

        const {error, paymentMethod} = await stripe.createPaymentMethod({
            type: "card",
            card: elements.getElement(CardElement)
        })

    function handlePayment(){
        dispath({
            type : 'ROMOVE_ALL_CART'
        })
    }
        
        if(!error) {
            try {
                const {id} = paymentMethod

                await axios.post("https://sushi-back-end.herokuapp.com/payment", {amount: {price}, id})
                .then((res)=> {
                    console.log(res)
                    console.log(res.data)
                    if(res.data.success===false) {
                    console.log("Successful payment")
                    setSuccess(true)
                }})
                .catch((err)=> console.log(err))
                // When the payment is passed , send the signal back to Card > Payment 
                // if(response.data.success) {
                //     console.log("Successful payment")
                //     setSuccess(true)
                //     //setPay(true)
                // }
                console.log(currentUser.multiFactor.user.email)
                if(info.zip){
                    await axios.get(`https://sushi-back-end.herokuapp.com/api/user/${currentUser.multiFactor.user.email}`)
                        .then( async (res)=> {
                            const id = res.data[0].id
                            console.log(info)
                            await axios.post("https://sushi-back-end.herokuapp.com/api/purchaseHistory",{...info, order_complete:true,userId:id})
                            .then((res)=> console.log(res))
                            .catch((err)=> console.log(err))
                        })
                        .then((err)=> console.log(err))
                }
            
            }catch(error){
                console.log("Error",error)
            }
        } else {
            console.log(error.message)
        }
    }

    const showCard = () => {
        return (
            <>
            {!success ? 
            
               <div className="card-input">
                    <fieldset className="FormGroup">
                        <div className="FormRow">
                            <CardElement options={CARD_OPTIONS} />
                        </div>
                    </fieldset>
                    <button className="pay-btn" >Pay</button>
               </div>
                :
                <div>
                    <h2>   Thanks for your phurchasing! </h2>
              <h2>We will notice you when the store accept your order!</h2>
                    <img src={require('../../img/thank-you.gif')} className="thx-img"/>
                </div> 
            }
            </>
        )
    }

 
    return (   
        <>
        <form onSubmit={handleSubmit} className="payment-form" align="center">
            {(props.display.address && success===false) && showAddress() }
            {props.display.card && showCard() } 
        </form>
        </>
    )
}
