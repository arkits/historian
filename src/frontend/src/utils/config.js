const dev = {
    api: {
        url: 'http://localhost:4209/api'
    }
};

const prod = {
    api: {
        url: 'https://archit.xyz/historian/api'
    }
};

const config = !process.env.NODE_ENV || process.env.NODE_ENV === 'dev' ? dev : prod;

export default {
    // Add common config values here
    ...config
};
