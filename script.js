/* =====================================================
   GOOGLE APPS SCRIPT API
===================================================== */

const API_URL =
    "https://script.google.com/macros/s/AKfycbxuLyMFHxWvdoF0ThFgVHaDzFDnezm_KaQzxf4_iixhr5yVAR170n8Cu1rKr6KZl0fM/exec";


/* =====================================================
   VARIABLES
===================================================== */

let participants = [];

let availableForWheel = [];

let currentPlayer = null;

let selectedTarget = null;

let spinning = false;

let wheelRotation = 0;


/* =====================================================
   DOM
===================================================== */

const entryScreen =
    document.getElementById(
        "entryScreen"
    );

const wheelScreen =
    document.getElementById(
        "wheelScreen"
    );

const resultScreen =
    document.getElementById(
        "resultScreen"
    );

const finishedScreen =
    document.getElementById(
        "finishedScreen"
    );

const nameInput =
    document.getElementById(
        "playerName"
    );

const rollInput =
    document.getElementById(
        "playerRoll"
    );

const entryError =
    document.getElementById(
        "entryError"
    );

const spinError =
    document.getElementById(
        "spinError"
    );


/* =====================================================
   LOAD PARTICIPANTS
===================================================== */

async function loadParticipants() {

    try {

        const response =
            await fetch(
                API_URL +
                "?action=participants"
            );


        const data =
            await response.json();


        if (!data.success) {

            throw new Error(
                data.error
            );

        }


        participants =
            data.participants;


        document.getElementById(
            "gameInfo"
        ).textContent =
            data.gameId;


        console.log(
            "Participants:",
            participants
        );


    } catch (error) {

        console.error(error);


        entryError.textContent =
            "Unable to connect to the game server.";

    }

}


/* =====================================================
   CONTINUE
===================================================== */

document
    .getElementById(
        "continueButton"
    )
    .addEventListener(
        "click",
        startParticipant
    );


async function startParticipant() {

    entryError.textContent = "";


    const name =
        nameInput
            .value
            .trim();


    const roll =
        rollInput
            .value
            .trim();


    if (!name) {

        entryError.textContent =
            "Please enter your name.";

        return;

    }


    if (!roll) {

        entryError.textContent =
            "Please enter your roll.";

        return;

    }


    /*
     * Verify locally first.
     */

    const player =
        participants.find(
            person =>
                normalize(
                    person.name
                ) ===
                normalize(name)
                &&
                String(person.roll) ===
                String(roll)
        );


    if (!player) {

        entryError.textContent =
            "Name and Roll Number do not match our participant list.";

        return;

    }


    currentPlayer = player;


    document.getElementById(
        "currentPlayer"
    ).textContent =
        player.name;


    /*
     * Build visual wheel.
     *
     * We don't yet know the final target.
     * The server will choose it when
     * the user presses SPIN.
     */

    availableForWheel =
        participants.filter(
            person =>
                String(person.id) !==
                String(player.id)
        );


    if (
        availableForWheel.length === 0
    ) {

        entryError.textContent =
            "You are the only participant.";

        return;

    }


    renderWheel();


    entryScreen.classList.add(
        "hidden"
    );

    wheelScreen.classList.remove(
        "hidden"
    );

}


/* =====================================================
   RENDER WHEEL
===================================================== */

function renderWheel() {

    const wheel =
        document.getElementById(
            "wheel"
        );


    wheel
        .querySelectorAll(
            ".wheel-name"
        )
        .forEach(
            element =>
                element.remove()
        );


    const total =
        availableForWheel.length;


    availableForWheel.forEach(
        (person, index) => {

            const angle =
                (360 / total) *
                index;


            const element =
                document.createElement(
                    "div"
                );


            element.className =
                "wheel-name";


            element.textContent =
                person.name;


            const radius =
                wheel.offsetWidth *
                0.39;


            element.style.transform =
                `
                translate(-50%, -50%)
                rotate(${angle}deg)
                translateY(-${radius}px)
                rotate(${-angle}deg)
                `;


            wheel.appendChild(
                element
            );

        }
    );

}


/* =====================================================
   SPIN
===================================================== */

document
    .getElementById(
        "spinButton"
    )
    .addEventListener(
        "click",
        spin
    );


async function spin() {

    if (spinning) {

        return;

    }


    spinError.textContent = "";

    spinning = true;


    document.getElementById(
        "spinButton"
    ).disabled = true;


    try {

        /*
         * Ask the SERVER to perform
         * the actual random selection.
         */

        const response =
            await fetch(
                API_URL,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "text/plain;charset=utf-8"

                    },

                    body:
                        JSON.stringify({

                            action:
                                "spin",

                            name:
                                currentPlayer.name,

                            roll:
                                currentPlayer.roll

                        })

                }
            );


        const data =
            await response.json();


        console.log(
            "Server result:",
            data
        );


        if (!data.success) {

            throw new Error(
                data.error
            );

        }


        selectedTarget =
            data.target;


        /*
         * Server says this person
         * already participated.
         */

        if (
            data.alreadyPlayed
        ) {

            showResult(
                data.target,
                true
            );

            return;

        }


        /*
         * Animate wheel toward
         * the server-selected target.
         */

        await animateToTarget(
            selectedTarget.name
        );


        showResult(
            selectedTarget,
            false
        );


    } catch (error) {

        console.error(error);


        spinError.textContent =
            error.message ||
            "Something went wrong.";


        document.getElementById(
            "spinButton"
        ).disabled = false;


        spinning = false;

    }

}


/* =====================================================
   ANIMATE TO TARGET
===================================================== */

function animateToTarget(
    targetName
) {

    return new Promise(
        resolve => {

            const index =
                availableForWheel.findIndex(
                    person =>
                        normalize(
                            person.name
                        ) ===
                        normalize(
                            targetName
                        )
                );


            if (index === -1) {

                resolve();

                return;

            }


            const total =
                availableForWheel.length;


            const slice =
                360 / total;


            /*
             * Pointer is at the top.
             */

            const targetAngle =
                index * slice;


            const desiredRotation =
                360 -
                targetAngle;


            const extraSpins =
                360 * 7;


            wheelRotation +=
                extraSpins +
                desiredRotation;


            const wheel =
                document.getElementById(
                    "wheel"
                );


            wheel.style.transform =
                `rotate(${wheelRotation}deg)`;


            setTimeout(
                resolve,
                5200
            );

        }
    );

}


/* =====================================================
   SHOW RESULT
===================================================== */

function showResult(
    target,
    alreadyPlayed
) {

    spinning = false;


    document.getElementById(
        "targetName"
    ).textContent =
        target.name;


    const message =
        document.getElementById(
            "alreadyMessage"
        );


    if (alreadyPlayed) {

        message.classList.remove(
            "hidden"
        );

        message.textContent =
            "You already participated in this game. This is your existing assignment.";

    } else {

        message.classList.add(
            "hidden"
        );

    }


    wheelScreen.classList.add(
        "hidden"
    );


    resultScreen.classList.remove(
        "hidden"
    );


    resultScreen.scrollIntoView({
        behavior: "smooth"
    });

}


/* =====================================================
   DONE
===================================================== */

document
    .getElementById(
        "doneButton"
    )
    .addEventListener(
        "click",
        () => {

            resultScreen.classList.add(
                "hidden"
            );

            finishedScreen.classList.remove(
                "hidden"
            );

        }
    );


/* =====================================================
   NORMALIZE
===================================================== */

function normalize(value) {

    return String(value)
        .trim()
        .toLowerCase();

}


/* =====================================================
   START
===================================================== */

loadParticipants();
