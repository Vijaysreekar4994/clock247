const ALARMS_KEY = 'alarmList';

export const saveAlarms = (alarms) => {
    localStorage.setItem(ALARMS_KEY, JSON.stringify(alarms));
};

export const loadAlarms = () => {
    const stored = localStorage.getItem(ALARMS_KEY);
    return stored ? JSON.parse(stored) : [];
};