import React from 'react'

import Markdown from 'react-markdown'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'

import { ChainInit } from '../blockchain/blockchain'

import { Main as MainMenu } from '../menus'
import { Footer } from './footer'
import { Content } from '../content'
import { App } from '../../config/strings'

import { themeStyles } from '../../styles'

import logo from '../../images/logo.png'
import minimaLogo from '../../images/minimaLogo.png'

export const Main = () => {

  const classes = themeStyles()

  return (
      <div className={classes.root}>
        <Grid container className={classes.grid}>

          <Paper className={classes.header} square={true}>
            <Grid item container xs={12}>
                <Grid item xs={1}>
                    <MainMenu />
                </Grid>
                <Grid item xs={10}>
                    <ChainInit />
                </Grid>
                <Grid item xs={1}>
                    <img className={classes.logo} src={logo}/>
                </Grid>
            </Grid>
          </Paper>

          <Paper className={classes.content} square={true}>
            <Grid item container xs={12}>
               <Grid item xs={1}>
                    &nbsp;
                </Grid>
                <Grid item xs={10}>
                    <Content />
                </Grid>
                <Grid item xs={1}>
                    &nbsp;
                </Grid>
            </Grid>
          </Paper>

          <Paper className={classes.footer} square={true}>
            <Grid item container xs={12}>
              <Grid item xs={12}>
                  <Footer />
              </Grid>
            </Grid>
          </Paper>

        </Grid>
      </div>
  )
}
