/* =====================================================
   GOOGLE SHEET API
===================================================== */

const API_URL =
      "https://script.google.com/macros/s/AKfycbzQ6RT7xXF0t5UJT_XJk3-OvoccYeomV76_qkaTiC2WcmCBVs5TkZbv-P45M0Br_MB7/exec";


/* =====================================================
   GAME VARIABLES
===================================================== */

let participants = [];

let remainingParticipants = [];

let currentPlayer = null;

let selectedPerson = null;

let spinning = false;

let currentRotation = 0;


/* =====================================================
   LOCAL STORAGE KEY
===================================================== */

const STORAGE_KEY =
    "anonymous_roast_remaining_v1";


/* =====================================================
   DOM ELEMENTS
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


/* =====================================================
   LOAD GOOGLE SHEET DATA
===================================================== */

async function loadParticipants() {

    try {

        const response =
            await fetch(API_URL);

        if (!response.ok) {

            throw new Error(
                "Could not load participant data."
            );

        }


        participants =
            await response.json();


        if (
            !participants ||
            participants.length === 0
        ) {

            throw new Error(
                "No participants found."
            );

        }


        restoreGame();


    } catch (error) {

        console.error(error);

        document.getElementById(
            "entryError"
        ).textContent =
            "Could not load the participant list.";

    }

}


/* =====================================================
   RESTORE GAME
===================================================== */

function restoreGame() {

    const saved =
        localStorage.getItem(
            STORAGE_KEY
        );


    if (saved) {

        try {

            const savedIds =
                JSON.parse(saved);


            remainingParticipants =
                participants.filter(
                    person =>
                        savedIds.includes(
                            String(person.id)
                        )
                );


        } catch {

            remainingParticipants =
                participants.slice();

        }

    } else {

        remainingParticipants =
            participants.slice();

        saveGame();

    }


    updateRemaining();

}


/* =====================================================
   SAVE GAME
===================================================== */

function saveGame() {

    const ids =
        remainingParticipants.map(
            person =>
                String(person.id)
        );


    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(ids)
    );

}


/* =====================================================
   UPDATE COUNTER
===================================================== */

function updateRemaining() {

    document.getElementById(
        "remainingCount"
    ).textContent =
        remainingParticipants.length;

}


/* =====================================================
   ENTER PARTICIPANT
===================================================== */

document
    .getElementById("enterButton")
    .addEventListener(
        "click",
        enterParticipant
    );


function enterParticipant() {

    const name =
        document
            .getElementById(
                "playerName"
            )
            .value
            .trim();


    const roll =
        document
            .getElementById(
                "playerRoll"
            )
            .value
            .trim();


    const error =
        document.getElementById(
            "entryError"
        );


    error.textContent = "";


    if (!name) {

        error.textContent =
            "Please enter your name.";

        return;

    }


    if (!roll) {

        error.textContent =
            "Please enter your roll number.";

        return;

    }


    /*
       Find the participant in Google Sheet.
    */

    const player =
        participants.find(
            person =>
                normalize(person.name) ===
                normalize(name)
                &&
                String(person.roll) ===
                String(roll)
        );


    if (!player) {

        error.textContent =
            "Name and Roll Number do not match.";

        return;

    }


    currentPlayer = player;


    /*
       Check whether there are any possible
       people left.
    */

    const possiblePeople =
        remainingParticipants.filter(
            person =>
                String(person.id) !==
                String(currentPlayer.id)
        );


    if (
        possiblePeople.length === 0
    ) {

        error.textContent =
            "There are no other participants left.";

        return;

    }


    /*
       Show player information.
    */

    document.getElementById(
        "currentPlayer"
    ).textContent =
        currentPlayer.name;


    document.getElementById(
        "currentRoll"
    ).textContent =
        currentPlayer.roll;


    updateRemaining();


    /*
       Move to wheel.
    */

    entryScreen.classList.add(
        "hidden"
    );

    wheelScreen.classList.remove(
        "hidden"
    );


    /*
       Draw names on wheel.
    */

    renderWheel();

}


/* =====================================================
   NORMALIZE TEXT
===================================================== */

function normalize(text) {

    return String(text)
        .trim()
        .toLowerCase();

}


/* =====================================================
   RENDER WHEEL
===================================================== */

function renderWheel() {

    const wheel =
        document.getElementById(
            "wheel"
        );


    /*
       Remove old name elements.
    */

    wheel
        .querySelectorAll(
            ".wheel-name"
        )
        .forEach(
            element =>
                element.remove()
        );


    /*
       Only people who can actually be
       selected are displayed.

       Spinner's own name is excluded.
    */

    const available =
        remainingParticipants.filter(
            person =>
                String(person.id) !==
                String(currentPlayer.id)
        );


    const total =
        available.length;


    /*
       If there are many names, distribute
       them around the circle.
    */

    available.forEach(
        (person, index) => {

            const angle =
                (
                    360 / total
                ) * index;


            const nameElement =
                document.createElement(
                    "div"
                );


            nameElement.className =
                "wheel-name";


            nameElement.textContent =
                person.name;


            nameElement.style.transform =
                `
                rotate(${angle}deg)
                translateY(-${getWheelRadius()}px)
                rotate(${-angle}deg)
                `;


            wheel.appendChild(
                nameElement
            );

        }
    );

}


/* =====================================================
   WHEEL RADIUS
===================================================== */

function getWheelRadius() {

    const width =
        document
            .getElementById("wheel")
            .offsetWidth;


    return width * 0.38;

}


/* =====================================================
   SPIN
===================================================== */

document
    .getElementById("spinButton")
    .addEventListener(
        "click",
        spinWheel
    );


function spinWheel() {

    if (spinning) {

        return;

    }


    /*
       Remove spinner's own name from
       possible results.
    */

    const available =
        remainingParticipants.filter(
            person =>
                String(person.id) !==
                String(currentPlayer.id)
        );


    if (available.length === 0) {

        finishGame();

        return;

    }


    spinning = true;


    document.getElementById(
        "spinButton"
    ).disabled = true;


    /*
       Pick random person.
    */

    const randomIndex =
        Math.floor(
            Math.random() *
            available.length
        );


    selectedPerson =
        available[randomIndex];


    /*
       IMPORTANT:

       Remove selected person permanently
       from remaining pool.
    */

    remainingParticipants =
        remainingParticipants.filter(
            person =>
                String(person.id) !==
                String(selectedPerson.id)
        );


    /*
       Save immediately.

       So even if browser crashes,
       selected person stays removed.
    */

    saveGame();


    updateRemaining();


    /*
       Random visual rotation.
    */

    const extraRotation =
        1800 +
        Math.floor(
            Math.random() *
            1800
        );


    currentRotation +=
        extraRotation;


    document.getElementById(
        "wheel"
    ).style.transform =
        `rotate(${currentRotation}deg)`;


    /*
       Wait for animation.
    */

    setTimeout(
        showResult,
        5200
    );

}


/* =====================================================
   SHOW RESULT
===================================================== */

function showResult() {

    spinning = false;


    document.getElementById(
        "selectedName"
    ).textContent =
        selectedPerson.name;


    document.getElementById(
        "selectedRoll"
    ).textContent =
        selectedPerson.roll;


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
   NEXT PARTICIPANT
===================================================== */

document
    .getElementById("nextButton")
    .addEventListener(
        "click",
        nextParticipant
    );


function nextParticipant() {

    currentPlayer = null;

    selectedPerson = null;


    document.getElementById(
        "playerName"
    ).value = "";


    document.getElementById(
        "playerRoll"
    ).value = "";


    resultScreen.classList.add(
        "hidden"
    );


    /*
       If nobody is left, finish.
    */

    if (
        remainingParticipants.length === 0
    ) {

        finishGame();

        return;

    }


    /*
       Reset wheel.
    */

    currentRotation = 0;


    document.getElementById(
        "wheel"
    ).style.transform =
        "rotate(0deg)";


    document.getElementById(
        "spinButton"
    ).disabled = false;


    entryScreen.classList.remove(
        "hidden"
    );


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


/* =====================================================
   FINISH GAME
===================================================== */

function finishGame() {

    wheelScreen.classList.add(
        "hidden"
    );

    entryScreen.classList.add(
        "hidden"
    );

    resultScreen.classList.add(
        "hidden"
    );

    finishedScreen.classList.remove(
        "hidden"
    );

}


/* =====================================================
   RESTART
===================================================== */

document
    .getElementById("restartButton")
    .addEventListener(
        "click",
        restartGame
    );


function restartGame() {

    const confirmed =
        confirm(
            "Restart the entire game? All removed names will return."
        );


    if (!confirmed) {

        return;

    }


    remainingParticipants =
        participants.slice();


    saveGame();


    currentRotation = 0;


    finishedScreen.classList.add(
        "hidden"
    );


    entryScreen.classList.remove(
        "hidden"
    );


    updateRemaining();

}


/* =====================================================
   START
===================================================== */

loadParticipants();
