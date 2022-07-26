const express = require('express')
const app = express()
const http = require("http")
const { Server } = require('socket.io')
const cors = require('cors')
const server = http.createServer(app)

app.use(cors())

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000"
    }
})

let standardCamel = ['white', 'yellow', 'orange', 'green', 'blue']

let gameInfo = {
    player: {},
    camelPosition: {
        'white': 0,
        'yellow': 0,
        'orange': 0,
        'green': 0,
        'blue': 0
    },
    remainCamel: JSON.parse(JSON.stringify(standardCamel)),
    board: {},
    coins: {},
    lastMove: {
        camel: '',
        step: 0
    }
}

for (let i = 0; i < 16; i++) {
    gameInfo.board[i] = {
        camels: [],
        trap: {
            isSet: false,
            value: 0,
            owner: null
        }
    }
}
const randomCamel = () => {


    let indexCamel = Math.floor(Math.random() * gameInfo.remainCamel.length)
    let movingCamel = gameInfo.remainCamel[indexCamel]
    gameInfo.remainCamel.splice(indexCamel, 1)
    let camelStep = Math.floor(Math.random() * 3) + 1
    gameInfo.lastMove = {
        camel: movingCamel,
        step: camelStep
    }
    if (gameInfo.remainCamel.length == 0) {
        gameInfo.remainCamel = JSON.parse(JSON.stringify(standardCamel))

        for (let i = 0; i < 16; i++) {
            gameInfo.board[i].trap = {
                isSet: false,
                value: 0,
                owner: null
            }
        }
    }
    return { movingCamel, camelStep }
}

const rollDice = (start) => {
    let { movingCamel, camelStep } = randomCamel()
    if (start) {
        let presentPosition = gameInfo.camelPosition[movingCamel]
        gameInfo.board[presentPosition + camelStep].camels.push(movingCamel)
        gameInfo.camelPosition[movingCamel] = presentPosition + camelStep
        return
    }
    let presentPosition = gameInfo.camelPosition[movingCamel]
    let positionInStack = gameInfo.board[presentPosition].camels.indexOf(movingCamel)
    let tmpArray = gameInfo.board[presentPosition].camels.slice(positionInStack)
    // let stackLength = gameInfo.board[presentPosition].camels.length
    let landingPosition = presentPosition + camelStep
    if (gameInfo.board[landingPosition].trap.isSet) {
        let { owner, value } = gameInfo.board[landingPosition].trap
        console.log("trap at", landingPosition, value, movingCamel);
        if (value === 1) {
            for (let i = 0; i < tmpArray.length; i++) {
                let camel = tmpArray[i]
                gameInfo.board[landingPosition + 1].camels.push(camel)
                gameInfo.camelPosition[camel] = presentPosition + camelStep + 1
            }
        }
        else if (value === -1) {
            for (let i = tmpArray.length - 1; i >= 0; i--) {
                let camel = tmpArray[i]
                console.log(camel, tmpArray);
                gameInfo.board[landingPosition - 1].camels.unshift(camel)
                gameInfo.camelPosition[camel] = presentPosition + camelStep - 1
            }
        }

        gameInfo.coins[owner]++
    }
    else {
        for (let i = 0; i < tmpArray.length; i++) {
            let camel = tmpArray[i]
            gameInfo.board[landingPosition].camels.push(camel)
            gameInfo.camelPosition[camel] = presentPosition + camelStep
        }
    }

    for (let i = 0; i < tmpArray.length; i++) {
        console.log("pop at", i);
        gameInfo.board[presentPosition].camels.pop()
    }


    return
}
for (let i = 0; i < 5; i++) {
    rollDice(true)
}
console.log(gameInfo.board);

io.on('connection', (socket) => {
    gameInfo.player[socket.id] = { socket }
    gameInfo.coins[socket.id] = 0

    socket.on('init_data', () => {
        let board = JSON.stringify(gameInfo.board)
        let coins = JSON.stringify(gameInfo.coins)
        let lastMove = JSON.stringify(gameInfo.lastMove)

        io.emit("update_data", { board, coins, lastMove })

    })

    socket.on('random_camel', () => {
        rollDice()

        gameInfo.coins[socket.id]++
        let board = JSON.stringify(gameInfo.board)
        let coins = JSON.stringify(gameInfo.coins)
        let lastMove = JSON.stringify(gameInfo.lastMove)
        io.emit("update_data", { board, coins, lastMove })
    })

    socket.on('set_trap', (data) => {
        let owner = socket.id
        let { position, value } = data


        if (gameInfo.board[parseInt(position) - 1].trap.isSet || gameInfo.board[parseInt(position) + 1].trap.isSet
            || gameInfo.board[position].camels.length != 0
        ) {
            console.log("error");
            socket.emit('error', { message: 'need a space between trap' })
            return
        }
        gameInfo.board[position].trap = {
            isSet: true,
            value,
            owner
        }
        let board = JSON.stringify(gameInfo.board)
        let coins = JSON.stringify(gameInfo.coins)
        io.emit('update_data', { board, coins })
    })

    socket.on('disconnect', function () {
        console.log(socket.id, "disconnect");
        // delete currentUser[socket.id];
    });
})

server.listen(8080, () => {
    console.log("SERVER IS RUNNING");
})