const PORT = 8000

const axios = require('axios')
const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()

app.use(cors())
app.use(express.json())

// BYPASS PROXY SERVER CERTIFICATE ISSUE - "Unable to find local issuer certificate"
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0

app.post('/generate', (req, res) => {
    const options = {
        method: 'GET',
        url: 'https://sudoku-board.p.rapidapi.com/new-board',
        params: { diff: req.body.level, stype: 'string' },
        headers: {
            'X-RapidAPI-Host': 'sudoku-board.p.rapidapi.com',
            'X-RapidAPI-Key': process.env.RAPID_API_KEY
        }
    }

    axios.request(options).then(response => {
        res.json(response.data)
    }).catch(error => {
        console.error(error)
        res.status(500).send({
            message: 'An unknown error occurred while calling generate puzzle api'
        })
    })
})

app.post('/solve', (req, res) => {
    const options = {
        method: 'GET',
        url: 'https://sudoku-board.p.rapidapi.com/solve-board',
        params: {
            sudo: req.body.board,
            stype: 'string'
        },
        headers: {
            'X-RapidAPI-Host': 'sudoku-board.p.rapidapi.com',
            'X-RapidAPI-Key': process.env.RAPID_API_KEY
        }
    }

    axios.request(options).then(response => {
        res.json(response.data)
    }).catch(error => {
        console.error(error)
        res.status(500).send({
            message: 'An unknown error occurred while calling solve puzzle api'
        })
    })
})

app.listen(PORT, () => console.log(`Server listening on PORT ${PORT}`))



