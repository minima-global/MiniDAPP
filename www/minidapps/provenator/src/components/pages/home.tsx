import React from 'react'

import { AddFile } from '../../containers/pages'

import { themeStyles } from '../../styles'

import { Paths, Local } from '../../config'

export const Home = () => {

  const themeClasses = themeStyles()

  return (
     <>
         <AddFile />
    </>

  )
}
