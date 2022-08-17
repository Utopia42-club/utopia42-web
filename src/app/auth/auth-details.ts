export class

AuthDetails
{
    public static readonly STORAGE_KEY = 'AUTH_DETAILS';

    constructor(public readonly walletId: string,
                public readonly token: string)
    {
    }

    public saveToStorage(): void
    {
        localStorage.setItem(AuthDetails.STORAGE_KEY, JSON.stringify(this));
    }

    public static removeFromStorage():void{
        localStorage.removeItem(AuthDetails.STORAGE_KEY);
    }

    public static loadFromStorage(): AuthDetails
    {
        const data = localStorage.getItem(AuthDetails.STORAGE_KEY);
        if (data == null) return null;
        const parsed = JSON.parse(data) as AuthDetails;
        return new AuthDetails(parsed.walletId, parsed.token);
    }
}
