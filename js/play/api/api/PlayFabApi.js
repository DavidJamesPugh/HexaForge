// play/api/api/PlayFabApi.js
import * as PlayFab from "playfab";

const MODULE = "PlayFab";

export default class PlayFabApi {
  constructor(customId) {
    PlayFab.settings.titleId = "1BFF70";
    this.customId = customId;
  }

  _getMetaVarName(key) {
    return `${key}-meta`;
  }

  init(callback) {
    logger.info(MODULE, "Init");
    this.login(callback);

    // Re-login every 12 hours
    setInterval(() => this.login(), 432e5);
  }

  login(callback) {
    logger.info(MODULE, "Login");

    const request = { CustomId: this.customId, CreateAccount: true };

    PlayFab.ClientApi.LoginWithCustomID(request, (result, error) => {
      if (result && result.code === 200) {
        logger.info(MODULE, "Logged in!", [result, error]);
        if (callback) callback();
      } else {
        logger.error(MODULE, "init failed!", [result, error]);
        if (callback) callback();
      }
    });
  }

  load(key, callback) {
    const request = { Keys: [key, this._getMetaVarName(key)] };

    PlayFab.ClientApi.GetUserData(request, (result, error) => {
      logger.info(MODULE, "Loaded!", [result, error]);
      if (result && result.code === 200) {
        try {
          const meta = JSON.parse(result.data.Data[this._getMetaVarName(key)].Value);
          const data = result.data.Data[key].Value;
          callback({ meta, data });
          return;
        } catch (e) {
          logger.error(MODULE, "load parse failed", e);
        }
      }
      logger.error(MODULE, "load failed!", [result, error]);
      callback(null);
    });
  }

  save(key, obj, callback) {
    const request = {
      Data: {
        [key]: obj.data,
        [this._getMetaVarName(key)]: JSON.stringify(obj.meta),
      },
    };

    PlayFab.ClientApi.UpdateUserData(request, (result, error) => {
      if (result && result.code === 200) {
        logger.info(MODULE, `Saved ${key}`, [result, error]);
        callback(true);
      } else {
        logger.error(MODULE, "Save failed!", [result, error]);
        callback(false);
      }
    });
  }

  submitStatistic(/* name, value, callback */) {
    // Not implemented in original
    return;
  }

  getSavesInfo(keys, callback) {
    const metaKeys = keys.map(k => this._getMetaVarName(k));
    const request = { Keys: metaKeys };

    PlayFab.ClientApi.GetUserData(request, (result, error) => {
      if (result && result.code === 200) {
        logger.info(MODULE, "getSavesInfo loaded!", [result, error]);

        const out = {};
        for (const key of keys) {
          const metaKey = this._getMetaVarName(key);
          try {
            if (result.data.Data[metaKey]?.Value) {
              out[key] = JSON.parse(result.data.Data[metaKey].Value);
            }
          } catch (e) {
            logger.error(MODULE, "getSavesInfo parse failed", e);
          }
        }
        callback(out);
        return;
      }
      logger.error(MODULE, "getSavesInfo failed!", [result, error]);
      callback({});
    });
  }
}
