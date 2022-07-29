import React from 'react'
import styled from 'styled-components'
import Sand from './sand'

const ContainBoard = styled.div`
    display: grid;
    width: 700px;
    height: 700px;
    background-color: sandybrown;
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: repeat(5, 1fr);
`

const Board = (props) => {

    const createSquare = () => {
        let arr = []
        for (let i = 0; i < 5; i++) {
            let arr2 = []
            for (let j = 0; j < 5; j++) {

                arr2.push(

                    i == 0 || j == 0 || i == 4 || j == 4 ? <Sand i={i} j={j} board={props.board} /> : <div />

                )
            }
            arr.push(arr2)
        }
        return arr
    }
    return (
        <ContainBoard>
            {createSquare()}

        </ContainBoard>
    )
}

export default Board