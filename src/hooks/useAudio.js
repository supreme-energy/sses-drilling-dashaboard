import { useState, useCallback, useEffect } from "react";
import usePrevious from "react-use/lib/usePrevious";

const useAudio = url => {
  const [audio, setAudio] = useState(new Audio(url));
  const [playing, setPlaying] = useState(false);
  const prevUrl = usePrevious(url);

  const toggleOn = useCallback(() => setPlaying(true), []);
  const toggleOff = useCallback(() => setPlaying(false), []);

  useEffect(() => {
    audio.volume = 0.2;
    playing ? audio.play() : audio.pause();
  }, [playing, audio]);

  useEffect(() => {
    if (prevUrl !== url) {
      setAudio(audio => {
        playing && setPlaying(false);
        return new Audio(url);
      });
    }
  }, [url, playing, prevUrl]);

  return [playing, toggleOn, toggleOff];
};

export default useAudio;
