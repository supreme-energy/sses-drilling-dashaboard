import { DRILLING } from "../constants/drillingStatus";
import useFetch from "react-powertools/data/useFetch";
import { useCallback } from "react";

export const GET_WELL_LIST = "/joblist.php";
export const SET_FAV_WELL = "/set_fav_job.php";
export const GET_WELL_INFO = "/wellinfo.php";
export const GET_WELL_SURVEYS = "/surveys.php";

const markers = [
  [26.005, -96],
  [27.505, -97],
  [29.05, -97.5],
  [28.05, -97.3],
  [30.505, -95],
  [29.605, -96.2],
  [29.525, -96.3],
  [29.545, -96.1]
];

export function useWells() {
  const [wells, , , , , { fetch }] = useFetch(
    {
      path: GET_WELL_LIST
    },
    {
      transform: wells => {
        const pos = markers[Math.floor(Math.random() * 8)];
        return wells.map(w => ({
          id: w.jobname,
          name: w.realjobname,
          status: DRILLING,
          fav: Boolean(w.favorite),
          position: pos
        }));
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

  return [wells, updateFavorite];
}
