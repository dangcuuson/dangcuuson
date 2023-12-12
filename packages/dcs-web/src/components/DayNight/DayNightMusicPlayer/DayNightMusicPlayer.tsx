import React from 'react';
import { DayNightContext } from '../DayNightContext';
import _ from 'lodash';
import MusicIcon from '@mui/icons-material/MusicNote';
import MusicOffIcon from '@mui/icons-material/MusicOff';
import { IconButton } from '@mui/material';
import { useLocalStorage } from '../../../utils/hooks';

const DaySong = require('./DaySong.mp3');
const NightSong = require('./NightSong.mp3');

const DayNightMusicPlayer: React.FC<{}> = () => {
    const { isNightMode } = React.useContext(DayNightContext);
    const [isMuted, setIsMuted] = useLocalStorage<boolean>({
        key: 'is_muted',
        getInitValue: v => v === 'true'
    });
    const dayAudioRef = React.useRef<HTMLAudioElement>(null);
    const nightAudioRef = React.useRef<HTMLAudioElement>(null);

    const [daySongLoaded, setDaySongLoaded] = React.useState(false);
    const [nightSongLoaded, setNightSongLoaded] = React.useState(false);

    React.useEffect(
        () => {
            if (daySongLoaded && nightSongLoaded) {
                dayAudioRef.current?.play();
                nightAudioRef.current?.play();
            }
        },
        [daySongLoaded, nightSongLoaded]
    )

    React.useEffect(
        () => {
            if (dayAudioRef.current && nightAudioRef.current) {
                const dayAudio = dayAudioRef.current;
                const nightAudio = nightAudioRef.current;
                const interval = setInterval(
                    () => {
                        const dayValChange = isNightMode ? -0.1 : 0.1;
                        const nightValChange = -dayValChange;


                        dayAudio.volume = _.clamp(dayAudio.volume + dayValChange, 0, 1);
                        nightAudio.volume = _.clamp(nightAudio.volume + nightValChange, 0, 1);
                    },
                    100
                )
                return () => {
                    clearInterval(interval);
                }
            }
        },
        [isNightMode]
    )
    return (
        <React.Fragment>
            <audio
                ref={dayAudioRef}
                src={DaySong}
                onCanPlay={() => setDaySongLoaded(true)}
                loop={true}
                muted={isMuted}
            />
            <audio
                ref={nightAudioRef}
                src={NightSong}
                onCanPlay={() => setNightSongLoaded(true)}
                loop={true}
                muted={isMuted}
            />
            <IconButton
                children={isMuted ? <MusicOffIcon /> : <MusicIcon />}
                onClick={() => setIsMuted(v => !v)}
            />
        </React.Fragment>
    )
};

export default DayNightMusicPlayer;