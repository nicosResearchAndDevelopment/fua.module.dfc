const
    Router = require('../src/Router.js'),
    route = Router();

// trim
route.use((source, output, next) => {
    const result = output.trim();
    next(null, result);
});

// capitalize
route.use((source, output, next) => {
    const result = output.charAt(0).toUpperCase() + output.substr(1);
    next(null, result);
});

// reduce gaps
route.use((source, output, next) => {
    const result = output.replace(/\s+/g, " ");
    next(null, result);
});


route(`  marzipan 
    ist lecker.
`).then(console.log).catch(console.error);