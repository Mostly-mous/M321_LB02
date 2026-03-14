import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

export default function FormPropsTextFields() {
    return (
        <Box
            component="form"
            sx={{ '& .MuiTextField-root': { m: 1, width: '25ch' } }}
            noValidate
            autoComplete="off"
        >
            <div>
                <TextField
                    required={true}
                    id="username-input"
                    label="username"
                    defaultValue="Please enter username ..."
                />
                <TextField
                    required={true}
                    id="password-input"
                    label="Password"
                    type="password"
                    autoComplete="current-password"
                />
            </div>
        </Box>
    );
}