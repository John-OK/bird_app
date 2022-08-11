import { useNavigate } from "react-router-dom";
import axios from 'axios';

function SignUpPage() {
    let navigate = useNavigate();

    function submitSignupForm(event){
        // CHECK IF SUCCESS/FAIL AND RETURN PROPER BEHAVIOR
        // CHECK IF ALREADY A USER AND RETURN PROPER RESPONSE/BEHAVIOR
        event.preventDefault()        

        axios.post('/signup/', {email: event.target[0].value, password: event.target[1].value})
        .then((response)=>{
            console.log('signup response from server: ', response)
        })
        //WOULD LIKE TO HAVE NEW USER AUTO LOGGED IN AFTER SIGN UP, THEN REDIRECT TO ""../search"
        // axios.post('/login', {email: event.target[0].value, password: event.target[1].value})
        //     .then((response)=>{
        //         console.log('login response from server: ', response)
        //         window.location.reload()
        // })
        navigate("../login");        

    }

    return (
        <div>
            <h2>Sign Up</h2>
            <form onSubmit={submitSignupForm} >
            <label>
                <input type="email" name="email" placeholder="Email address" />
            </label>
            <label>
                <input type="password" name="password" placeholder="Password" />
            </label>
            <input type="submit" value="Submit" />
            </form>
        </div>
        ) 

}
export default SignUpPage;