document.addEventListener('DOMContentLoaded', () => {
    const puzzleBoard = document.querySelector('#puzzle')
    const solveButton = document.querySelector('#solveButton')
    const restartButton = document.querySelector('#restartButton')
    const solutionDisplay = document.querySelector('#solution')
    const difficultyLevel = document.querySelector('#difficulty')
    const squares = 81
    let submission = []

    //create empty board
    const createBoard = () => {

        //create grid inputs
        for (let i = 0; i < squares; i++) {
            const inputElement = document.createElement('input')
            inputElement.setAttribute('type', 'number')
            inputElement.setAttribute('min', 1)
            inputElement.setAttribute('max', 9)
            inputElement.addEventListener("input", function () {
                if (parseInt(this.value) > 9) {
                    this.value = 9
                }
            })

            //add section classes to odd areas in grid
            if (
                ((i % 9 == 0 || i % 9 == 1 || i % 9 == 2) && i < 21) ||
                ((i % 9 == 6 || i % 9 == 7 || i % 9 == 8) && i < 27) ||
                ((i % 9 == 3 || i % 9 == 4 || i % 9 == 5) && (i > 27 && i < 53)) ||
                ((i % 9 == 0 || i % 9 == 1 || i % 9 == 2) && i > 53) ||
                ((i % 9 == 6 || i % 9 == 7 || i % 9 == 8) && i > 53)
            ) {
                inputElement.classList.add('odd-section')
            }

            puzzleBoard.appendChild(inputElement)

        }
    }

    // generate board from api and fill inputs
    // will be called on start of application and restart button click
    const generateBoard = (isNewBoard = true) => {
        submission = []
        solutionDisplay.innerHTML = ''

        //is first time generating then create empty board first
        if (isNewBoard) {
            createBoard()
        }

        const request = { level: difficultyLevel.value}

        fetch('http://localhost:8000/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(request)
        }).then(async response => {
            var res = await response.json()
            return { data: res, status: response.status }
        }).then(res => {
            if (res.status !== 200) {
                throw new Error(res.data.message)
            }
            populateNewBoard(res.data, isNewBoard)
            restartButton.style.display = 'none'
            solveButton.style.display = 'block'
        }).catch(err => {
            emptyBoardValues()
            solveButton.disabled = true
            console.error(err)
            solutionDisplay.innerHTML = 'An unknown error occured while generating puzzle. Please try again after some time.'
        })
    }

    const emptyBoardValues = () => {
        const inputs = document.querySelectorAll('input')

        inputs.forEach((input, index) => {
            input.value = ''
            input.disabled = true
        })
    }

    //fill board input values from api response
    const populateNewBoard = ({ response }, isNewBoard) => {

        const { difficulty, "unsolved-sudoku": unsolved_sudoku } = response

        const inputs = document.querySelectorAll('input')

        if (unsolved_sudoku) {
            difficultyLevel.disabled = false
            solveButton.disabled = false
            solveButton.style.display = 'block'
            inputs.forEach((input, index) => {
                if (unsolved_sudoku[index] !== '.') {
                    input.value = unsolved_sudoku[index]
                    input.disabled = true
                }
                else {
                    input.value = ''
                    input.disabled = false
                }
            })
        } else {
            emptyBoardValues()
            solveButton.disabled = true
            solutionDisplay.innerHTML = 'An unknown error occured while generating puzzle. Please try again after some time.'
        }
    }

    //join input values in submission format 
    const joinPuzzleValues = () => {
        const inputs = document.querySelectorAll('input')
        inputs.forEach(input => {
            if (input.value) {
                submission.push(input.value)
            }
            else {
                submission.push('.')
            }
        })
    }

    //fill solution to board input values from api response
    const populateSolution = ({ response }, submission) => {

        const { solvable, solution } = response

        const inputs = document.querySelectorAll('input')

        if (solvable && solution) {
            inputs.forEach((input, index) => {
                input.value = solution[index]
            })
            solutionDisplay.innerHTML = (submission === solution) ? 'Hurray! you have done it right' : 'Sorry! your solution is incomplete or incorrect. This is the solution.'
        } else {
            solutionDisplay.innerHTML = 'This is not solvable'
        }
    }

    // Solve Puzzle
    const solve = () => {
        solveButton.disabled = true
        restartButton.disabled = false

        joinPuzzleValues()
        const request = { board: submission.join('') }

        fetch('http://localhost:8000/solve', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(request)
        }).then(async response => {
            var res = await response.json()
            return { data: res, status: response.status }
        }).then(res => {
            if (res.status !== 200) {
                throw new Error(res.data.message)
            }

            populateSolution(res.data, request.board)
            submission = []
            solveButton.style.display = 'none'
            restartButton.style.display = 'block'
        }).catch(err => {
            console.error(err)
            solutionDisplay.innerHTML = 'An unknown error occured while solving puzzle. Please try again.'
        })
    }

    // Restart wih new puzzle
    const restart = () => {
        solveButton.disabled = true
        restartButton.disabled = true
        difficultyLevel.disabled = true

        generateBoard(false)
    }

    solveButton.addEventListener('click', solve)
    restartButton.addEventListener('click', restart)
    difficultyLevel.addEventListener('change', restart)

    generateBoard()
})