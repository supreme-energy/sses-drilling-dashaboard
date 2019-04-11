import { DRILLING } from "../constants/drillingStatus";
import useFetch from "react-powertools/data/useFetch";

export const GET_WELL_LIST = "/joblist.php";
export const SET_FAV_WELL = "/set_fav_job.php";
export const GET_WELL_INFO = "/wellinfo.php";
export const GET_WELL_SURVEYS = "/surveys.php";

export function useWells() {
  return useFetch(
    {
      path: GET_WELL_LIST
    },
    {
      transform: wells => {
        return wells.map(w => ({
          id: w.jobname,
          name: w.realjobname,
          status: DRILLING
        }));
      }
    }
  );
}
