export const GetNullableSQLString = (value: string | null, nullString?: string) => {
    if (value === null || value === nullString) {
        return 'NULL';
    }
    return `'${value}'`;
};
