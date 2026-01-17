import React from "react";

export default function BirdList(props) {
    const birds = props.birds
    console.log("BirdList- birds is an array?", Array.isArray(birds))
    let test = false
    return (
        <>
            <h3>birds isArray? { Array.isArray(birds) ? "True" : "False" }</h3>
            {/* <h1>{birds[0]}</h1> */}
        </>
    )
}