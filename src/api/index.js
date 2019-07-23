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
import { useAppState } from "../modules/App/Containers";
import useRef from "react-powertools/hooks/useRef";

export const GET_WELL_LIST = "/joblist.php";
export const SET_FAV_WELL = "/set_fav_job.php";
export const SET_WELL_FIELD = "/setfield.php";
export const GET_WELL_INFO = "/wellinfo.php";
export const GET_WELL_PLAN = "/wellplan.php";
export const GET_WELL_SURVEYS = "/surveys.php";
export const SET_WELL_SURVEYS = "/setsurveyfield.php";
export const GET_WELL_PROJECTIONS = "/projections.php";
export const SET_WELL_PROJECTIONS = "/setprojectionfield.php";
export const DELETE_WELL_PROJECTIONS = "/delete_projection.php";
export const GET_WELL_FORMATIONS = "/formationlist.php";
export const GET_WELL_CONTROL_LOG = "/controlloglist.php";
export const GET_WELL_LOG_LIST = "/wellloglist.php";
export const GET_WELL_LOG_DATA = "/welllog.php";
export const GET_ADDITIONAL_DATA_LOG = "/additiondatalog.php";
export const GET_ADDITIONAL_DATA_LOGS_LIST = "/additiondatalogslist.php";
export const GET_WELL_OPERATION_HOURS = "/welloperationhours.php";
export const GET_KPI = "/kpis.php";

// mock data
const GET_MOCK_ROP_DATA = "/rop.json";
const GET_MOCK_TIME_SLIDER_DATA = "/timeSlider.json";

const options = {
  shouldSort: true,
  threshold: 0.3,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 2,
  keys: ["name", "status"]
};

const EMPTY_ARRAY = [];
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

  const online = data && data.autorc.host && data.autorc.username && data.autorc.password;
  const wellInfo = data && data.wellinfo;
  const emailInfo = data && data.emailinfo;

  useEffect(() => {
    // avoid refresh on the component that trigger the update
    if (requestId !== stateRef.current.internalRequestId) {
      serializedRefresh(
        {
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
          seldbname: wellId,
          table: "wellinfo",
          field,
          value
        },
        cache: "no-cache",
        optimisticResult
      });
    },
    [serializedUpdateFetch, data, wellInfo]
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
          seldbname: wellId,
          table: "emailinfo",
          field,
          value
        },
        cache: "no-cache",
        optimisticResult
      });
    },
    [serializedUpdateFetch, data, emailInfo]
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
      wellInfo,
      emailInfo,
      transform
    },
    isLoading,
    updateWell,
    refreshStore,
    updateEmail
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
  const [data] = useFetch(
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
  return data || EMPTY_ARRAY;
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
    const isBitProj = i === l.length - 1 && hasBitProj;
    const isLastSurvey = i === l.length - 1 - hasBitProj * 1;
    return {
      ...s,
      name: isBitProj ? `BPrj` : `${i}`,
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
  const [data] = useFetch(
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
  return data || EMPTY_ARRAY;
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
  const [data, , , , , { refresh }] = useFetch(
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
  return [data || EMPTY_ARRAY, refresh];
}

const projectionsTransform = memoizeOne(projections => {
  return transform(projections).map((p, i) => {
    return {
      ...p,
      name: `PA${i}`,
      isProjection: true,
      color: 0xee2211,
      selectedColor: 0xee2211,
      alpha: 0.5,
      selectedAlpha: 1
    };
  });
});
export function useFetchProjections(wellId) {
  const [data, , , , , { fetch, refresh }] = useFetch(
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
  const saveProjection = (projectionId, method, fields = {}) => {
    // return the promise so we can refresh AFTER the API call is done
    return fetch({
      path: SET_WELL_PROJECTIONS,
      method: "GET",
      query: {
        seldbname: wellId,
        id: projectionId,
        method: method,
        ...fields
      }
    });
  };
  const deleteProjection = projectionId => {
    return fetch({
      path: DELETE_WELL_PROJECTIONS,
      method: "GET",
      query: {
        seldbname: wellId,
        id: projectionId
      }
    });
  };
  return [data || EMPTY_ARRAY, refresh, saveProjection, deleteProjection];
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
        return data.data.map(d => ({
          type: d.INTERVAL_NAME,
          id: _.uniqueId(),
          rop: Number(d.ROP_AVG),
          depth: Number(d.HOLE_DEPTH_END),
          holeDepthStart: Number(d.HOLE_DEPTH_START),
          bitSize: Number(d.holesize),
          casingSize: Number(d.casingSize),
          startTime: Number(d.DT_START),
          totalHours: Number(d.TOTAL_HOURS),
          drillingHours: Number(d.D_HOURS),
          landingPoint: d.landingPoint,
          toolFaceEfficiency: Number(d.TOOLFACE_EFFICIENCY_PCT),
          zoneAccuracy: 100, // TBD
          targetAccuracy: 98, // TBD,
          footageDrilled: Number(d.FOOTAGE_DRILLED),
          avgSliding: Number(d.ROP_AVG_SLIDING),
          avgRotating: Number(d.ROP_AVG_ROTATING),
          slidingPct: Number(d.SLIDE_PCT_D),
          rotatingPct: Number(d.ROTATE_PCT_D)
        }));
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

export function useTimeSliderData() {
  const [data] = useFetch(
    {
      path: GET_MOCK_TIME_SLIDER_DATA
    },

    {
      id: "mock"
    }
  );
  return data || EMPTY_ARRAY;
}

const wellOperationTransform = memoizeOne(transform);

export function useWellOperationHours(wellId) {
  const [data] = useFetch(
    {
      path: GET_WELL_OPERATION_HOURS,
      query: {
        seldbname: wellId
      }
    },
    {
      transform: wellOperationTransform
    }
  );
  return data || EMPTY_ARRAY;
}

export function useWellControlLog(wellId) {
  return useFetch(
    {
      path: GET_WELL_CONTROL_LOG,
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

export function useWellLogList(wellId) {
  const [list, ...rest] = useFetch({
    path: GET_WELL_LOG_LIST,
    query: { seldbname: wellId }
  });

  const logList = useMemo(
    () =>
      list &&
      list.map(d => ({
        ...d,
        startmd: Number(d.startmd),
        endmd: Number(d.endmd),
        startdepth: Number(d.startdepth),
        enddepth: Number(d.enddepth)
      })),
    [list]
  );
  return [logList || EMPTY_ARRAY, ...rest];
}

export function useWellLogData(wellId, tableName) {
  const transformWellLogData = useMemo(() => {
    const sortByDepth = (a, b) => a.depth - b.depth;
    return memoizeOne(data => {
      return {
        ...data,
        data: data.data
          .map(d => ({ ...d, md: Number(d.md), tvd: Number(d.tvd), value: Number(d.value), depth: Number(d.depth) }))
          .sort(sortByDepth)
      };
    });
  }, []);

  return useFetch(
    tableName &&
      wellId && {
        path: GET_WELL_LOG_DATA,
        query: { seldbname: wellId, tablename: tableName }
      },
    { transform: transformWellLogData }
  );
}

export function useAdditionalDataLogsList(wellId) {
  const [data] = useFetch(
    {
      path: GET_ADDITIONAL_DATA_LOGS_LIST,
      query: {
        seldbname: wellId
      }
    },
    {
      transform: data => _.keyBy(data, "label")
    }
  );

  return data || EMPTY_OBJECT;
}

const additionalDataLogTransform = memoizeOne(data => {
  return {
    label: data.label,
    scalelo: data.scalelo,
    scalehi: data.scalehi,
    data: transform(data.data)
  };
});

export function useAdditionalDataLog(wellId, id, loadLog) {
  const [data] = useFetch(
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
  return data || EMPTY_OBJECT;
}
