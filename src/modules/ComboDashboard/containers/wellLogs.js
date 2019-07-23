import memoizeOne from "memoize-one";
import useFetch from "react-powertools/data/useFetch";
import { GET_WELL_LOG_LIST, UPDATE_WELL_LOG, EMPTY_ARRAY } from "../../../api";
import { useMemo, useCallback } from "react";
import serialize from "react-powertools/serialize";
import keyBy from "lodash/keyBy";
import { createContainer } from "unstated-next";
import { useWellIdContainer } from "../../App/Containers";

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

  const serializedUpdateFetch = useMemo(() => serialize(fetch), [fetch]);

  const updateWellLog = useCallback(
    ({ id, fields = {} }) => {
      const optimisticResult = list.map(d => {
        return d.id === id ? { ...d, ...fields } : d;
      });

      return serializedUpdateFetch(
        {
          path: UPDATE_WELL_LOG,
          method: "POST",
          body: {
            seldbname: wellId,
            id: String(id),
            ...fields
          },
          optimisticResult,
          cache: "no-cache"
        },
        (original, newResult) => {
          console.log("original, new", original, newResult);
          return original.map(l => {
            if (Number(l.id) === Number(newResult.welllog.id)) {
              console.log("found", { ...mapLogList(newResult.welllog), test: "new stuff" });
            }
            return String(l.id) === String(newResult.welllog.id)
              ? { ...mapLogList(newResult.welllog), test: "new stuff" }
              : l;
          });
        }
      );
    },
    [serializedUpdateFetch, list, wellId]
  );

  const logs = logList || EMPTY_ARRAY;

  const logsById = useMemo(() => keyBy(logs, "id"), [logs]);
  return [logs, logsById, { updateWellLog }];
}

function useWellLogs() {
  const { wellId } = useWellIdContainer();
  return useWellLogList(wellId);
}

export const { Provider: WellLogsProvider, useContainer: useWellLogsContainer } = createContainer(useWellLogs);
