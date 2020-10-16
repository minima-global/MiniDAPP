import React from 'react'
import { NavLink } from 'react-router-dom'

import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'

import CheckTwoToneIcon from '@material-ui/icons/CheckTwoTone';
import AttachFileTwoToneIcon from '@material-ui/icons/AttachFileTwoTone'
import TocTwoToneIcon from '@material-ui/icons/TocTwoTone'

import { themeStyles } from '../../styles'

import { Paths, Local } from '../../config'

import { AddFile, CheckFile } from '../../containers/pages'
import { ListFiles } from './listFiles'

export const Home = () => {

  const themeClasses = themeStyles()

  return (
     <>
          <Grid container>

               <Grid container justify="center">

                    <Grid item container xs={4} justify="center">

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

                    <Grid item container xs={4} justify="center">

                        <NavLink to={Local.checkFile} className={themeClasses.homeLink}>
                            <Grid item>
                               <Paper className={themeClasses.home} elevation={0}>
                                 <CheckTwoToneIcon color="primary"/>
                               </Paper>
                            </Grid>
                            <Grid item>
                               <Paper className={themeClasses.home} elevation={0}>
                                   {Paths.checkFile}
                               </Paper>
                            </Grid>
                        </NavLink>

                     </Grid>

                     <Grid item container xs={4} justify="center">

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
