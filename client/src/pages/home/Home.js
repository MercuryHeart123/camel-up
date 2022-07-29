import React, { useState } from 'react'
import { Navigate } from "react-router-dom";

const Home = (props) => {
    const [roomId, setRoomId] = useState()
    const [connectToRoom, setConnectToRoom] = useState(false)

    const joinRoom = () => {
        setConnectToRoom(true)
    }

    const createRoom = () => {
        var result = '';
        var characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < 6; i++) {
            result += characters.charAt(Math.floor(Math.random() *
                charactersLength));
        }
        setRoomId(result)
        setConnectToRoom(true)
    }

    if (connectToRoom) {
        return <Navigate to={`/room/${roomId}`} />

    }
    return <div style={{
        display: 'flex', height: '100vh', backgroundColor: '#FFFFF3'
        , alignItems: 'center', flexDirection: 'column', justifyContent: 'center'
    }}>
        <div style={{ padding: '2rem' }}>
            <input placeholder='username' onChange={(event) => {
                props.setName(event.target.value)
            }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
            <div>
                <button onClick={() => {
                    createRoom()
                }}>
                    Create Room
                </button>

            </div>
            <div>
                <input
                    placeholder='Room id'
                    onChange={(event) => {
                        setRoomId(event.target.value)
                    }} style={{ margin: '1rem' }} />
                <button onClick={() => {
                    joinRoom()
                }}>
                    Join Room
                </button>
            </div>
        </div>

    </div>
}

export default Home