export const HISTOGRAM_SCALES = {
    x: {
        title: {
            display: true,
        },
        grid: {
            display: false,
        },
    },
    y: {
        beginAtZero: true,
        title: {
            display: true,
            text: 'Comptes',
        },
        grid: {
            display: false,
        },
        ticks: {
            precision: 0,
        },
    },
};

export const HISTOGRAM_PLUGINS = {
    legend: {
        display: false,
    },
    title: {
        display: true,
        text: '',
        font: {
            size: 24,
        },
        padding: {
            top: 10,
            bottom: 30,
        },
    },
};

export const RIGHT_ANSWER_COLOR = 'rgba(0, 150, 136, 0.6)';
export const WRONG_ANSWER_COLOR = 'rgba(246, 100, 100, 0.6)';

export const QRL_COLORS = [RIGHT_ANSWER_COLOR, WRONG_ANSWER_COLOR];

export const QRL_ORGANIZER_LABELS = ['Jouers Actifs', 'Joueurs Inactifs'];
export const QRL_LEADERBOARD_LABELS = ['100%', '50%', '0%'];
