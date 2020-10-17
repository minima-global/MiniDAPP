import React from 'react'
import { NavLink } from 'react-router-dom'

import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'

import CheckTwoToneIcon from '@material-ui/icons/CheckTwoTone';
import AttachFileTwoToneIcon from '@material-ui/icons/AttachFileTwoTone'
import TocTwoToneIcon from '@material-ui/icons/TocTwoTone'

import { themeStyles } from '../../styles'

import { Home as HomeConfig } from '../../config'

import { AddFile, CheckFile } from '../../containers/pages'
import { ListFiles } from './listFiles'

export const Home = () => {

  const themeClasses = themeStyles()

  return (
    <p>
      {HomeConfig.info}
    </p>

  )
}
