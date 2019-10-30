import memoizeOne from "memoize-one";
import useFetch from "react-powertools/data/useFetch";
import { GET_WELL_LOG_LIST, UPDATE_WELL_LOG, EMPTY_ARRAY, useDebouncedSave } from "../../../api";
import { useMemo, useCallback, useRef } from "react";
import keyBy from "lodash/keyBy";
import { createContainer } from "unstated-next";
import { useWellIdContainer, useTimeSliderContainer } from "../../App/Containers";
import mapKeys from "lodash/mapKeys";
import serialize from "react-powertools/serialize";

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

const changeWellLogs = serialize((data, wellId, fetch) =>
  Promise.all(
    data.map(dataToSave => {
      return fetch({
        path: UPDATE_WELL_LOG,
        method: "POST",
        body: {
          seldbname: wellId,
          ...dataToSave,
          id: String(dataToSave.id)
        },
        cache: "no-cache"
      });
    })
  )
);

export function useWellLogList(wellId) {
  const [list, , , , , { fetch, replaceResult, refresh }] = useFetch({
    path: GET_WELL_LOG_LIST,
    query: { seldbname: wellId }
  });

  const internalState = useRef({ list });
  internalState.current.list = list;

  const [optimisticUpdateResult, updateWellLogsDebounced] = useDebouncedSave({ save: changeWellLogs });

  const updateWellLogs = useCallback(
    async data => {
      const dataById = keyBy(data, "id");
      const optimisticResult = internalState.current.list.map(d => {
        return dataById[d.id]
          ? { ...d, ...mapKeys(dataById[d.id], (value, key) => (key === "dip" ? "sectdip" : key)) }
          : d;
      });
      await updateWellLogsDebounced({ optimisticData: optimisticResult, saveArgs: [data, wellId, fetch] });
    },
    [updateWellLogsDebounced, fetch, wellId]
  );

  const logs = transformLogs(optimisticUpdateResult || list || EMPTY_ARRAY);
  const logsById = useMemo(() => keyBy(logs, "id"), [logs]);
  return [logs, logsById, { updateWellLogs, replaceResult, refresh }];
}

const filterWellLogs = memoizeOne((wellLogs, interval) => {
  return wellLogs.filter(log => interval.firstDepth <= log.startmd && log.endmd <= interval.lastDepth);
});

function useWellLogs() {
  const { sliderInterval } = useTimeSliderContainer();
  const { wellId } = useWellIdContainer();
  const [logs, logsById, actions] = useWellLogList(wellId);
  const filteredLogs = filterWellLogs(logs, sliderInterval);
  return [filteredLogs, logsById, logs, actions];
}

export const { Provider: WellLogsProvider, useContainer: useWellLogsContainer } = createContainer(useWellLogs);
