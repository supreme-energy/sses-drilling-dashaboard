export const MEDIA_URL = fileName => `/${fileName}`;
export const IMPORT = "import";
export const AUTO = "auto";
export const MANUAL = "manual";
export const SETTINGS = "settings";
export const LASUPLOAD = "las_upload";
export const REVIEW = "review";
export const INITIALIZE = "initialize";
export const initialViewState = { [AUTO]: "", [MANUAL]: "" };
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
