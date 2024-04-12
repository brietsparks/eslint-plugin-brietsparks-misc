function getSettings(context) {
  const settings = context.settings['brietsparks-misc'] ?? {};
  if (!settings.alias) {
    throw new Error('"alias" setting is required');
  }
  if (!settings.aliasedPath) {
    throw new Error('"aliasedPath" setting is required');
  }

  return settings;
}

module.exports = {
  getSettings
};
