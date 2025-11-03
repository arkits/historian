// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 *
 * NOTE: You may see warnings about `eslint` configuration not being supported in Next.js 16.
 * These warnings come from the Nx withNx plugin (v22.0.2) automatically injecting eslint config,
 * which Next.js 16 has deprecated. These are cosmetic warnings and do not affect functionality.
 * The warnings will be resolved when Nx releases a version fully compatible with Next.js 16.
 *
 * ESLint should be run separately via: npx nx lint frontend
 **/
const nextConfig = {
    nx: {
        // Set this to true if you would like to to use SVGR
        // See: https://github.com/gregberge/svgr
        svgr: false
    }
};

module.exports = composePlugins(withNx)(nextConfig);
