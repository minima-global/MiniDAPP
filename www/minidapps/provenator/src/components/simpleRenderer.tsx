import React from 'react'

interface ArrayRenderProps {
    data: any[]
}

type Props = ArrayRenderProps

export const SimpleArrayRenderer = (props: Props) => {

    return (
        <>
            {props.data}
        </>
    )
}
