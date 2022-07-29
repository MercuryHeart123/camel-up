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
let standardInfo = {

    stackPile: {
        'white': {

        },
        'yellow': {

        },
        'orange': {

        },
        'green': {

        },
        'blue': {

        }
    },
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
    },
    gameStatus: {
        isFinish: false,
        winnerCamel: null
    },
    isGameStart: false
}


const initNewGame = (gameInfo) => {
    gameInfo.isGameStart = true
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
    let color = Object.keys(gameInfo.stackPile)
    for (let i = 0; i < color.length; i++) {
        for (let j = 0; j < 3; j++) {
            gameInfo.stackPile[color[i]][j] = {
                first: 5 - (j == 0 ? j : j + 1),
                second: 1,
                lose: 1,
                owner: null
            }

        }
    }
    gameInfo.gameStatus = {
        isFinish: false,
        winnerCamel: null
    }
    gameInfo.camelPosition = {
        'white': 0,
        'yellow': 0,
        'orange': 0,
        'green': 0,
        'blue': 0
    }
    gameInfo.remainCamel = JSON.parse(JSON.stringify(standardCamel))
    for (let i = 0; i < 5; i++) {
        rollDice(gameInfo, true)
    }
    console.log(gameInfo.stackPile);
    return gameInfo
}
const calculateBet = (gameInfo) => {
    let moneyReturn = {
        ...gameInfo.coins
    }
    let camelRanking = []
    for (let i = 0; i < 16; i++) {
        if (gameInfo.board[i].camels.length == 0) {
            continue
        }
        for (let j = 0; j < gameInfo.board[i].camels.length; j++) {
            camelRanking.unshift(gameInfo.board[i].camels[j])
        }
        if (camelRanking.length === 5) {
            break
        }
    }
    let color = Object.keys(gameInfo.stackPile)
    for (let i = 0; i < color.length; i++) {
        for (let j = 0; j < 3; j++) {
            if (!gameInfo.stackPile[color[i]][j].owner) {
                continue
            }
            if (camelRanking[0] === gameInfo.stackPile[color[i]]) {
                moneyReturn[gameInfo.stackPile[color[i]][j].owner] += gameInfo.stackPile[color[i]][j].first
            }
            else if (camelRanking[1] === gameInfo.stackPile[color[i]]) {
                moneyReturn[gameInfo.stackPile[color[i]][j].owner] += gameInfo.stackPile[color[i]][j].second
            }
            else {
                moneyReturn[gameInfo.stackPile[color[i]][j].owner] -= gameInfo.stackPile[color[i]][j].lose
            }

        }
    }
    gameInfo.coins = moneyReturn

    return gameInfo
}
const randomCamel = (gameInfo) => {

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
        gameInfo = calculateBet(gameInfo)
        let color = Object.keys(gameInfo.stackPile)

        for (let i = 0; i < color.length; i++) {
            for (let j = 0; j < 3; j++) {
                gameInfo.stackPile[color[i]][j] = {
                    win: 5 - (j == 0 ? j : j + 1),
                    lose: 1,
                    owner: null
                }

            }
        }
    }
    return { gameInfo, movingCamel, camelStep }
}

const rollDice = (gameInfo, start) => {
    let { movingCamel, camelStep } = randomCamel(gameInfo)
    if (start) {
        let presentPosition = gameInfo.camelPosition[movingCamel]
        gameInfo.board[presentPosition + camelStep].camels.push(movingCamel)
        gameInfo.camelPosition[movingCamel] = presentPosition + camelStep
        return { gameInfo }
    }
    let presentPosition = gameInfo.camelPosition[movingCamel]
    let positionInStack = gameInfo.board[presentPosition].camels.indexOf(movingCamel)
    let tmpArray = gameInfo.board[presentPosition].camels.slice(positionInStack)
    // let stackLength = gameInfo.board[presentPosition].camels.length
    let landingPosition = presentPosition + camelStep
    if (landingPosition >= 16) { // game set
        let winnerCamel = tmpArray.pop()
        return { gameInfo, winnerCamel }
    }
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

        gameInfo.board[presentPosition].camels.pop()
    }


    return { gameInfo }
}

const endTurn = (gameInfo) => {
    let lastPlayerIndex = gameInfo.players.indexOf(gameInfo.nextPlayer)
    let nextPlayerIndex
    if (lastPlayerIndex == gameInfo.players.length - 1) {
        nextPlayerIndex = 0
    }
    else {
        nextPlayerIndex = lastPlayerIndex + 1
    }
    gameInfo.nextPlayer = gameInfo.players[nextPlayerIndex]
    return { gameInfo }
}

let gameInfo = {
    isGameStart: false
}
let allGame = {

}
io.on('connection', (socket) => {

    socket.on('join_room', (data) => {
        let { roomId, name } = data
        if (!allGame[roomId]) {
            let gameInfo = JSON.parse(JSON.stringify(standardInfo))
            allGame[roomId] = {
                players: [name],
                ...gameInfo
            }
            // console.log('all', allGame);
        }

        else {
            if (allGame[roomId].players.indexOf(name) === -1 && !allGame[roomId].isGameStart) {
                allGame[roomId].players.push(name)
            }
        }
        // if (allGame[roomId]) {
        //     console.log(allGame[roomId].isGameStart, allGame[roomId].player);
        //     if (allGame[roomId].isGameStart && allGame[roomId].player.indexOf(name) === -1) {
        //         console.log('try to join stated game');
        //         return socket.emit('error', { message: 'try to join stated game' })
        //     }
        // }
        socket.join(roomId)
        // if (allGame[roomId].isGameStart) {
        if (allGame[roomId].isGameStart) {
            socket.emit("request_update")
        }
        else {
            io.to(roomId).emit("request_update")
        }
        // }

    })

    socket.on('init_game', (roomId) => {
        console.log("init game", roomId);
        let gameInfo = initNewGame(allGame[roomId])
        allGame[roomId] = gameInfo
        allGame[roomId].nextPlayer = allGame[roomId].players[0]
        console.log(allGame[roomId]);
        io.to(roomId).emit('request_data')
    })

    socket.on('register_data', (data) => {
        let { roomId, name } = data
        allGame[roomId].coins[name] = 0
        socket.emit("request_update")

    })

    socket.on('init_data', (roomId) => {

        socket.emit("update_data", allGame[roomId])

    })

    socket.on('random_camel', (data) => {
        let { roomId, name } = data
        console.log(data);
        if (name === allGame[roomId].nextPlayer) {
            let { winnerCamel } = rollDice(allGame[roomId])
            console.log(allGame[roomId].coins);
            allGame[roomId].coins[name]++

            endTurn(allGame[roomId])
            if (winnerCamel) {
                allGame[roomId].isGameStart = false
                allGame[roomId].gameStatus = {
                    isFinish: true,
                    winnerCamel
                }

            }

            io.to(roomId).emit("update_data", allGame[roomId])
        }

    })
    socket.on('place_bet', (data) => {
        let { camel, tier, roomId, name } = data
        if (name === allGame[roomId].nextPlayer) {
            if (allGame[roomId].stackPile[camel][tier].owner) {
                console.log("error", allGame[roomId].stackPile);
                socket.emit('error', { message: 'another player place this tier' })
                return
            }
            allGame[roomId].stackPile[camel][tier].owner = name
            endTurn(allGame[roomId])
            io.to(roomId).emit('update_data', allGame[roomId])
        }
    })
    socket.on('set_trap', (data) => {
        // let owner = socket.id
        let { position, value, roomId, name } = data
        console.log('set trap', data);

        if (name === allGame[roomId].nextPlayer) {
            if (allGame[roomId].board[parseInt(position) - 2].trap.isSet || allGame[roomId].board[parseInt(position)].trap.isSet
                || allGame[roomId].board[parseInt(position) - 1].camels.length != 0 || allGame[roomId].board[parseInt(position) - 1].trap.isSet
            ) {
                console.log("error", allGame[roomId].board);
                socket.emit('error', { message: 'need a space between trap' })
                return
            }
            allGame[roomId].board[parseInt(position) - 1].trap = {
                isSet: true,
                value,
                owner: name
            }
            endTurn(allGame[roomId])
            io.to(roomId).emit('update_data', allGame[roomId])
        }

    })

    socket.on('disconnect', function () {
        console.log(socket.id, "disconnect");
        // delete currentUser[socket.id];
    });
})

server.listen(8080, () => {
    console.log("SERVER IS RUNNING");
})