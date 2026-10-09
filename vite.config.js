import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig(({command}) =>{
  return{
  plugins: [react()],
    base: command === 'build' ? '/tournament_brackets/' : '/'
  }
})
