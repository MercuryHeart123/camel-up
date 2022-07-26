import React, { useEffect, useState } from 'react'
import io from 'socket.io-client'
const socket = io.connect("http://localhost:8080")

function App() {
  const [camel, setCamel] = useState()
  const [trapPosition, setTrapPosition] = useState()
  const [trapValue, setTrapValue] = useState()
  const [lastMove, setLastMove] = useState()
  const [board, setBoard] = useState()
  const [coins, setCoins] = useState()

  const randomCamel = () => {
    socket.emit("random_camel")
  }

  useEffect(() => {
    socket.emit("init_data")

  }
    , [])

  useEffect(() => {
    socket.on('update_data', (data) => {
      let board = JSON.parse(data.board)
      let coins = JSON.parse(data.coins)
      console.log(data);
      let lastMove = JSON.parse(data.lastMove)
      console.log(coins);
      setCoins(coins)
      setBoard(board)
      setLastMove(lastMove)
    })

  }
    , [socket])

  const createBoard = () => {
    let tmpData = []
    for (const [key, value] of Object.entries(board)) {
      tmpData.push(
        <div>
          {key} {value.camels.map((item, index) => {
            return <span style={{ margin: "0 5px" }}>{item}</span>
          })} {value.trap.isSet ? "trap" : ""}
        </div>
      )
    }
    return tmpData
  }

  const setTrap = () => {
    socket.emit("set_trap", { position: trapPosition, value: trapValue })
  }
  return (
    <div>
      <div>
        <input
          onChange={(event) => {
            setTrapPosition(event.target.value)
          }}
        />
        <button onClick={() => { setTrapValue(1) }}>
          +1
        </button>
        <button onClick={() => { setTrapValue(-1) }}>
          -1
        </button>
        <button onClick={() => {
          setTrap()
        }}>
          set trap!
        </button>
      </div>
      <div>
        <button onClick={() => { randomCamel() }}>
          random
        </button>
        {lastMove && <div>
          {lastMove.camel}
          {lastMove.step}
        </div>}
        {board && createBoard()}
        {/* {board && board.map((item, index) => {
          console.log(item);
          return <div>
            {index} {item.camels}
          </div>
        })} */}
      </div>
    </div>
  )
}

export default App
