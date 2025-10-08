// src/styles/theme.js

export const buttonStyles = {
    base: 'rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors',
    sizes: {
      sm: 'px-3 py-1.5 text-body-sm',
      md: 'px-4 py-2 text-body',
      lg: 'px-6 py-3 text-body-lg',
    },
    variants: {
      primary: 'bg-primary hover:bg-primary-dark text-white focus:ring-primary',
      secondary: 'bg-secondary hover:bg-secondary-dark text-white focus:ring-secondary',
      outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
      ghost: 'text-primary hover:bg-primary/10',
    },
  };
  
  export const inputStyles = {
    base: 'block w-full rounded-md border-gray-600 shadow-sm focus:border-primary focus:ring-primary bg-gray-800 text-white',
    sizes: {
      sm: 'px-3 py-1.5 text-body-sm',
      md: 'px-4 py-2 text-body',
      lg: 'px-6 py-3 text-body-lg',
    },
    states: {
      error: 'border-error focus:border-error focus:ring-error',
      success: 'border-success focus:border-success focus:ring-success',
    },
  };

  export const textStyles = {
    display1: 'text-display-1 font-heading font-bold text-foreground',
    display2: 'text-display-2 font-heading font-bold text-foreground',
    display3: 'text-display-3 font-heading font-bold text-foreground',
    h1: 'text-h1 font-heading font-bold text-foreground',
    h2: 'text-h2 font-heading font-bold text-foreground',
    h3: 'text-h3 font-heading font-bold text-foreground',
    h4: 'text-h4 font-heading font-bold text-foreground',
    bodyLg: 'text-body-lg font-sans text-foreground',
    body: 'text-body font-sans text-muted-foreground',
    bodySm: 'text-body-sm font-sans text-muted-foreground',
    caption: 'text-caption font-sans text-muted-foreground',
  };