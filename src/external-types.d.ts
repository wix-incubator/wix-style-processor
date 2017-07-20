declare var expect: Function;
declare module '*.scss';
declare module '*.json';

interface Window {
    Wix: any;
    CSS: {supports: Function}
    styleProcessor?: any;
    changeStyles?: any;
}

interface ITPAParams {
    colors: { [index: string]: { value: string } };
    numbers: { [index: string]: number };
    fonts: Object;
    strings: Object;
}
