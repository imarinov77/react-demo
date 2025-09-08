import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Amplify } from 'aws-amplify'
import awsconfig from './aws-exports'

// Configure AWS Amplify at app startup
Amplify.configure(awsconfig)

// Temporary: log configured REST API names to diagnose InvalidApiName
// eslint-disable-next-line no-console
console.log('Configured REST APIs:', (awsconfig?.API?.REST?.endpoints || []).map(e => e.name))

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
