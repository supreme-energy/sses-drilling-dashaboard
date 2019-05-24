import { DRILLING } from "../constants/drillingStatus";
import useFetch from "react-powertools/data/useFetch";
import { useCallback, useMemo } from "react";
import Fuse from "fuse.js";
import { ONLINE, OFFLINE } from "../constants/serverStatus";
import { ON_VERTICAL } from "../constants/wellPathStatus";
import keyBy from "lodash/keyBy";
import _ from "lodash";
import { group } from "d3-array";

export const GET_WELL_LIST = "/joblist.php";
export const SET_FAV_WELL = "/set_fav_job.php";
export const GET_WELL_INFO = "/wellinfo.php";
export const GET_WELL_PLAN = "/wellplan.php";
export const GET_WELL_SURVEYS = "/surveys.php";
export const GET_WELL_PROJECTIONS = "/projections.php";
export const GET_WELL_FORMATIONS = "/formationlist.php";

// mock data
const GET_MOCK_OVERVIEW_KPI = "/wellOverviewKPI.json";
const GET_MOCK_ROP_DATA = "/rop.json";

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
  const [data] = useFetch({
    path: GET_WELL_INFO,
    query: {
      seldbname: wellId
    }
  });

  const online = data && data.autorc.host && data.autorc.username && data.autorc.password;

  return {
    serverStatus: online ? ONLINE : OFFLINE
  };
}

export function useWells() {
  const [wells, , , , , { fetch }] = useFetch(
    {
      path: GET_WELL_LIST
    },
    {
      transform: wells => {
        return wells.map(w => {
          const pos = [Math.random() * 5 + 28, -95 - Math.random() * 5];
          return {
            id: w.jobname,
            name: w.realjobname,
            status: DRILLING,
            fav: Boolean(w.favorite),
            position: pos
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
  return data || EMPTY_ARRAY;
}

export function useWellPath(wellId) {
  const [data] = useFetch(
    {
      path: GET_WELL_PLAN,
      query: {
        seldbname: wellId
      }
    },
    {
      transform: plan => {
        return plan.map(p => _.mapValues(p, Number));
      }
    }
  );
  return data || EMPTY_ARRAY;
}

export function useSurveys(wellId) {
  const [data] = useFetch(
    {
      path: GET_WELL_SURVEYS,
      query: {
        seldbname: wellId
      }
    },
    {
      transform: surveys => {
        return surveys.map(s => _.mapValues(s, Number));
      }
    }
  );
  return data || EMPTY_ARRAY;
}

export function useFormations(wellId) {
  const [data] = useFetch(
    {
      path: GET_WELL_FORMATIONS,
      query: {
        seldbname: wellId,
        data: 1
      }
    },
    {
      transform: formationList => {
        return formationList.map(f => {
          return {
            ...f,
            data: f.data.map(d => _.mapValues(d, Number))
          };
        });
      }
    }
  );
  return data || EMPTY_ARRAY;
}

export function useProjections(wellId) {
  const [data] = useFetch(
    {
      path: GET_WELL_PROJECTIONS,
      query: {
        seldbname: wellId
      }
    },
    {
      transform: projections => {
        return projections.map(p => _.mapValues(p, Number));
      }
    }
  );
  return data || EMPTY_ARRAY;
}

export function useWellOverviewKPI() {
  let [data] = useFetch(
    {
      path: GET_MOCK_OVERVIEW_KPI
    },

    {
      id: "mock",
      transform: data => {
        return data.data.map(d => ({
          type: d.INTERVAL_NAME,
          id: _.uniqueId(),
          rop: d.ROP_AVG,
          depth: d.HOLE_DEPTH_END,
          bitSize: d.holesize,
          casingSize: d.casingSize,
          startTime: d.DT_START,
          totalHours: d.TOTAL_HOURS,
          drillingHours: d.D_HOURS,
          landingPoint: d.landingPoint,
          toolFaceEfficiency: d.TOOLFACE_EFFICIENCY_PCT,
          zoneAccuracy: 100, // TBD
          targetAccuracy: 98, // TBD,
          footageDrilled: d.FOOTAGE_DRILLED,
          avgSliding: d.ROP_AVG_SLIDING,
          avgRotating: d.ROP_AVG_ROTATING,
          slidingFootage: d.SLIDING_FOOTAGE,
          rotatingFootage: d.ROTATING_FOOTAGE
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
