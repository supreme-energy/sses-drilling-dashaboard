export const MEDIA_URL = fileName => `/${fileName}`;
export const IMPORT = "import";
export const SETTINGS = "settings";
export const REVIEW_CLEAN_DATA = "review_clean_data";
export const REVIEW_MANUAL_IMPORT = "review_manual_import";
export const ALARM_ENABLED = "import_alarm_enabled";
export const ALARM = "import_alarm";
export const PULL = "pull_data";
export const PULL_INTERVAL = "pull_data_interval";

export const INITIAL_AUDIO_STATE = {
  [ALARM]: "",
  [ALARM_ENABLED]: 0
};

export const INITIAL_AUTO_IMPORT_STATE = {
  [PULL]: false,
  [PULL_INTERVAL]: 0
};
