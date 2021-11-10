/**
 * CountQueryResult is the result of count(*) query
 */
export interface CountQueryResult {
    count: string;
}

/**
 * GroupInfo for GroupEvent
 */
export interface GroupInfo {
    name: string;
    description: string | null;
    tags: string[];
    capacity: number;
}
