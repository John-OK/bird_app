import { useNavigate } from "react-router-dom";
import axios from 'axios';

function LogInPage() {
    let navigate = useNavigate();

    const submitLogIn = function(event){
        // LOGIC FOR CHECKING CORRECT PASS (BACKEND?) AND RETURNING PROPER RESPONSE (I.E., REDIRECT TO SEARCH, OR WRONG PASSWORD MSG)
        event.preventDefault();
        axios.post('/login/', {email: event.target[0].value, password: event.target[1].value})
            .then((response)=>{
                console.log('login response from server: ', response)
                window.location.reload()
        })
        navigate("/");   
      }

    return (
        <div>
            <h2>Log In</h2>
            <form onSubmit={submitLogIn} >
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
export default LogInPage;