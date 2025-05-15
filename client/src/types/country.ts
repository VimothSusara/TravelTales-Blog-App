export interface Country {
    name: string
    capital: string
    currencies: {
        [currencyCode: string] : {
            symbol: string
            name: string
        }
    }
    flag: string
    languages: {
        [languageCode: string] : string
    }
    flags: {
        png: string
        svg: string
        alt: string
    }
    region: string
    subregion: string
}