import { DRILLING } from "../constants/drillingStatus";
import useFetch from "react-powertools/data/useFetch";
import { useCallback, useMemo } from "react";
import Fuse from "fuse.js";
import { ONLINE, OFFLINE } from "../constants/serverStatus";

export const GET_WELL_LIST = "/joblist.php";
export const SET_FAV_WELL = "/set_fav_job.php";
export const GET_WELL_INFO = "/wellinfo.php";
export const GET_WELL_SURVEYS = "/surveys.php";

const options = {
  shouldSort: true,
  threshold: 0.3,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 2,
  keys: ["name", "status"]
};

export function useWellsSearch(wells) {
  const fuse = useMemo(() => new Fuse(wells, options), [wells]);
  const search = useCallback(term => (term !== "" ? fuse.search(term) : wells), [fuse, wells]);

  return search;
}

const EMPTY_ARRAY = [];

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

  return [wells || EMPTY_ARRAY, updateFavorite];
}
