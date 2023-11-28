import { trspWhite, trspBlack, brand } from "./styles.js";
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
    'background': '#fff'
  },
  'brand': {
    'text': {
      'primary': brand[600],
      'secondary': brand[600],
      'teritary': brand[600],
    },
    'background': brand[500],
  },
  'transport': {
    'car': 'placeholder',
    'bike': 'placeholder',
    'public': 'placeholder',
  }
}

// DEMO-SPECIFIC CONFIG

export const colors = {
  seq: ['rgb(234, 236, 177)', 'rgb(169, 216, 145)', 'rgb(0, 167, 186)', 'rgb(0, 78, 166)', 'rgb(0, 13, 84)'],
  cat: ['#206095', '#A8BD3A', '#003C57', '#27A0CC', '#118C7B', '#F66068', '#746CB1', '#22D0B6', 'lightgrey']
}

export const units = {
  'density': 'sq.km',
  'age_med': 'years'
}

