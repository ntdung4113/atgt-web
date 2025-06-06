import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useTimer - Custom hook đếm ngược thời gian
 * @param {number} initialSeconds - Số giây bắt đầu
 * @param {boolean} isActive - Có bắt đầu đếm không
 * @param {function} onFinish - Callback khi hết giờ
 * @returns [timeLeft, start, pause, reset, running]
 */
function useTimer(initialSeconds, isActive = false, onFinish) {
    const [timeLeft, setTimeLeft] = useState(initialSeconds);
    const [running, setRunning] = useState(isActive);
    const timerRef = useRef();

    useEffect(() => {
        if (running && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && running) {
            setRunning(false);
            if (onFinish) onFinish();
        }
        return () => clearInterval(timerRef.current);
    }, [running, timeLeft, onFinish]);

    const start = useCallback(() => setRunning(true), []);
    const pause = useCallback(() => setRunning(false), []);
    const reset = useCallback((newSeconds = initialSeconds) => {
        setTimeLeft(newSeconds);
        setRunning(false);
    }, [initialSeconds]);

    return [timeLeft, start, pause, reset, running];
}

export default useTimer; 