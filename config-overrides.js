module.exports = function override(config, env) {
    const rules = config.module.rules;
    rules.forEach((rule) => {
      if (rule.oneOf) {
        rule.oneOf.forEach((one) => {
          if (one.loader && one.loader.includes('source-map-loader')) {
            one.exclude = [
              /node_modules[\\\/]face-api\.js/,
            ];
          }
        });
      }
    });
    return config;
  };
  