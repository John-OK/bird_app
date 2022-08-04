import axios from 'axios';
import {useEffect, useState} from 'react';

function HomePage(props) {
    useEffect( ()=> {
        props.whoAmI()
        console.log('HomePage')
    }, [])

    const [birdName, setBirdName] = useState("")

    const handleInput = event => {
        setBirdName(event.target.value)
    }

    const checkBird = () => {
        event.preventDefault();
        console.log("Caw!!! Caw!!!")
        console.log(birdName)
        axios.get(`https://xeno-canto.org/api/2/recordings?query=${birdName}`)
            .then(response => {
                console.log(response);
            })
    }

    return(
        <div>
            <form onSubmit={checkBird} >
            <label>
                <input type="text" value={birdName} onChange={handleInput} placeholder="Commmon name of bird" />
            </label>
            <input type="submit" value="Check" onClick={checkBird} />
            </form>
        </div>
    )
}

export default HomePage;