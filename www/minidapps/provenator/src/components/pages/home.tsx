import React from 'react'
import { NavLink } from 'react-router-dom'

import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'

import FaceTwoToneIcon from '@material-ui/icons/FaceTwoTone'
import PersonAddTwoToneIcon from '@material-ui/icons/PersonAddTwoTone'
import CopyrightTwoToneIcon from '@material-ui/icons/CopyrightTwoTone'
import PublishTwoToneIcon from '@material-ui/icons/PublishTwoTone'
import AttachFileTwoToneIcon from '@material-ui/icons/AttachFileTwoTone'
import TocTwoToneIcon from '@material-ui/icons/TocTwoTone'
import AddTwoToneIcon from '@material-ui/icons/AddTwoTone'

import { themeStyles } from '../../styles'

import { Paths, Local } from '../../config'

import { AddFile } from '../../containers/pages'
import { ListFiles } from './listFiles'

export const Home = () => {

  const themeClasses = themeStyles()

  return (
     <>
          <Grid container>

               <Grid container justify="center">

                    <Grid item container xs={6} justify="center">

                        <NavLink to={Local.addFile} className={themeClasses.homeLink}>
                            <Grid item>
                               <Paper className={themeClasses.home} elevation={0}>
                                 <AttachFileTwoToneIcon color="primary"/>
                               </Paper>
                            </Grid>
                            <Grid item>
                               <Paper className={themeClasses.home} elevation={0}>
                                   {Paths.addFile}
                               </Paper>
                            </Grid>
                        </NavLink>

                     </Grid>

                     <Grid item container xs={6} justify="center">

                         <NavLink to={Local.listFiles} className={themeClasses.homeLink}>
                             <Grid item>
                                <Paper className={themeClasses.home} elevation={0}>
                                  <TocTwoToneIcon color="primary"/>
                                </Paper>
                             </Grid>
                             <Grid item>
                                <Paper className={themeClasses.home} elevation={0}>
                                    {Paths.listFiles}
                                </Paper>
                             </Grid>
                         </NavLink>

                      </Grid>

                   </Grid>

          </Grid>
    </>

  )
}
