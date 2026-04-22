const app = require('./apps');
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    const env = process.env.NODE_ENV || 'development';
    console.log(`\n✓ Server running on port ${PORT}`);
    console.log(`✓ Environment: ${env}`);
    console.log(`✓ API Base: http://localhost:${PORT}/api\n`);
});