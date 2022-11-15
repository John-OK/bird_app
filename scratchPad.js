let test = {lat: undefined}
console.log(test.lat)
if(test.lat === "undefined") {
    console.log(`undefined with quotes`)
} else if(test.lat === undefined) {
    console.log(`undefined no quotes`)
}
