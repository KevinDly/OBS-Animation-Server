const AYAYA_URL = "https://play-lh.googleusercontent.com/kTkV3EWtNTDVCzRnUdbI5KdXm6Io-IM4Fb3mDcmX9-EOCEXJxnAxaph_leEn6m61E0I"

function executeAnimation(num, imageURL) {
    //let element = document.getElementById("test")
    let image = document.createElement("img")
    image.setAttribute("src", imageURL)
    image.id = "test"
    image.class = "emote"
    document.body.appendChild(image)

    const maxHeight = document.documentElement.scrollHeight
    const location = image.getBoundingClientRect()
    console.log(location)
    console.log(document.documentElement)
    //X Step
    let sign = (Math.random() > .5) ? 1 : -1

    //TODO: Make sure this number matches the equation properly.
    let xStep = sign * (10 * Math.random() + 5) //sign * (1 + Math.random() * 1)
    console.log("step: " + xStep)

    const coefficients = [[-.00106, 1.020], [-.0042, 2.042], [-0.0069, 3.333]]
    const element = coefficients[Math.floor(Math.random() * coefficients.length)]
    console.log(element)
    //Parabola Modification Variables
    //TODO: Make third and second coefficient random
    const thirdCoefficient = element[0]
    const secondCoefficient = element[1] * Math.random()
    const firstCoefficient = 0
    const xModifierA = 1
    const xModifierB = 1
    const yModifier = 1

    //yFlip needs to be negative since coordinates on a standard graph are opposite 
    const yFlip = -1
    const xFlip = sign * 1
    let yShift = 0
    let xShift = 0
    let x = location.left
    let y = location.top

    console.log("left: " + x)
    console.log("top: " + y)
    console.log(maxHeight)

    //TODO: Figure out better parabola
    function calcParabola(newX, yShift) {
        var newY = (thirdCoefficient * Math.pow((newX * xModifierA + xShift), 2) + secondCoefficient * (xFlip * xModifierB * newX + xShift) + firstCoefficient)
        return ((yFlip * newY * yModifier) - yShift)
    }


    function moveit(el, updateX) {
        var newX = updateX + xStep
        var newY = calcParabola(newX, yShift)

        //progress = Math.min(progress, 1)
        el.style.left = (newX + x).toFixed(2) + 'px'
        el.style.top = (newY + y).toFixed(2) + 'px'
        
        console.log("X: " + newX + " Y: " + newY)
        console.log("pixel Y: " + el.style.top)
        
        if(Math.abs(newY + y) < maxHeight) {
            requestAnimationFrame(function() {
                moveit(el, newX)
            })
        }
        else {
            console.log("Removing " + num)
            image.remove()
        }
    }

    console.log(image.getBoundingClientRect())
    console.log(image.style.top)
    moveit(image, 0)
    //drawParabola(0)
}

function drawParabola(xStep, calcParabola, yShift, x, y, maxHeight) {
    var newX = updateX + xStep
    var newY = calcParabola(newX, yShift)

    let image = document.createElement("img")
    image.setAttribute("src", "https://play-lh.googleusercontent.com/kTkV3EWtNTDVCzRnUdbI5KdXm6Io-IM4Fb3mDcmX9-EOCEXJxnAxaph_leEn6m61E0I")
    image.id = "test"
    image.class = "emote"
    document.body.appendChild(image)

    image.style.left = (newX + x).toFixed(2) + 'px'
    image.style.top = (newY + y).toFixed(2) + 'px'

    if (Math.abs(newY + y) < maxHeight) {
        drawParabola(newX)
    }
}

function generateEmotes(emoteDensity, imageURL) {
    for (let i = 0; i < emoteDensity; i++) {
        executeAnimation(i, imageURL)
    }
}

function buttonSpawnEmoteCallback() {
    const emoteDensity = document.getElementById("emoteDensity")
    generateEmotes(emoteDensity.value, AYAYA_URL)
}

export { buttonSpawnEmoteCallback, generateEmotes }