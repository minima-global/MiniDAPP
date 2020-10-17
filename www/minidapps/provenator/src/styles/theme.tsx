import React from 'react'

import { createMuiTheme, responsiveFontSizes } from '@material-ui/core/styles'
import { makeStyles } from '@material-ui/styles'
import { withStyles } from '@material-ui/core/styles'

import Button from '@material-ui/core/Button'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import { Form } from 'formik'

import red from '@material-ui/core/colors/red'
import blue from '@material-ui/core/colors/blue'
import green from '@material-ui/core/colors/blue'
import indigo from '@material-ui/core/colors/indigo'
import orange from '@material-ui/core/colors/orange'
import yellow from '@material-ui/core/colors/yellow'

import GoogleFontLoader from 'react-google-font-loader'

//load this first
const fontLoader = () =>
    <GoogleFontLoader
      fonts={[
        {
          font: 'Barlow',
          weights: [400, '400i'],
        },
        {
          font: 'Lato',
          weights: [400, 500],
        },
      ]}
      subsets={['cyrillic-ext', 'greek']}
    />

let theme = createMuiTheme ({
  spacing: 8,
  typography: {
    fontFamily: [
      'Barlow',
      'Lato',
      'sans-serif',
      'Arial',
      'Roboto',
      '-apple-system',
    ].join(','),
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    h1: {
      fontSize: "2rem",
      fontWeight: 400,
      fontFamily: "\"Barlow\", \"Arial\", \"sans-serif\", \"Roboto\"",
      color: '#000000'
    },
    h2: {
      fontSize: "1.5rem",
      fontWeight: 400,
      fontFamily: "\"Barlow\", \"Arial\", \"sans-serif\", \"Roboto\"",
      color: '#000000'
    },
    h3: {
      fontSize: "1.25rem",
      fontWeight: 400,
      fontFamily: "\"Barlow\", \"Arial\", \"sans-serif\", \"Roboto\"",
      color: '#000000'
    },
    h4: {
      fontSize: "1.1rem",
      fontWeight: 400,
      fontFamily: "\"Barlow\", \"Arial\", \"sans-serif\", \"Roboto\"",
      color: '#000000'
    },
    subtitle1: {
      fontSize: "0.9rem",
      fontWeight: 400,
      fontFamily: "\"Barlow\", \"Arial\", \"sans-serif\", \"Roboto\"",
      lineHeight: "1.5em",
      color: '#000000'
    },
    body1: {
      fontSize: "0.875rem",
      fontWeight: 400,
      fontFamily: "\"Lato\", \"Arial\", \"sans-serif\", \"Roboto\"",
      lineHeight: "1.46429em",
      color: '#000000'
    },
    body2: {
      fontSize: "0.8rem",
      fontWeight: 400,
      fontFamily: "\"Lato\", \"Arial\", \"sans-serif\", \"Roboto\"",
      lineHeight: "1.4em",
      color: '#000000'
    },
    caption: {
      fontSize: "0.75rem",
      fontWeight: 400,
      fontFamily: "\"Lato\", \"Arial\", \"sans-serif\", \"Roboto\"",
      lineHeight: "1.375em",
      color: orange[900]
    },
    button: {
      fontSize: "0.875rem",
      textTransform: "uppercase",
      fontWeight: 500,
      fontFamily: "\"Lato\", \"Arial\", \"sans-serif\", \"Roboto\"",
      color: '#000000'
    }
  },
  palette: {
    type: 'dark',
    background: {
      default: '#FFFFFF',
    },
    text: {
      primary: "#000000",
      secondary: "#000000"
    },
    primary: {
      main: '#01acc6'
    },
    secondary: {
      main: '#ff671e'
    },
    error: red,
    warning: orange,
    info: yellow,
    success: green,
  }
})

theme = responsiveFontSizes(theme)
theme.spacing(4)

/*
Brand blue:
#38348B
Accent colours:
#377D82
#4CB79C
#A1D4C7
#F08363
#F08339
#FDC73E
#FFE6AF
White & grey:
#FFFFFF
#878382
*/

const themeStyles = makeStyles({
  root: {
    background: 'linear-gradient(#FFFFFF, #FFFFFF)',
    color: theme.palette.text.primary,
    height: "100%",
    width: "100%"
  },
  grid: {
    height: "100%",
    width: "100%"
  },
  logo: {
    padding: theme.spacing(1),
    margin: theme.spacing(1),    
    position: 'absolute',
  },
  header: {
    padding: theme.spacing(1),
    margin: theme.spacing(1),
    textAlign: 'left',
    background: 'linear-gradient(#27737e, #27737e)',
    width: "100%"
  },
  title: {
    padding: theme.spacing(1),
    margin: theme.spacing(1),
    textAlign: 'left',
    background: 'linear-gradient(#27737e, #27737e)'
  },
  subTitle: {
    padding: theme.spacing(1),
    margin: theme.spacing(1),
    textAlign: 'left',
    background: 'linear-gradient(#27737e, #27737e)'
  },
  content: {
    padding: theme.spacing(1),
    margin: theme.spacing(1),
    color: theme.palette.text.primary,
    background: 'linear-gradient(#FFFFFF, #FFFFFF)',
    height: "100%vh",
    width: "100%"
  },
  caption: {
    padding: theme.spacing(1),
    margin: theme.spacing(1),
    textAlign: 'center',
    background: 'linear-gradient(#27737e, #27737e)'
  },
  footer: {
    padding: theme.spacing(1),
    margin: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.primary,
    background: 'linear-gradient(#27737e, #27737e)',
    width: "100%"
  },
  home: {
    background: 'linear-gradient(#FFFFFF, #FFFFFF)',
    textAlign: 'center'
  },
  homeLink: {
    color: theme.palette.text.primary,
    textDecoration: 'none'
  },
  menu: {
    padding: theme.spacing(1),
    margin: theme.spacing(1),
    position: 'absolute',
    right: "1rem",
    fontSize: "2rem",
    textTransform: 'none',
    color: theme.palette.common.white,
    background: 'linear-gradient(#929396, #929396)'
  },
  spinner: {
     position: 'absolute',
     left: '50%',
     top: '50%',
     transform: 'translate(-50%, -50%)'
  }
})

export { fontLoader, theme, themeStyles }
