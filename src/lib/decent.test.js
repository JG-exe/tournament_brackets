import {convert, sum} from "./sum.ts";
import {expect, test, describe} from "vitest";

test("adds 1 and 2 to equal 3", () =>
    expect(sum(1, 2)).toBe(3)
)

describe("fizzbuzz converter", () => {
    test("input 1 should return 1", () => {
        expect(convert(1)).toBe("1")
    })

    test("input 3 should return fizz", () => {
        expect(convert(3)).toBe("fizz")
    })

    test("input 5 should return buzz", () => {
        expect(convert(5)).toBe("buzz")
    })

    test("input 15 should return fizzbuzz", () => {
        expect(convert(15)).toBe("fizzbuzz")
    })

    test("input %3 should return a fizz", () => {
        expect(convert(6)).toBe("fizz")
    })

    test("input 2 should return 2", () => {
        //     arrange
        //     act
        //     assert
        const input_2 = 2 //needed conditions for test. Kan API calls zijn (incl json obj)

        //     act = function under test (kan met meerdere functies vb api call + do shit)
        const output = convert(input_2)

        //     assert
        expect(output).toBe("2") // zorg ervoor dat het duidelijk is wat alles moet zijn!!!
    })

    test("input %5 should return buzz", () => {
        expect(convert(10)).toBe("buzz")
    })

    test("input %15 should return fizzbuzz", () => {
        expect(convert(30)).toBe("fizzbuzz")
    })
})

describe("fizzbuzz converter but better", () => {
    test.for([
        {input: 1, expected: "1"},
        {input: 2, expected: "2"},
        {input: 3, expected: "fizz"},
        {input: 5, expected: "buzz"},
        {input: 6, expected: "fizz"},
        {input: 10, expected: "buzz"},
        {input: 15, expected: "fizzbuzz"},
        {input: 30, expected: "fizzbuzz"}
    ])('input: $input expected: $expected',
        ({input, expected}) => {
        expect(convert(input)).toBe(expected);
        })
})