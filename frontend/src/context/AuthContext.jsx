import { createContext, useContext, useReducer, useEffect } from 'react';
import * as authApi from '../api/auth';

const AuthContext = createContext(null);

const initialState = { user: null, loading: true, error: null };

function reducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'LOGOUT':
      return { ...state, user: null, loading: false, error: null };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      dispatch({ type: 'SET_USER', payload: null });
      return;
    }
    authApi
      .getMe()
      .then((res) => dispatch({ type: 'SET_USER', payload: res.data }))
      .catch(() => {
        localStorage.removeItem('token');
        dispatch({ type: 'SET_USER', payload: null });
      });
  }, []);

  async function login(email, password) {
    const res = await authApi.login({ email, password });
    localStorage.setItem('token', res.data.token);
    dispatch({ type: 'SET_USER', payload: res.data.user });
    return res.data.user;
  }

  async function register(name, email, password) {
    const res = await authApi.register({ name, email, password });
    localStorage.setItem('token', res.data.token);
    dispatch({ type: 'SET_USER', payload: res.data.user });
    return res.data.user;
  }

  async function logout() {
    await authApi.logout();
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  }

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
