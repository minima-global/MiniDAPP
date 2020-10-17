import React from 'react'
//import { NavLink } from 'react-router-dom'
import BottomNavigation from '@material-ui/core/BottomNavigation'
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction'

import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'

import HomeTwoToneIcon from '@material-ui/icons/HomeTwoTone'
import CheckTwoToneIcon from '@material-ui/icons/CheckTwoTone';
import AttachFileTwoToneIcon from '@material-ui/icons/AttachFileTwoTone'
import TocTwoToneIcon from '@material-ui/icons/TocTwoTone'

import { history } from '../../utils'

import { themeStyles } from '../../styles'

import { Paths, Local } from '../../config'

export const Footer = () => {

  const [path, setPath] = React.useState(`${Local.home}`)

  const handleChange = (event: any, path: any) => {
    setPath(path)
    history.push(path)
  }

  const themeClasses = themeStyles()

  return (
     <>
          <Grid container>
              <Grid container justify="center">

                <BottomNavigation
                  value={path}
                  onChange={handleChange}
                  showLabels
                >
                  <BottomNavigationAction label={Paths.home} value={Local.home} icon={<HomeTwoToneIcon />} />
                  <BottomNavigationAction label={Paths.addFile} value={Local.addFile} icon={<AttachFileTwoToneIcon />} />
                  <BottomNavigationAction label={Paths.checkFile} value={Local.checkFile} icon={<CheckTwoToneIcon />} />
                  <BottomNavigationAction label={Paths.listFiles} value={Local.listFiles} icon={<TocTwoToneIcon />} />
                </BottomNavigation>

              </Grid>
          </Grid>
    </>

  )
}
