import axios from 'axios';
const isDev = process.env.NODE_ENV === 'development';

export const api = isDev ? axios.create({
  baseURL: 'http://127.0.0.1:8000',
}) : axios;
