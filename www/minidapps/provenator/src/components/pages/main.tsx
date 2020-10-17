import React from 'react'

import Markdown from 'react-markdown'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'

import { ChainInit } from '../blockchain/blockchain'

import { Main as MainMenu } from '../menus'
import { Footer } from './footer'
import { Content } from '../content'
import { App } from '../../config/strings'

import minimaLogo from '../../images/minimaLogo.png'

import { themeStyles } from '../../styles'

export const Main = () => {

  const classes = themeStyles()

  return (
      <div className={classes.root}>
        <Grid container className={classes.grid}>

          <Paper className={classes.header} square={true}>
            <Grid item container xs={12}>
                <Grid item xs={1}>
                  <img className={classes.logo} src={minimaLogo}/>
                </Grid>
                <Grid item xs={9}>
                  <h1>
                    {App.appName}
                  </h1>
                  <h3>
                    {App.catchLine}
                  </h3>
                </Grid>
                <Grid item xs={2}>
                    <ChainInit />
                    <MainMenu />
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

          <Footer />

        </Grid>
      </div>
  )
}
