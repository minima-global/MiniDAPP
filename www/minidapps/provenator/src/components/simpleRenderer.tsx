import React from 'react'

interface ArrayRenderProps {
    data: any[]
}

type Props = ArrayRenderProps

export const SimpleArrayRenderer = (props: Props) => {

    console.log("rendering: ", props.data)

    return (
        <>
            {props.data}
        </>
    )
}
