declare module 'state-country' {
    export interface Country {
        id: string;
        name: string;
    }

    export interface State {
        id: string;
        name: string;
        country: string;
    }

    export interface StateCountry {
        getAllCountries(): Country[];
        getAllStates(): State[];
        getAllStatesInCountry(countryName: string): State[];
        searchStates(query: string): State[];
        searchCountries(query: string): Country[];
        searchStatesInCountry(countryName: string, query: string): State[];
    }

    const stateCountry: StateCountry;
    export default stateCountry;
}