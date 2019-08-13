import memoizeOne from "memoize-one";
import useFetch from "react-powertools/data/useFetch";
import { GET_WELL_LOG_LIST, UPDATE_WELL_LOG, EMPTY_ARRAY } from "../../../api";
import { useMemo, useCallback } from "react";
import keyBy from "lodash/keyBy";
import { createContainer } from "unstated-next";
import { useWellIdContainer } from "../../App/Containers";
import mapKeys from "lodash/mapKeys";

const mapLogList = d => ({
  ...d,
  fault: Number(d.fault),
  endvs: Number(d.endvs),
  startvs: Number(d.startvs),
  endtvd: Number(d.endtvd),
  starttvd: Number(d.starttvd),
  startmd: Number(d.startmd),
  endmd: Number(d.endmd),
  startdepth: Number(d.startdepth),
  enddepth: Number(d.enddepth),
  sectdip: Number(d.sectdip),
  scalebias: Number(d.scalebias),
  scalefactor: Number(d.scalefactor),
  id: Number(d.id) // UPDATE_WELL_LOG fetch action come with id string, GET_WELL_LOG_LIST return id as number
});

const transformLogs = memoizeOne(logs => {
  return logs && logs.map(mapLogList);
});

export function useWellLogList(wellId) {
  const [list, , , , , { fetch }] = useFetch({
    path: GET_WELL_LOG_LIST,
    query: { seldbname: wellId }
  });

  const logList = transformLogs(list);

  const updateWellLogs = useCallback(
    data => {
      const dataById = keyBy(data, "id");
      const optimisticResult = list.map(d => {
        return dataById[d.id]
          ? { ...d, ...mapKeys(dataById[d.id], (value, key) => (key === "dip" ? "sectdip" : key)) }
          : d;
      });

      return Promise.all(
        data.map(dataToSave => {
          return fetch(
            {
              path: UPDATE_WELL_LOG,
              method: "POST",
              body: {
                seldbname: wellId,
                ...dataToSave,
                id: String(dataToSave.id)
              },
              optimisticResult,
              cache: "no-cache"
            },
            (original, newResult) => {
              return original.map(l => {
                return String(l.id) === String(newResult.welllog.id) ? { ...mapLogList(newResult.welllog) } : l;
              });
            }
          );
        })
      );
    },
    [fetch, list, wellId]
  );

  const logs = logList || EMPTY_ARRAY;

  const logsById = useMemo(() => keyBy(logs, "id"), [logs]);
  return [logs, logsById, { updateWellLogs }];
}

function useWellLogs() {
  const { wellId } = useWellIdContainer();
  return useWellLogList(wellId);
}

export const { Provider: WellLogsProvider, useContainer: useWellLogsContainer } = createContainer(useWellLogs);
