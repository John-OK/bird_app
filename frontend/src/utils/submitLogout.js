import axios from 'axios';

const submitLogout = function(event) {
    axios.post('/logout/')
        .then((response)=>{
        console.log('logout response from server: ', response)
    })
    document.location.href="/"
}

export {submitLogout};