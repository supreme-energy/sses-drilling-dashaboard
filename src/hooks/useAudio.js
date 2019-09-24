import { useState, useCallback, useEffect } from "react";
import usePrevious from "react-use/lib/usePrevious";

const useAudio = url => {
  const [audio, setAudio] = useState(new Audio(url));
  const [playing, setPlaying] = useState(false);
  const prevUrl = usePrevious(url);

  const toggleOn = useCallback(() => setPlaying(true), []);
  const toggleOff = useCallback(() => setPlaying(false), []);

  useEffect(() => {
    if (playing) {
      audio.volume = 0.2;
      audio.currentTime = 0;
      audio.play();
    } else {
      audio.pause();
    }

    return () => audio.pause();
  }, [playing, audio]);

  useEffect(() => {
    if (prevUrl !== url) {
      playing && setPlaying(false);
      setAudio(new Audio(url));
    }
  }, [url, playing, prevUrl]);

  return [playing, toggleOn, toggleOff, setAudio];
};

export default useAudio;
