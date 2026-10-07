export function sum(a: number, b: number): number {
    return a + b
}

export function convert(input: number): string {
    let res: string = ""

    if (input % 3 !== 0 && input % 5 !== 0) res = input.toString()
    if (input % 3 === 0) res += "fizz"
    if (input % 5 === 0) res += "buzz"
    return res
}
