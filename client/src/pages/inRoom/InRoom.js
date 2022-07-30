
import React, { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import io from 'socket.io-client'
import Board from './board'

const InRoom = (props) => {
    let { roomId } = useParams()
    let { name } = props
    const [stackPile, setStackPile] = useState()
    const [trapPosition, setTrapPosition] = useState()
    const [trapValue, setTrapValue] = useState()
    const [lastMove, setLastMove] = useState()
    const [board, setBoard] = useState({})
    const [coins, setCoins] = useState()
    const [player, setPlayer] = useState()
    const [isGameStart, setIsGameStart] = useState(false)
    const [nextPlayer, setNextPlayer] = useState()
    const [gameStatus, setGameStatus] = useState()
    const [backToHome, setBackToHome] = useState(false)
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const newSocket = io("http://5610-184-82-201-68.ngrok.io");
        console.log(newSocket);
        newSocket.on('connect', (socket) => {
            newSocket.emit('join_room', { roomId, name })
        })

        setSocket(newSocket);
        newSocket.on('request_update', () => {
            newSocket.emit('init_data', roomId)
        })

        newSocket.on('update_data', (data) => {
            let { board, coins, players, lastMove, gameStatus, nextPlayer, isGameStart, stackPile } = data
            // let board = JSON.parse(data.board)
            // let coins = JSON.parse(data.coins)
            // let players = JSON.parse(data.players)
            // let lastMove = JSON.parse(data.lastMove)
            console.log(data);

            setStackPile(stackPile)
            setGameStatus(gameStatus)
            setIsGameStart(isGameStart)
            setPlayer(players)
            setCoins(coins)
            setBoard(board)
            setNextPlayer(nextPlayer)
            setLastMove(lastMove)
        })

        newSocket.on('request_data', () => {
            newSocket.emit('register_data', { roomId, name })
        })
        return () => newSocket.close();
    }, [setSocket]);

    const randomCamel = () => {
        socket.emit("random_camel", { roomId, name })
    }

    const initGame = () => {
        socket.emit('init_game', roomId)
    }

    const placeBet = (color, tier) => {

        socket.emit('place_bet', { color, tier, roomId, name })
    }

    const setTrap = () => {
        socket.emit("set_trap", { position: trapPosition, value: trapValue, roomId, name })
    }

    const createBetButton = (color) => {
        let tier = false
        if (isGameStart) {
            tier = !stackPile[color][0].owner ? 0
                : !stackPile[color][1].owner ? 1
                    : !stackPile[color][2].owner ? 2
                        : false

            // console.log(color, tier, stackPile[color][tier].win);

        }
        return <button
            disabled={nextPlayer == name && !gameStatus.isFinish && tier !== false ? false : true}
            onClick={() => { placeBet(color, tier) }}
        >
            {tier !== false && stackPile[color][tier].first}
            {color}
        </button>
    }

    const createStackPile = () => {
        let arr = []
        for (let color in stackPile) {
            arr.push(createBetButton(color))
        }
        return arr
    }

    if (backToHome) {
        return <Navigate to='/' />
    }
    return (
        <div style={{ display: 'flex', height: '100vh', alignItems: 'center' }}>
            <Board board={board} />
            <div style={{
                display: 'flex',
                justifyContent: 'space-around',

                flexDirection: 'column',
                height: '100vh'
            }}>
                <div>
                    {player && player.map((item, index) => {
                        return (
                            <div style={{ color: `${item == name ? 'red' : 'black'}`, display: 'flex' }}>
                                <div style={{ margin: '0 5px' }}>
                                    {item}
                                </div>
                                <div>
                                    coins :
                                    {coins[item]}
                                </div>
                            </div>
                        )
                    })}

                </div>
                <button disabled={isGameStart ? true : false} onClick={() => { initGame() }}>
                    init game
                </button>
                {gameStatus && <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {stackPile && createStackPile()}
                    <button
                        disabled={nextPlayer == name && !gameStatus.isFinish ? false : true}
                        onClick={() => { randomCamel() }}>
                        random
                    </button>
                    {lastMove && <div>
                        {lastMove.camel}
                        {lastMove.step}
                    </div>}
                    <input
                        disabled={nextPlayer == name && !gameStatus.isFinish ? false : true}
                        onChange={(event) => {
                            setTrapPosition(event.target.value)
                        }}
                    />
                    <button
                        disabled={nextPlayer == name && !gameStatus.isFinish ? false : true}
                        onClick={() => { setTrapValue(1) }}>
                        +1
                    </button>
                    <button
                        disabled={nextPlayer == name && !gameStatus.isFinish ? false : true}
                        onClick={() => { setTrapValue(-1) }}>
                        -1
                    </button>
                    <button
                        disabled={nextPlayer == name && !gameStatus.isFinish ? false : true}
                        onClick={() => {
                            setTrap()
                        }}>
                        set trap!
                    </button>

                </div>}
                <div>
                    <button onClick={() => { setBackToHome(true) }}>
                        Back
                    </button>



                </div>
            </div>

        </div >
    )
}

export default InRoom