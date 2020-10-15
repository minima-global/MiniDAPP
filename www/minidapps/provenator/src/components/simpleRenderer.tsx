import React from 'react'

interface ArrayRenderProps {
    data: any[]
}

type Props = ArrayRenderProps

export const SimpleArrayRenderer = (props: Props) => {

    console.log("rendering: ", props.data, props.data.length)

    return (
        <>
            {props.data}
        </>
    )
}
