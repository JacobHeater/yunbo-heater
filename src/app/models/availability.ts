export interface Availability {
    available: boolean;
    spotsAvailable?: number;
    waitingListAvailable?: boolean;
    waitingListSpotsAvailable?: number;
}
