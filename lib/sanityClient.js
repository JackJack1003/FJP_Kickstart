import sanityClient from '@sanity/client';

export const client = sanityClient({
  projectId: 'hw5gp0yu',
  dataset: 'production',
  apiVersion: 'v1',
  token:
    'sk3JcsWkLHEWGmR2MsFOVmszvjed1SpOwpiCKnUGWMDI7KsuShNIdoCvGsKlY5uIRVcVL0RwW3lFxcv1qSYmtbw8oGSOTeGEAR1IgHRvY7Mq5GHpLt28MLSPzdg1Hm5KFQDt1MC3lYdiNm3jBZiT6S0RpOXWJGTKvg1iWziGtWGhthYl4oHA',
  useCdn: false,
});
