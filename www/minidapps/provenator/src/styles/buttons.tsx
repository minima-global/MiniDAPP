import React from 'react'

import { withStyles } from '@material-ui/core/styles'

import Button from '@material-ui/core/Button'

export const Okay = withStyles({
  root: {
    boxShadow: 'none',
    textTransform: 'none',
    fontSize: 16,
    padding: '6px 12px',
    border: '1px solid',
    lineHeight: 1.5,
    background:'linear-gradient(#929396, #929396)',
    backgroundColor: '#878382',
    borderColor: 'indigo',
    fontFamily: [
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      'Roboto',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    '&:hover': {
      backgroundColor: 'blue[700]',
      borderColor: 'indigo',
      boxShadow: 'none',
    },
    '&:active': {
      boxShadow: 'none',
      backgroundColor: 'indigo',
      borderColor: 'yellow',
    },
    '&:focus': {
      boxShadow: '0 0 0 0.2rem rgba(0,123,255,.5)',
    },
  },
})(Button)
