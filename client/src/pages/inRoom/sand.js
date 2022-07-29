import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

const SandTile = styled.div`
    /* position: relative; */
   
    background-image: url("/img/sand.jpg");
    background-size: cover;
    background-repeat: no-repeat;
    border: solid 1px #e5e5e5;
    background-color:white;
    ${props => props.index == 1 ? 'border-top: dashed 10px black;' : ''}
`
const Camels = styled.div`

    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    flex-wrap: wrap;
`
const Sand = (props) => {
    let { i, j, board } = props
    // console.log(props);
    const [index, setIndex] = useState()
    const [camels, setCamels] = useState()
    const [trap, setTrap] = useState(false)

    useEffect(() => {
        if (i == 0) {
            setIndex(11 + j)
        }
        else if (i == 1) {
            if (j) {
                setIndex(16)
            }
            else {
                setIndex(10)
            }
        }
        else if (i == 2) {
            if (j) {
                setIndex(1)
            }
            else {
                setIndex(9)
            }
        }
        else if (i == 3) {
            if (j) {
                setIndex(2)
            }
            else {
                setIndex(8)
            }
        }
        else {
            setIndex(7 - j)
        }
    }, [])

    useEffect(() => {
        let length = Object.keys(board)
        if (length.length > 0) {
            setTrap(board[index - 1].trap.isSet)
            setCamels(board[index - 1].camels)
        }
    }
        , [board])


    const createCamel = () => {
        return <div>
            {trap ? 'trap' : ''}
            {camels.map((item, index) => {
                return <div>
                    {item}
                </div>
            })}
        </div>
    }
    return (
        <SandTile index={index}>
            {index}
            <Camels>
                {camels && createCamel()}

            </Camels>

        </SandTile>
    )
}

export default Sand