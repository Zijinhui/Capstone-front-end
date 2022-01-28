import React, {useState} from 'react'
import {CardElement, useElements, useStripe } from '@stripe/react-stripe-js'
import axios from 'axios'

// {/* <form onSubmit={handleSubmit}> */}
// <CardElement options={CARD_OPTIONS}/>
// {/* <button>Pay</button>
// </form> */}

export default function PaymentForm (props){

    const [success,setSuccess] = useState(false)
    const stripe = useStripe()
    const elements = useElements()

    const [address, setAddress] = useState({
        street: "",
        apt: "",
        city: "",
        state: "",
        zip: "" 
    })

    function updateAddress (e) {      
        setAddress({...address, [e.target.name]: e.target.value})
        //console.log(e.target)
    }
    //console.log(address)

    const showAddress = () => {
        return(
            <div className="address-form">       
                <div>
                    <label>Street</label> 
                    <input type="text" name="street" onChange={updateAddress} />                               
                </div>
                <div className="apt">
                    <label >Apt(optional)</label> 
                    <input type="text" name="apt" onChange={updateAddress}/>                      
                </div>
                <div className="city">
                    <label>City</label> 
                    <input type="text" name="city" onChange={updateAddress} />                               
                </div>
                <div className="state">
                    <label>State</label> 
                    <input type="text" name="state" onChange={updateAddress} />                               
                </div>
                <div className="zip">
                    <label>Zip</label> 
                    <input type="text" name="zip" onChange={updateAddress} />                               
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
        //props.updateAddress(true)
        console.log(address.street)

        const {error, paymentMethod} = await stripe.createPaymentMethod({
            type: "card",
            card: elements.getElement(CardElement)
        })
        
        if(!error) {
            try {
                const {id} = paymentMethod
                const response = await axios.post("https://sushi-back-end.herokuapp.com/payment", {
                    amount: 1000,
                    id
                })
    
                // When the payment is passed , send the signal back to Card > Payment 
                if(response.data.success) {
                    console.log("Successful payment")
                    setSuccess(true)
                    //setPay(true)
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
               <>
                    <fieldset className="FormGroup">
                        <div className="FormRow">
                            <CardElement options={CARD_OPTIONS} />
                        </div>
                    </fieldset>
                    <button className="pay-btn" >Pay</button>
               </>
                :
                <div>
                    <h2>   Thanks for your phurchasing! 
              We will notice you when the store accept your order!</h2>
                    <img src={require('../../img/thank-you.gif')}/>
                </div> 
            }
            </>
        )
    }

 
    return (
        <>
        <form onSubmit={handleSubmit}>
        {props.display.address && showAddress() }
        {props.display.card && showCard() }
        </form>
        </>
    )
}