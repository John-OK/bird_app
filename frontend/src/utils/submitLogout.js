import axios from 'axios';
import { useNavigate } from "react-router-dom";



const submitLogout = function(event){
    const navigate = useNavigate();
    axios.post('/logout')
        .then((response)=>{
        console.log('logout response from server: ', response)
        navigate("/")
         
    })
;
}

export {submitLogout};