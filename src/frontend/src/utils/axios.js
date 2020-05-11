import * as axios from 'axios';
import config from './config';

const axiosInstance = axios.create({
    baseURL: config.api.url
});

export default axiosInstance;
