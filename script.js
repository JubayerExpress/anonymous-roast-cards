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
   LOCAL STORAGE
===================================================== */

const STORAGE_KEY =
    "anonymous_roast_remaining_v2";


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

const playerNameInput =
    document.getElementById(
        "playerName"
    );

const playerRollInput =
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

        console.log(
            "Loading participants..."
        );


        const response =
            await fetch(API_URL);


        if (!response.ok) {

            throw new Error(
                "API request failed."
            );

        }


        participants =
            await response.json();


        console.log(
            "Participants received:",
            participants
        );


        if (
            !Array.isArray(participants)
            ||
            participants.length === 0
        ) {

            throw new Error(
                "No participants found."
            );

        }


        /*
         * Restore saved game state.
         */

        restoreGame();


    } catch (error) {

        console.error(
            "Loading error:",
            error
        );


        entryError.textContent =
            "Could not load participants. Check your Google Sheet API.";

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


    /*
     * No previous game.
     */

    if (!saved) {

        remainingParticipants =
            participants.slice();

        saveGame();

        updateRemaining();

        return;

    }


    try {

        const savedIds =
            JSON.parse(saved);


        /*
         * Make sure savedIds is actually an array.
         */

        if (
            !Array.isArray(savedIds)
        ) {

            throw new Error(
                "Invalid saved game."
            );

        }


        /*
         * Restore participants that are
         * still in the remaining pool.
         */

        remainingParticipants =
            participants.filter(
                person =>
                    savedIds.includes(
                        String(person.id)
                    )
            );


        /*
         * If somehow the saved list is empty,
         * start fresh.
         */

        if (
            remainingParticipants.length === 0
        ) {

            remainingParticipants =
                participants.slice();

            saveGame();

        }


    } catch (error) {

        console.error(
            "Restore error:",
            error
        );


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


    console.log(
        "Game saved:",
        ids
    );

}


/* =====================================================
   UPDATE REMAINING COUNTER
===================================================== */

function updateRemaining() {

    document.getElementById(
        "remainingCount"
    ).textContent =
        remainingParticipants.length;

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
   ENTER BUTTON
===================================================== */

document
    .getElementById(
        "enterButton"
    )
    .addEventListener(
        "click",
        enterParticipant
    );


/* =====================================================
   ENTER PARTICIPANT
===================================================== */

function enterParticipant() {

    entryError.textContent = "";


    const name =
        playerNameInput
            .value
            .trim();


    const roll =
        playerRollInput
            .value
            .trim();


    /* -----------------------------------------------
       Validate name
    ------------------------------------------------ */

    if (!name) {

        entryError.textContent =
            "Please enter your name.";

        return;

    }


    /* -----------------------------------------------
       Validate roll
    ------------------------------------------------ */

    if (!roll) {

        entryError.textContent =
            "Please enter your roll number.";

        return;

    }


    /* -----------------------------------------------
       Find participant in Google Sheet
    ------------------------------------------------ */

    const player =
        participants.find(
            person =>
                normalize(person.name) ===
                normalize(name)
                &&
                String(person.roll).trim() ===
                String(roll).trim()
        );


    /* -----------------------------------------------
       Invalid participant
    ------------------------------------------------ */

    if (!player) {

        entryError.textContent =
            "Name and Roll Number do not match our participant list.";

        return;

    }


    /* -----------------------------------------------
       Check whether player is still part
       of the game
    ------------------------------------------------ */

    const playerStillRemaining =
        remainingParticipants.some(
            person =>
                String(person.id) ===
                String(player.id)
        );


    /*
     * If the player's name was already selected
     * previously, they cannot participate again.
     */

    if (!playerStillRemaining) {

        entryError.textContent =
            "This participant has already been selected and removed from the game.";

        return;

    }


    /* -----------------------------------------------
       Set current player
    ------------------------------------------------ */

    currentPlayer = player;


    /* -----------------------------------------------
       Find possible targets
       
       IMPORTANT:
       Current player's own name is excluded
       ONLY for this spin.
       
       It is NOT permanently removed.
    ------------------------------------------------ */

    const possiblePeople =
        remainingParticipants.filter(
            person =>
                String(person.id) !==
                String(currentPlayer.id)
        );


    /* -----------------------------------------------
       No target available
    ------------------------------------------------ */

    if (
        possiblePeople.length === 0
    ) {

        entryError.textContent =
            "You are the last remaining participant. There is nobody else to select.";

        return;

    }


    /* -----------------------------------------------
       Update player information
    ------------------------------------------------ */

    document.getElementById(
        "currentPlayer"
    ).textContent =
        currentPlayer.name;


    document.getElementById(
        "currentRoll"
    ).textContent =
        currentPlayer.roll;


    updateRemaining();


    /* -----------------------------------------------
       Show wheel
    ------------------------------------------------ */

    entryScreen.classList.add(
        "hidden"
    );

    wheelScreen.classList.remove(
        "hidden"
    );


    /* -----------------------------------------------
       Draw wheel
    ------------------------------------------------ */

    renderWheel();


    console.log(
        "Current player:",
        currentPlayer
    );

    console.log(
        "Possible targets:",
        possiblePeople
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


    /*
     * Remove old names.
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
     * Get people who can be selected.
     
     * Current spinner is excluded.
     */

    const available =
        remainingParticipants.filter(
            person =>
                String(person.id) !==
                String(currentPlayer.id)
        );


    const total =
        available.length;


    if (
        total === 0
    ) {

        return;

    }


    /*
     * Create wheel names.
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
                translate(-50%, -50%)
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

    const wheel =
        document.getElementById(
            "wheel"
        );


    return (
        wheel.offsetWidth * 0.38
    );

}


/* =====================================================
   SPIN BUTTON
===================================================== */

document
    .getElementById(
        "spinButton"
    )
    .addEventListener(
        "click",
        spinWheel
    );


/* =====================================================
   SPIN WHEEL
===================================================== */

function spinWheel() {

    if (spinning) {

        return;

    }


    spinError.textContent = "";


    /* -----------------------------------------------
       Get available targets
    ------------------------------------------------ */

    const available =
        remainingParticipants.filter(
            person =>
                String(person.id) !==
                String(currentPlayer.id)
        );


    /* -----------------------------------------------
       No target
    ------------------------------------------------ */

    if (
        available.length === 0
    ) {

        spinError.textContent =
            "No other participant is available.";

        return;

    }


    spinning = true;


    document.getElementById(
        "spinButton"
    ).disabled = true;


    /* -----------------------------------------------
       Random selection
    ------------------------------------------------ */

    const randomIndex =
        Math.floor(
            Math.random() *
            available.length
        );


    selectedPerson =
        available[randomIndex];


    console.log(
        "Selected:",
        selectedPerson
    );


    /* -----------------------------------------------
       IMPORTANT
       
       Remove ONLY the selected person
       permanently.
       
       The spinner remains in the pool.
    ------------------------------------------------ */

    remainingParticipants =
        remainingParticipants.filter(
            person =>
                String(person.id) !==
                String(selectedPerson.id)
        );


    /* -----------------------------------------------
       Save immediately
    ------------------------------------------------ */

    saveGame();


    updateRemaining();


    /* -----------------------------------------------
       Wheel animation
    ------------------------------------------------ */

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


    /* -----------------------------------------------
       Wait for animation
    ------------------------------------------------ */

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
    .getElementById(
        "nextButton"
    )
    .addEventListener(
        "click",
        nextParticipant
    );


function nextParticipant() {

    currentPlayer = null;

    selectedPerson = null;


    playerNameInput.value = "";

    playerRollInput.value = "";


    entryError.textContent = "";


    resultScreen.classList.add(
        "hidden"
    );


    /*
     * If nobody remains,
     * game is finished.
     */

    if (
        remainingParticipants.length === 0
    ) {

        finishGame();

        return;

    }


    /*
     * Reset wheel.
     */

    currentRotation = 0;


    document.getElementById(
        "wheel"
    ).style.transform =
        "rotate(0deg)";


    document.getElementById(
        "spinButton"
    ).disabled = false;


    wheelScreen.classList.add(
        "hidden"
    );


    entryScreen.classList.remove(
        "hidden"
    );


    updateRemaining();


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
   RESTART GAME
===================================================== */

document
    .getElementById(
        "restartButton"
    )
    .addEventListener(
        "click",
        restartGame
    );


function restartGame() {

    const confirmed =
        confirm(
            "Restart the entire game? All selected names will return."
        );


    if (!confirmed) {

        return;

    }


    /*
     * Restore all participants.
     */

    remainingParticipants =
        participants.slice();


    saveGame();


    /*
     * Reset variables.
     */

    currentPlayer = null;

    selectedPerson = null;

    spinning = false;

    currentRotation = 0;


    /*
     * Reset wheel.
     */

    document.getElementById(
        "wheel"
    ).style.transform =
        "rotate(0deg)";


    /*
     * Reset inputs.
     */

    playerNameInput.value = "";

    playerRollInput.value = "";


    entryError.textContent = "";


    /*
     * Show entry screen.
     */

    finishedScreen.classList.add(
        "hidden"
    );

    wheelScreen.classList.add(
        "hidden"
    );

    resultScreen.classList.add(
        "hidden"
    );

    entryScreen.classList.remove(
        "hidden"
    );


    updateRemaining();

}


/* =====================================================
   START GAME
===================================================== */

loadParticipants();
