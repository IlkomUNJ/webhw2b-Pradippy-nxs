import { defineConfig } from 'vite'
import adonisjs from '@adonisjs/vite/client'

export default defineConfig({
  logLevel: 'info',       
  clearScreen: false,    
  plugins: [
    adonisjs({
      entrypoints: ['resources/js/app.js'],
      reload: ['resources/views/**/*.edge'],
    }),
  ],
})