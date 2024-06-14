

class Util {
    static euclideanDistance = (a: number[], b: number[]) => Math.sqrt(a.map((x, i) => Math.pow(a[i] - b[i], 2)).reduce((m, n) => m + n))
    static extendArray<T>(arr: T[], desiredLength: number, fillValue: T): T[] {
        while (arr.length < desiredLength) {
            arr.push(fillValue);
        }
        return arr;
    }
}

export default Util