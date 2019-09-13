import { COMPLETED } from "../constants/drillingStatus";
import useFetch from "react-powertools/data/useFetch";
import { useCallback, useMemo, useEffect } from "react";
import Fuse from "fuse.js";
import memoizeOne from "memoize-one";
import { ONLINE, OFFLINE } from "../constants/serverStatus";
import { ON_VERTICAL } from "../constants/wellPathStatus";
import keyBy from "lodash/keyBy";
import _ from "lodash";
import { group } from "d3-array";
import proj4 from "proj4";
import { toWGS84 } from "../utils/projections";
import memoize from "react-powertools/memoize";
import serialize from "react-powertools/serialize";
import { useAppState, useCloudServerCountdownContainer } from "../modules/App/Containers";
import useRef from "react-powertools/hooks/useRef";
import { CURVE } from "../constants/wellSections";
import { DIP_FAULT_POS_VS } from "../constants/calcMethods";
import withFetchClient from "../utils/withFetchClient";
import { getWellsGammaExtent } from "../modules/Interpretation/selectors";
import isNumber from "../utils/isNumber";

export const GET_WELL_LIST = "/joblist.php";
export const SET_FAV_WELL = "/set_fav_job.php";
export const SET_WELL_FIELD = "/setfield.php";
export const GET_WELL_INFO = "/wellinfo.php";
export const GET_WELL_PLAN = "/wellplan.php";
export const GET_WELL_SURVEYS = "/surveys.php";
export const SET_WELL_SURVEY = "/setsurveyfield.php";
export const GET_WELL_PROJECTIONS = "/projections.php";
export const SET_WELL_PROJECTIONS = "/setprojectionfield.php";
export const ADD_WELL_PROJECTION = "/projection/add.php";
export const DELETE_WELL_PROJECTIONS = "/delete_projection.php";
export const GET_WELL_FORMATIONS = "/formationlist.php";
export const GET_WELL_CONTROL_LOG_LIST = "/controlloglist.php";
export const GET_WELL_CONTROL_LOG = "/controllog.php";
export const GET_WELL_LOG_LIST = "/wellloglist.php";
export const GET_WELL_LOG_DATA = "/welllog.php";
export const GET_ADDITIONAL_DATA_LOG = "/additiondatalog.php";
export const GET_ADDITIONAL_DATA_LOGS_LIST = "/additiondatalogslist.php";
export const GET_WELL_OPERATION_HOURS = "/analytics/rig_states.php";
export const GET_KPI = "/analytics/overview.php";
export const GET_TIME_SLIDER_DATA = "/analytics/edr_drilled.php";
export const GET_EMAIL_CONTACTS = "/email_contacts/list.php";
export const SET_EMAIL_CONTACT = "/email_contacts/update.php";
export const ADD_EMAIL_CONTACT = "/email_contacts/add.php";
export const DELETE_EMAIL_CONTACT = "/email_contacts/delete.php";
export const UPDATE_WELL_LOG = "welllog/update.php";
export const GET_FILE_CHECK = "/welllog/file_check.php";
export const UPLOAD_LAS_FILE = "/welllog/import.php";
export const GET_SURVEY_CHECK = "/survey/cloud/check.php";
export const GET_SURVEY_RANGE = "/survey/cloud/load_range.php";
export const GET_NEXT_SURVEY = "/survey/cloud/load_next.php";
export const DELETE_DIRTY_SURVEYS = "/survey/cloud/delete_dirty.php";
export const GET_CLEANED_SURVEYS = "/survey/history/list.php";
export const UPDATE_ADDITIONAL_LOG = "/adddata/update.php";
export const GET_BIT_PROJECTION = "/projection/bit_update.php";
// mock data
const GET_MOCK_ROP_DATA = "/rop.json";
const GET_MOCK_WELL_BORE_LIST = "/witslwellborelist.json";

const options = {
  shouldSort: true,
  threshold: 0.3,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 2,
  keys: ["name", "status"]
};

export const EMPTY_ARRAY = [];
const EMPTY_OBJECT = {};

function transform(data) {
  return data.map(d => _.mapValues(d, Number));
}

export function useWellsSearch(wells) {
  const fuse = useMemo(() => new Fuse(wells, options), [wells]);
  const search = useCallback(term => (term !== "" ? fuse.search(term) : wells), [fuse, wells]);

  return search;
}

const getWellsById = wells => keyBy(wells, "id");

export function useKpi(wellId) {
  return {
    bitDepth: 9712.39,
    rateOfPenetration: 9.74,
    wellPathStatus: ON_VERTICAL,
    wellRemaining: 0.15,
    depth: 571
  };
}

export function useWellInfo(wellId) {
  const { requestId, updateRequestId } = useAppState();
  const [data, isLoading, , , , { fetch }] = useFetch();
  const stateRef = useRef({ internalRequestId: null });
  const refreshStore = useCallback(() => {
    const newRequestId = Date.now();
    stateRef.current.internalRequestId = newRequestId;
    updateRequestId(newRequestId);
  }, [updateRequestId]);

  const serializedUpdateFetch = useMemo(() => serialize(fetch), [fetch]);
  const serializedRefresh = useMemo(() => serialize(fetch), [fetch]);

  const autorc = data && data.autorc;
  const online = autorc && data.autorc.host && data.autorc.username && data.autorc.password;
  const wellInfo = data && data.wellinfo;
  const emailInfo = data && data.emailinfo;
  const appInfo = data && data.appinfo;

  useEffect(() => {
    // avoid refresh on the component that trigger the update
    if (requestId !== stateRef.current.internalRequestId) {
      serializedRefresh(
        wellId !== undefined && {
          path: GET_WELL_INFO,
          query: {
            seldbname: wellId,
            requestId
          }
        },
        (prev, next) => next
      );
    }
  }, [wellId, serializedRefresh, requestId]);

  const updateWell = useCallback(
    ({ wellId, field, value, refreshStore }) => {
      const optimisticResult = {
        ...data,
        wellinfo: {
          ...wellInfo,
          [field]: value
        }
      };

      return serializedUpdateFetch({
        path: SET_WELL_FIELD,
        query: {
          seldbname: wellId
        },
        method: "POST",
        body: {
          wellinfo: {
            [field]: value
          }
        },
        cache: "no-cache",
        optimisticResult
      });
    },
    [serializedUpdateFetch, data, wellInfo]
  );

  const updateAutoRc = useCallback(
    ({ wellId, field, value, refreshStore }) => {
      const optimisticResult = {
        ...data,
        autorc: {
          ...autorc,
          [field]: value
        }
      };

      return serializedUpdateFetch({
        path: SET_WELL_FIELD,
        query: {
          seldbname: wellId
        },
        method: "POST",
        body: {
          autorc: {
            [field]: value
          }
        },
        cache: "no-cache",
        optimisticResult
      });
    },
    [serializedUpdateFetch, data, autorc]
  );

  const updateEmail = useCallback(
    ({ wellId, field, value }) => {
      const optimisticResult = {
        ...data,
        emailinfo: {
          ...emailInfo,
          [field]: value
        }
      };

      return serializedUpdateFetch({
        path: SET_WELL_FIELD,
        query: {
          seldbname: wellId
        },
        method: "POST",
        body: {
          emailinfo: {
            [field]: value
          }
        },
        cache: "no-cache",
        optimisticResult
      });
    },
    [serializedUpdateFetch, data, emailInfo]
  );

  const updateAppInfo = useCallback(
    ({ wellId, field, value }) => {
      const optimisticResult = {
        ...data,
        appinfo: {
          ...appInfo,
          [field]: value
        }
      };

      return serializedUpdateFetch({
        path: SET_WELL_FIELD,
        query: {
          seldbname: wellId
        },
        method: "POST",
        body: {
          appinfo: {
            [field]: value
          }
        },
        cache: "no-cache",
        optimisticResult
      });
    },
    [serializedUpdateFetch, data, appInfo]
  );

  const updateAutoImport = useCallback(
    ({ wellId, field, value }) => {
      const optimisticResult = {
        ...data,
        wellinfo: {
          ...wellInfo,
          [field]: value
        }
      };

      return serializedUpdateFetch({
        path: SET_WELL_FIELD,
        query: {
          seldbname: wellId
        },
        method: "POST",
        body: {
          wellinfo: {
            [field]: value
          }
        },
        cache: "no-cache",
        optimisticResult
      });
    },
    [serializedUpdateFetch, data, wellInfo]
  );

  const {
    wellSurfaceLocationLocal,
    wellSurfaceLocation,
    wellLandingLocation,
    wellLandingLocationLocal,
    wellPBHL,
    wellPBHLLocal
  } = useMemo(() => {
    if (!wellInfo) {
      return {};
    }
    const source = proj4.Proj("EPSG:32040");
    const transform = toWGS84(source);

    const wellSurfaceLocationLocal = {
      x: Number(wellInfo.survey_easting),
      y: Number(wellInfo.survey_northing)
    };
    const wellLandingLocationLocal = {
      x: Number(wellInfo.landing_easting),
      y: Number(wellInfo.landing_northing)
    };

    const wellPBHLLocal = {
      x: Number(wellInfo.pbhl_easting),
      y: Number(wellInfo.pbhl_northing)
    };

    const wellSurfaceLocation = transform(wellSurfaceLocationLocal);
    const wellLandingLocation = transform(wellLandingLocationLocal);
    const wellPBHL = transform(wellPBHLLocal);

    return {
      wellSurfaceLocationLocal,
      wellSurfaceLocation,
      wellLandingLocation,
      wellLandingLocationLocal,
      wellPBHL,
      wellPBHLLocal
    };
  }, [wellInfo]);

  return [
    {
      serverStatus: online ? ONLINE : OFFLINE,
      wellSurfaceLocationLocal,
      wellSurfaceLocation,
      wellLandingLocation,
      wellLandingLocationLocal,
      wellPBHL,
      wellPBHLLocal,
      autorc,
      wellInfo,
      emailInfo,
      appInfo,
      online,
      transform
    },
    isLoading,
    updateWell,
    refreshStore,
    updateEmail,
    updateAppInfo,
    updateAutoImport,
    updateAutoRc
  ];
}

export function useWells() {
  const { requestId } = useAppState();
  const [wells, , , , , { fetch }] = useFetch(
    {
      path: GET_WELL_LIST,
      query: { requestId }
    },
    {
      transform: wells => {
        // TODO get map source projection name from backend
        const source = proj4.Proj("EPSG:32040");
        const transform = toWGS84(source);

        return wells.map(w => {
          const surfacePos = transform({ x: Number(w.survey_easting), y: Number(w.survey_northing) });

          return {
            id: w.jobname,
            name: w.realjobname,
            status: COMPLETED,
            fav: Boolean(w.favorite),
            surfacePosition: [surfacePos.y, surfacePos.x]
          };
        });
      }
    }
  );

  const updateFavorite = useCallback(
    (seldbname, fav) =>
      fetch(
        {
          path: SET_FAV_WELL,
          query: {
            seldbname,
            favorite: Number(fav)
          }
        },
        currentWellList => {
          return currentWellList.map(v => {
            if (v.id === seldbname) {
              return {
                ...v,
                fav
              };
            }

            return v;
          });
        }
      ),
    [fetch]
  );
  const wellsById = useMemo(() => getWellsById(wells), [wells]);
  return [wells || EMPTY_ARRAY, wellsById, updateFavorite];
}

const groupBySection = memoize(data => {
  return group(data, d => d.A_interval);
});

export function useRopData() {
  const [data] = useFetch(
    {
      path: GET_MOCK_ROP_DATA
    },

    {
      id: "mock",
      transform: data => {
        return data.data;
      }
    }
  );
  const ropData = data || EMPTY_ARRAY;
  return [ropData, groupBySection];
}

const wellPathTransform = memoizeOne(transform);

export function useWellPath(wellId) {
  const [data, ...rest] = useFetch(
    {
      path: GET_WELL_PLAN,
      query: {
        seldbname: wellId
      }
    },
    {
      transform: wellPathTransform
    }
  );
  return [data || EMPTY_ARRAY, ...rest];
}

export function useWellsMapPosition(wellId, wellPositions) {
  const [wellInfo] = useWellInfo(wellId);

  return useMemo(() => {
    // TODO get map source projection from backend
    const source = proj4.Proj("EPSG:32040");
    const transform = toWGS84(source);
    function addMapPosition(p) {
      return {
        ...p,
        mapPosition: transform({
          y: Number(p.ns) + Number(wellInfo.wellSurfaceLocationLocal.y),
          x: Number(p.ew) + Number(wellInfo.wellSurfaceLocationLocal.x)
        })
      };
    }
    return wellInfo.wellSurfaceLocationLocal ? wellPositions.map(addMapPosition) : EMPTY_ARRAY;
  }, [wellPositions, wellInfo]);
}

export function useWellsMapLength(wellId, wellPositions) {
  const [wellInfo] = useWellInfo(wellId);

  return useMemo(() => {
    function addMapPosition(p) {
      return {
        ...p,
        mapPosition: {
          y: Number(p.ns) + Number(wellInfo.wellSurfaceLocationLocal.y),
          x: Number(p.ew) + Number(wellInfo.wellSurfaceLocationLocal.x)
        }
      };
    }
    return wellInfo.wellSurfaceLocationLocal ? wellPositions.map(addMapPosition) : EMPTY_ARRAY;
  }, [wellPositions, wellInfo]);
}

const surveysTransform = memoizeOne(data => {
  // Bit projection is not always in list of surveys
  const surveys = transform(data);
  const hasBitProj = surveys.some(s => s.plan === 1);
  return surveys.map((s, i, l) => {
    // If included, bit projection is always the last item and the last survey is second to last
    const isTieIn = i === 0;
    const isBitProj = i === l.length - 1 && hasBitProj;
    const isLastSurvey = i === l.length - 1 - hasBitProj * 1;
    return {
      ...s,
      name: isTieIn ? "Tie-in" : isBitProj ? "BPrj" : `${i}`,
      pos: isNumber(s.pos) ? s.pos : s.tcl - s.tvd,
      isTieIn: isTieIn,
      isBitProj: isBitProj,
      isSurvey: !isBitProj,
      isLastSurvey: isLastSurvey,
      color: isBitProj ? 0xff00ff : isLastSurvey ? 0x0000ff : 0xa6a6a6,
      alpha: 0.5,
      selectedColor: isBitProj ? 0xff00ff : isLastSurvey ? 0x0000ff : 0x000000,
      selectedAlpha: 1
    };
  });
});

export function useFetchSurveys(wellId) {
  const [data, isLoading, error, isPolling, isFetchingMore, { fetch, replaceResult, refresh }] = useFetch(
    {
      path: GET_WELL_SURVEYS,
      query: {
        seldbname: wellId
      }
    },
    {
      transform: surveysTransform
    }
  );

  const replaceResultCallback = useCallback(
    result => replaceResult(result, isLoading, error, isPolling, isFetchingMore),
    [isLoading, error, isPolling, isFetchingMore, replaceResult]
  );

  const serializedUpdateFetch = useMemo(() => serialize(fetch), [fetch]);

  const updateSurvey = useCallback(
    ({ surveyId, fields = {} }) => {
      const optimisticResult = data.map(d => {
        return d.id === surveyId ? { ...d, ...fields } : d;
      });

      return serializedUpdateFetch({
        path: SET_WELL_SURVEY,
        method: "GET",
        query: {
          seldbname: wellId,
          id: surveyId,
          ...fields
        },
        optimisticResult,
        cache: "no-cache"
      });
    },
    [serializedUpdateFetch, data, wellId]
  );

  return [data || EMPTY_ARRAY, { updateSurvey, refresh, replaceResult: replaceResultCallback, isLoading }];
}

const formationsTransform = memoizeOne(formationList => {
  return formationList.map(f => {
    return {
      ...f,
      data: transform(f.data)
    };
  });
});

export function useFetchFormations(wellId) {
  const [data, ...rest] = useFetch(
    {
      path: GET_WELL_FORMATIONS,
      query: {
        seldbname: wellId,
        data: 1
      }
    },
    {
      transform: formationsTransform
    }
  );
  return [data || EMPTY_ARRAY, ...rest];
}

const projectionsTransform = memoizeOne(projections => {
  return transform(projections);
});
export function useFetchProjections(wellId) {
  const [data, isLoading, error, isPolling, isFetchingMore, { fetch, replaceResult, refresh }] = useFetch(
    {
      path: GET_WELL_PROJECTIONS,
      query: {
        seldbname: wellId
      }
    },
    {
      transform: projectionsTransform
    }
  );

  const replaceResultCallback = useCallback(
    result => replaceResult(result, isLoading, error, isPolling, isFetchingMore),
    [isLoading, error, isPolling, isFetchingMore, replaceResult]
  );

  const serializedUpdateFetch = useMemo(() => serialize(fetch), [fetch]);

  const updateProjection = useCallback(
    ({ projectionId, fields = {} }) => {
      const optimisticResult = data.map(p => {
        return p.id === projectionId ? { ...p, ...fields } : p;
      });

      return serializedUpdateFetch({
        path: SET_WELL_PROJECTIONS,
        method: "GET",
        query: {
          seldbname: wellId,
          id: projectionId,
          ...fields
        },
        optimisticResult,
        cache: "no-cache"
      });
    },
    [serializedUpdateFetch, wellId, data]
  );

  function sortByMD(a, b) {
    if (a.md < b.md) return -1;
    if (a.md > b.md) return 1;
    return 0;
  }
  const addProjection = newProjection => {
    newProjection.method = newProjection.method || DIP_FAULT_POS_VS;
    const optimisticResult = [...(data || EMPTY_ARRAY), newProjection].sort(sortByMD);
    return fetch(
      {
        path: ADD_WELL_PROJECTION,
        method: "GET",
        query: {
          seldbname: wellId,
          ...newProjection
        },
        cache: "no-cache",
        optimisticResult
      },
      (currentProjections, result) => {
        if (result && result.status === "success" && result.projection) {
          return currentProjections.map(p => {
            if (p.id === newProjection.id) {
              return _.mapValues(result.projection, Number);
            }
            return p;
          });
        } else {
          return currentProjections.filter(p => p.id !== newProjection.id);
        }
      }
    );
  };

  const deleteProjection = projectionId => {
    const pendingDeletedProjection = data.find(p => p.id === projectionId);
    return fetch(
      {
        path: DELETE_WELL_PROJECTIONS,
        method: "GET",
        query: {
          seldbname: wellId,
          id: projectionId
        },
        cache: "no-cache",
        optimisticResult: data.filter(p => p.id !== projectionId)
      },
      (currentProjections, result) => {
        if (result && result.status === "success") {
          return currentProjections;
        }
        return [...currentProjections, pendingDeletedProjection].sort(sortByMD);
      }
    );
  };

  return [data || EMPTY_ARRAY, refresh, updateProjection, deleteProjection, addProjection, replaceResultCallback];
}

export function useWellOverviewKPI(wellId) {
  let [data] = useFetch(
    {
      path: GET_KPI,
      query: {
        seldbname: wellId
      }
    },
    {
      transform: data => {
        // Take the first job, which is the default for now
        const job = data[0];
        const phases = Object.keys(job).filter(p => p !== "id" && p !== "uid" && p !== "job" && job[p].interval_name);
        return phases.map(phase => {
          const phaseObj = job[phase];

          return {
            type: phaseObj.interval_name,
            id: _.uniqueId(),
            rop: Number(phaseObj.rop_avg),
            depth: Number(phaseObj.hole_depth_end),
            holeDepthStart: Number(phaseObj.hole_depth_start),
            bitSize: Number(phaseObj.holesize),
            casingSize: Number(phaseObj.casing_size),
            startTime: Number(phaseObj.dt_start),
            totalHours: Number(phaseObj.total_hours),
            drillingHours: Number(phaseObj.drill_hours),
            landingPoint: phaseObj.interval_name === CURVE ? phaseObj.hole_depth_end : 0,
            toolFaceEfficiency: Number(phaseObj.tool_face_effeciency),
            zoneAccuracy: 100, // TBD
            targetAccuracy: 98, // TBD,
            avgSliding: Number(phaseObj.rop_avg_sliding),
            avgRotating: Number(phaseObj.rop_avg_rotating),
            slidingPct: Number(phaseObj.slide_pct_d),
            rotatingPct: Number(phaseObj.rotate_pct_d)
          };
        });
      }
    }
  );

  data = data || EMPTY_ARRAY;

  const bySegment = useMemo(() => group(data, d => d.type), [data]);

  return {
    data,
    bySegment
  };
}

export function useTimeSliderData(wellId, minDepth, maxDepth) {
  const [data, , , , , { fetch }] = useFetch(
    wellId !== undefined &&
      minDepth !== undefined &&
      maxDepth && {
        path: GET_TIME_SLIDER_DATA,
        query: {
          seldbname: wellId,
          hole_depth_gte: minDepth,
          hole_depth_lte: maxDepth
        }
      },
    {
      transform: data => {
        return data.map(d => ({
          ...d,
          rop_a: Number(d.rop_a),
          astra_mse: Number(d.astra_mse)
        }));
      }
    }
  );

  const getTimeSliderData = useCallback(
    (wellId, minDepth, maxDepth) => {
      return fetch(
        wellId !== undefined &&
          minDepth !== undefined &&
          maxDepth && {
            path: GET_TIME_SLIDER_DATA,
            query: {
              seldbname: wellId,
              hole_depth_gte: minDepth,
              hole_depth_lte: maxDepth
            }
          },
        (current, result) => {
          const parsedRes = result.map(d => ({
            ...d,
            rop_a: Number(d.rop_a),
            astra_mse: Number(d.astra_mse)
          }));
          if (current) {
            return [...current, ...parsedRes];
          }
          return [...parsedRes];
        }
      );
    },
    [fetch]
  );

  return { data: data || EMPTY_ARRAY, getTimeSliderData };
}

export function useWellOperationHours(wellId) {
  const [data] = useFetch({
    path: GET_WELL_OPERATION_HOURS,
    query: {
      seldbname: wellId
    }
  });
  return data || EMPTY_ARRAY;
}

export function useWellControlLogList(wellId) {
  return useFetch(
    {
      path: GET_WELL_CONTROL_LOG_LIST,
      query: { seldbname: wellId, data: 1 }
    },
    {
      transform: logs => {
        return logs.map(l => ({
          ...l,
          data: l.data.map(d => ({ ...d, value: Number(d.value), tvd: Number(d.tvd) })),
          md: Number(l.md)
        }));
      }
    }
  );
}

export function useWellControlLog(tablename) {
  return useFetch({
    path: GET_WELL_CONTROL_LOG,
    query: { tablename }
  });
}

const transformWellLogData = memoize(logData => {
  const sortByDepth = (a, b) => a.depth - b.depth;

  return {
    ...logData,
    endvs: Number(logData.endvs),
    fault: Number(logData.fault),
    startvs: Number(logData.startvs),
    endtvd: Number(logData.endtvd),
    starttvd: Number(logData.starttvd),
    startmd: Number(logData.startmd),
    endmd: Number(logData.endmd),
    startdepth: Number(logData.startdepth),
    enddepth: Number(logData.enddepth),
    data: transform(logData.data).sort(sortByDepth)
  };
});

export function useWellLogData(wellId, tableName) {
  return useFetch(
    tableName &&
      wellId && {
        path: GET_WELL_LOG_DATA,
        query: { seldbname: wellId, tablename: tableName }
      },
    { transform: transformWellLogData }
  );
}

export const withWellLogsData = withFetchClient(
  GET_WELL_LOG_DATA,
  ({ logs, wellId }) => logs.map(log => ({ seldbname: wellId, tablename: log.tablename })),
  {
    mapResult: results => {
      return {
        logsDataResults: results,
        logsGammaExtent: [...getWellsGammaExtent(results)]
      };
    }
  }
);

export function useAdditionalDataLogsList(wellId) {
  const [data] = useFetch(
    {
      path: GET_ADDITIONAL_DATA_LOGS_LIST,
      query: {
        seldbname: wellId
      }
    },
    {
      transform: data => {
        return { data: data || EMPTY_ARRAY, dataBySection: keyBy(data, "label") };
      }
    }
  );

  return data || EMPTY_OBJECT;
}

const additionalDataLogTransform = memoizeOne(data => {
  return {
    label: data.label,
    scalelo: data.scalelo,
    scalehi: data.scalehi,
    color: data.color,
    count: data.data_count,
    data: transform(data.data)
  };
});

export function useAdditionalDataLog(wellId, id, loadLog) {
  const [data, , , , , { fetch }] = useFetch(
    id !== undefined &&
      wellId !== undefined && {
        path: GET_ADDITIONAL_DATA_LOG,
        query: {
          seldbname: wellId,
          id
        }
      },
    {
      transform: additionalDataLogTransform
    }
  );

  const updateAdditionalLogDetails = useCallback(
    (wellId, body) => {
      return fetch({
        path: UPDATE_ADDITIONAL_LOG,
        method: "POST",
        query: {
          seldbname: wellId
        },
        body
      });
    },
    [fetch]
  );

  return { data: data || EMPTY_OBJECT, updateAdditionalLogDetails };
}

export function useManualImport() {
  const [data, , , , , { fetch }] = useFetch();

  const getFileCheck = useCallback(
    (wellId, body) => {
      return fetch({
        path: GET_FILE_CHECK,
        method: "POST",
        headers: { Accept: "*/*" },
        query: {
          seldbname: wellId
        },
        body
      });
    },
    [fetch]
  );

  const uploadFile = useCallback(
    (wellId, filename) => {
      return fetch({
        path: UPLOAD_LAS_FILE,
        query: {
          seldbname: wellId,
          filename
        }
      });
    },
    [fetch]
  );

  return { data: data || EMPTY_OBJECT, getFileCheck, uploadFile };
}

export function useCloudServer(wellId) {
  const { countdown, interval } = useCloudServerCountdownContainer();
  const initialCall = useRef(false);

  const [data, , , , , { fetch }] = useFetch();

  const serializedRefresh = useMemo(() => serialize(fetch), [fetch]);

  const refreshData = useCallback(() => {
    return serializedRefresh(
      {
        path: GET_SURVEY_CHECK,
        query: {
          seldbname: wellId
        },
        cache: "no-cache"
      },
      (_, next) => next
    ).catch(err => err);
  }, [wellId, serializedRefresh]);

  // Trigger refresh when countdown hits zero
  useEffect(() => {
    if ((countdown === 0 && interval) || !initialCall.current) {
      refreshData();
      initialCall.current = true;
    }
  }, [interval, countdown, refreshData]);

  return { data: data || EMPTY_OBJECT, refresh: refreshData };
}

export function useCloudImportSurveys(wellId, dataId) {
  const [data, , , , , { fetch, refresh }] = useFetch(
    dataId !== undefined &&
      wellId !== undefined && {
        path: GET_CLEANED_SURVEYS,
        query: {
          seldbname: wellId,
          data: dataId
        }
      }
  );

  const importNewSurvey = useCallback(
    wellId => {
      return fetch({
        path: GET_NEXT_SURVEY,
        query: {
          seldbname: wellId
        },
        cache: "no-cache"
      });
    },
    [fetch]
  );

  const reimportSurveys = useCallback(
    (wellId, sdepth, edepth, groupid) => {
      const options = {
        path: GET_SURVEY_RANGE,
        query: {
          seldbname: wellId,
          sdepth,
          edepth,
          groupid
        }
      };

      if (groupid) {
        options.query.groupid = groupid;
        return fetch(options);
      } else {
        return fetch(options);
      }
    },
    [fetch]
  );

  const deleteSurveys = useCallback(
    wellId => {
      return fetch({
        path: DELETE_DIRTY_SURVEYS,
        query: {
          seldbname: wellId
        }
      });
    },
    [fetch]
  );

  return { data: data || EMPTY_ARRAY, importNewSurvey, reimportSurveys, deleteSurveys, refresh };
}
export function useEmailContacts(wellId) {
  const [data, , , , , { fetch, refresh }] = useFetch({
    path: GET_EMAIL_CONTACTS,
    query: {
      seldbname: wellId
    }
  });

  const addEmailContact = useCallback(
    (wellId, body) => {
      return fetch({
        path: ADD_EMAIL_CONTACT,
        method: "POST",
        query: {
          seldbname: wellId
        },
        body
      });
    },
    [fetch]
  );

  const deleteEmailContact = useCallback(
    (wellId, id) => {
      return fetch({
        path: DELETE_EMAIL_CONTACT,
        method: "GET",
        query: {
          seldbname: wellId,
          id
        }
      });
    },
    [fetch]
  );

  const updateEmailContact = useCallback(
    (wellId, body) => {
      return fetch({
        path: SET_EMAIL_CONTACT,
        method: "POST",
        query: {
          seldbname: wellId
        },
        body
      });
    },
    [fetch]
  );

  return {
    data: data || EMPTY_ARRAY,
    addEmailContact,
    deleteEmailContact,
    updateEmailContact,
    refresh
  };
}

export function useBitProjection(wellId) {
  const [data, , , , , { fetch, refresh }] = useFetch(
    {
      path: GET_BIT_PROJECTION,
      query: {
        seldbname: wellId
      }
    },
    {
      transform: data => transform(data)
    }
  );

  const updateBitProjection = useCallback(
    (wellId, body) => {
      return fetch({
        path: GET_BIT_PROJECTION,
        method: "POST",
        query: {
          seldbname: wellId
        },
        body
      });
    },
    [fetch]
  );

  return { data: data || EMPTY_OBJECT, updateBitProjection, refresh };
}

export function useWellBoreData() {
  const [data] = useFetch(
    {
      path: GET_MOCK_WELL_BORE_LIST
    },

    {
      id: "mock",
      transform: data => {
        return data.data;
      }
    }
  );
  return data || EMPTY_ARRAY;
}
