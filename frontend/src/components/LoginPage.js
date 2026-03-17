import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Divider,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { login, register, saveSession } from '../services/api';

const DEFAULT_LOGIN = {
  email: '',
  password: '',
  role: 'employee',
};

const DEFAULT_REGISTER = {
  name: '',
  email: '',
  department: '',
  role: 'employee',
  password: '',
};

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState(DEFAULT_LOGIN);
  const [registerForm, setRegisterForm] = useState(DEFAULT_REGISTER);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitLogin = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError('');
    setSuccess('');
    setIsSubmitting(true);
    try {
      const res = await login(form);
      saveSession(res.data.token, res.data.user);
      onLogin(res.data.user);
    } catch (err) {
      setError(err?.response?.data?.error || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitRegister = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError('');
    setSuccess('');
    setIsSubmitting(true);
    try {
      await register(registerForm);
      setSuccess('Registration successful. Please login with your new account.');
      setMode('login');
      setForm({ ...form, email: registerForm.email, role: registerForm.role, password: '' });
      setRegisterForm(DEFAULT_REGISTER);
    } catch (err) {
      setError(err?.response?.data?.error || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Container maxWidth="md">
        <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: '80vh' }}>
          <Grid item xs={12} sm={10} md={7}>
            <Card
              component={motion.form}
              onSubmit={mode === 'login' ? submitLogin : submitRegister}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              sx={{
                borderRadius: 4,
                backdropFilter: 'blur(20px)',
                background: 'rgba(255,255,255,0.95)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              }}
            >
              <CardContent sx={{ p: 5 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, textAlign: 'center' }}>
                  {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                  {mode === 'login' ? 'Please login to continue' : 'Add your details to register'}
                </Typography>

                <Divider sx={{ mb: 3 }} />

                <Stack spacing={2.5}>
                  {mode === 'register' && (
                    <>
                      <TextField
                        label="Full Name"
                        value={registerForm.name}
                        onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                        fullWidth
                        required
                      />
                      <TextField
                        label="Department"
                        value={registerForm.department}
                        onChange={(e) => setRegisterForm({ ...registerForm, department: e.target.value })}
                        fullWidth
                      />
                    </>
                  )}

                  <TextField
                    label="Email Address"
                    value={mode === 'login' ? form.email : registerForm.email}
                    onChange={(e) =>
                      mode === 'login'
                        ? setForm({ ...form, email: e.target.value })
                        : setRegisterForm({ ...registerForm, email: e.target.value })
                    }
                    fullWidth
                    required
                  />

                  <TextField
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={mode === 'login' ? form.password : registerForm.password}
                    onChange={(e) =>
                      mode === 'login'
                        ? setForm({ ...form, password: e.target.value })
                        : setRegisterForm({ ...registerForm, password: e.target.value })
                    }
                    fullWidth
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <FormControl fullWidth>
                    <InputLabel id="role-label">Role</InputLabel>
                    <Select
                      labelId="role-label"
                      value={mode === 'login' ? form.role : registerForm.role}
                      label="Role"
                      onChange={(e) =>
                        mode === 'login'
                          ? setForm({ ...form, role: e.target.value })
                          : setRegisterForm({ ...registerForm, role: e.target.value })
                      }
                    >
                      <MenuItem value="employee">Employee</MenuItem>
                      <MenuItem value="manager">Manager</MenuItem>
                    </Select>
                  </FormControl>

                  {error && <Alert severity="error">{error}</Alert>}
                  {success && <Alert severity="success">{success}</Alert>}

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isSubmitting}
                    sx={{
                      py: 1.5,
                      fontWeight: 600,
                      borderRadius: 2,
                      background: 'linear-gradient(90deg, #667eea, #764ba2)',
                    }}
                  >
                    {isSubmitting
                      ? mode === 'login'
                        ? 'Signing In...'
                        : 'Creating Account...'
                      : mode === 'login'
                        ? 'Login'
                        : 'Register'}
                  </Button>

                  <Button
                    type="button"
                    variant="text"
                    sx={{ textTransform: 'none' }}
                    onClick={() => alert('Contact manager to reset password.')}
                  >
                    {mode === 'login' ? 'Forgot Password?' : 'Need help? Contact manager'}
                  </Button>

                  <Button
                    type="button"
                    variant="outlined"
                    onClick={() => {
                      setError('');
                      setSuccess('');
                      setMode((prev) => (prev === 'login' ? 'register' : 'login'));
                    }}
                  >
                    {mode === 'login' ? 'Not registered? Create account' : 'Are you registered? Login'}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
