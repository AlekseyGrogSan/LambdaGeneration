const FLAG_EXPLANATIONS = {
    unsafe_image: 'На изображении обнаружен недопустимый визуальный контент (жестокость, кровь, обнажение или сексуальный контент).',
    offtopic: 'Текст не относится к тематике IT, математики или смежных технических областей.',
    profanity: 'Обнаружена нецензурная или оскорбительная лексика.',
    sexual_content: 'Обнаружен сексуальный контент.',
    adult_content: 'Обнаружен контент для взрослых.',
    nudity: 'Обнаружены элементы обнажения.',
    violence: 'Обнаружены сцены насилия или жестокости.',
    gore: 'Обнаружен шок-контент или сцены с кровью и травмами.',
    blood: 'Обнаружены сцены с кровью.',
    scam: 'Обнаружены признаки мошенничества или нелегальных схем.',
    discrimination: 'Обнаружены элементы дискриминации или разжигания ненависти.',
    spam: 'Обнаружены признаки спама.',
};

const toDisplayString = (value) => {
    if (typeof value !== 'string') return '';
    return value.trim();
};

const dedupe = (items) => Array.from(new Set(items.filter(Boolean)));

export const extractModerationFlags = (payload) => {
    if (!payload || typeof payload !== 'object') return [];

    if (Array.isArray(payload.flags)) {
        return dedupe(payload.flags.map((f) => toDisplayString(f)));
    }

    return [];
};

export const explainModerationFlag = (flag) => {
    const normalized = toDisplayString(flag).toLowerCase();
    if (!normalized) return '';
    return FLAG_EXPLANATIONS[normalized] || `Флаг модерации: ${flag}`;
};

export const buildModerationErrorMessage = (payload) => {
    if (!payload || typeof payload !== 'object') return '';

    const flags = extractModerationFlags(payload);
    if (!flags.length) return '';

    const baseError = toDisplayString(payload.error) || 'Контент не прошел модерацию.';
    const explanations = dedupe(flags.map(explainModerationFlag));

    if (!explanations.length) {
        return `${baseError} Флаги: ${flags.join(', ')}.`;
    }

    return `${baseError} Причины: ${explanations.join(' ')} Флаги: ${flags.join(', ')}.`;
};
