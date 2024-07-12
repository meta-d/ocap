export function mapLangToLocale(lang) {
    switch (lang) {
        case 'en':
            return 'en-US';
        case 'zh':
        case 'zh-CN':
            return 'zh-Hans';
        default:
            return lang;
    }
}