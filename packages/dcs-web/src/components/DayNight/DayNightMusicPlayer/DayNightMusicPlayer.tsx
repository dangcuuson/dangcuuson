import React from 'react';
import _ from 'lodash';
import MusicIcon from '@mui/icons-material/MusicNote';
import MusicOffIcon from '@mui/icons-material/MusicOff';
import { Box, IconButton } from '@mui/material';
import { useInteractionTracker, useIsWindowFocused, useLocalStorage } from '../../../utils/hooks';
import { CircularProgress } from '@mui/material';
import { useIsDarkMode } from '../DayNightStore';

const DaySong = require('./DaySong.mp3');
const NightSong = require('./NightSong.mp3');

const DayNightMusicPlayer: React.FC<{}> = () => {
    const isDarkMode = useIsDarkMode();
    const [isMutedByUser, setIsMutedByUser] = useLocalStorage<boolean>({
        key: 'is_muted',
        getInitValue: v => v === 'true'
    });
    const dayAudioRef = React.useRef<HTMLAudioElement>(null);
    const nightAudioRef = React.useRef<HTMLAudioElement>(null);

    const [daySongLoaded, setDaySongLoaded] = React.useState(false);
    const [nightSongLoaded, setNightSongLoaded] = React.useState(false);

    const [retryAutoplay, setRetryAutoplay] = React.useState(false);
    const interactionTracker = useInteractionTracker(retryAutoplay);
    const attemptAutoPlay = async () => {
        try {
            await Promise.all([
                dayAudioRef.current?.play(),
                nightAudioRef.current?.play()
            ]);
            setRetryAutoplay(false);
        } catch (err) {
            // Some browser prevent auto play until some "user interaction" has been initiated
            // https://developer.mozilla.org/en-US/docs/Web/Media/Autoplay_guide
            // set this flag to attempt to auto play again when some "interaction" happed
            setRetryAutoplay(true);
        }
    }

    React.useEffect(
        () => {
            if (retryAutoplay) {
                attemptAutoPlay();
            }
        },
        [interactionTracker]
    );

    React.useEffect(
        () => {
            if (daySongLoaded && nightSongLoaded && !isMutedByUser) {
                attemptAutoPlay();
            }
        },
        [daySongLoaded, nightSongLoaded, isMutedByUser]
    )

    React.useEffect(
        () => {
            // if the song is cached in browser, it may be ready before
            // onCanPlay callback is registered
            if (dayAudioRef.current?.HAVE_ENOUGH_DATA) {
                setDaySongLoaded(true);
            }
            if (nightAudioRef.current?.HAVE_ENOUGH_DATA) {
                setNightSongLoaded(true);
            }
        },
        []
    );

    React.useEffect(
        () => {
            if (dayAudioRef.current && nightAudioRef.current) {
                const dayAudio = dayAudioRef.current;
                const nightAudio = nightAudioRef.current;
                if (!isDarkMode) {
                    // phasing to day => sync dayAuto to nightAuto
                    dayAudio.currentTime = nightAudio.currentTime;
                } else {
                    nightAudio.currentTime = dayAudio.currentTime;
                }
                let count = 0;
                const interval = setInterval(
                    () => {
                        count++;
                        const dayVolume = isDarkMode ? (1 - count * 0.1) : count * 0.1;
                        const nightVolume = 1 - dayVolume;

                        // ios browser does not allow programmatically control volume (volume can't be to a number between 0 and 1)
                        // (volume will be reset back to 1)
                        if (count > 1 && dayAudio.volume === 1 && nightAudio.volume === 1) {
                            dayAudio.muted = isDarkMode;
                            dayAudio.volume = isDarkMode ? 0 : 1;
                            nightAudio.muted = !isDarkMode;
                            nightAudio.volume = !isDarkMode ? 0 : 1;
                            clearInterval(interval);
                            return;
                        }

                        dayAudio.volume = dayVolume;
                        nightAudio.volume = nightVolume;

                        // transistion done => clear interval
                        if (count === 10) {
                            clearInterval(interval);
                        }
                    },
                    100
                )
                return () => {
                    clearInterval(interval);
                }
            }
            return;
        },
        [isDarkMode]
    )

    let isWindowFocused = useIsWindowFocused();
    // for now let music play even if window is not focused
    isWindowFocused = true;
    return (
        <Box position="relative">
            {(!daySongLoaded || !nightSongLoaded) && !isMutedByUser && (
                <CircularProgress aria-label="Music is loading" style={{ position: 'absolute', left: 4, top: 4 }} />
            )}
            {!!daySongLoaded && nightSongLoaded && !!retryAutoplay && !isMutedByUser && (
                <CircularProgress aria-label="Require interaction to play music" variant="determinate" value={100} color="error" style={{ position: 'absolute', left: 4, top: 4 }} />
            )}
            <audio
                ref={dayAudioRef}
                src={DaySong}
                onCanPlay={() => setDaySongLoaded(true)}
                loop={true}
                muted={isMutedByUser || !isWindowFocused}
                playsInline={true}
            />
            <audio
                ref={nightAudioRef}
                src={NightSong}
                onCanPlay={() => setNightSongLoaded(true)}
                loop={true}
                muted={isMutedByUser || !isWindowFocused}
                playsInline={true}
            />
            <IconButton
                size="large"
                children={isMutedByUser ? <MusicOffIcon /> : <MusicIcon />}
                onClickCapture={() => setIsMutedByUser(!isMutedByUser)}
                aria-label={"Toggle background music"}
            />
        </Box>
    )
};

export default DayNightMusicPlayer;