import { trspWhite, trspBlack, brand, car, bike, oepnv, greys } from "./styles.js";
// CORE CONFIG

export const themes = {
  'neutral': {
    'text': { 
      'primary': trspWhite[1000], 
      'secondary': trspWhite[600], 
      'teritary': trspWhite[400], 
    },
    'text-dark': { 
      'primary': trspBlack[1000], 
      'secondary': trspBlack[600], 
      'teritary': trspBlack[400], 
    },
    'muted': '#777',
    'pale': '#f0f0f0',
    'background': '#fff',
    'chartLines': greys[50],

  },
  'brand': {
    'text': {
      'primary': brand[600],
      'secondary': brand[600],
      'teritary': brand[600],
    },
    'background': brand[500],
    'muted': brand[100],
  },
  'car': {

    'primary': car[1000],
    'secondary': car[600],
    'teritary': car[200],
    'dark': '#AD6E10',
    'bright': '#EDE2C1',

  },

  'bike': {
    'primary': bike[1000],
    'secondary': bike[600],
    'teritary': bike[200],
    'dark': '#1a5241',
    'bright': '#50f8c3',
  },

  'oepnv': {

    'primary': oepnv[1000],
    'secondary': oepnv[600],
    'teritary': oepnv[200],
    'dark': '#195299',
    'bright': '#BDD4F5',
  },
  'purple': {
    'primary': '#3B2D53',
    'secondary': '#7453AC',
    'teritary': '#9A79D2',
    'quaternary': '#D1BAF7',
  }
}

// DEMO-SPECIFIC CONFIG

export const spacings = {
  'xs-4': 4,
  'x-8': 8,
  'm-12': 12,
  'd-16': 16,
  'l-24': 24,
  'xl-32': 32,
  'xxl-48': 48,
  'xxxl-64': 64,
  'xxxxl-96': 96,
}

export const colors = {
  seq: ['rgb(234, 236, 177)', 'rgb(169, 216, 145)', 'rgb(0, 167, 186)', 'rgb(0, 78, 166)', 'rgb(0, 13, 84)'],
  cat: ['#206095', '#A8BD3A', '#003C57', '#27A0CC', '#118C7B', '#F66068', '#746CB1', '#22D0B6', 'lightgrey']
}

export const units = {
  'density': 'sq.km',
  'age_med': 'years'
}

